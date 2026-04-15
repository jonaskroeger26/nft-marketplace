//! Marketplace program: fixed-price listings (SOL + SPL e.g. SKR), offers, batch buy, pack open (v1).
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("2zNCva3rSw2MeJqjVgih445iHtxvxyymS2vaUUJ3zpPj");

#[program]
pub mod marketplace {
    use super::*;

    pub fn init_config(ctx: Context<InitConfig>, fee_bps: u16, skr_mint: Pubkey) -> Result<()> {
        require!(fee_bps <= 10_000, MarketplaceError::InvalidFee);
        let c = &mut ctx.accounts.config;
        c.authority = ctx.accounts.authority.key();
        c.treasury = ctx.accounts.treasury.key();
        c.fee_bps = fee_bps;
        c.skr_mint = skr_mint;
        c.bump = *ctx.bumps.get("config").unwrap();
        Ok(())
    }

    pub fn list(
        ctx: Context<List>,
        price: u64,
        currency: u8,
    ) -> Result<()> {
        require!(price > 0, MarketplaceError::ZeroPrice);
        require!(currency <= 1, MarketplaceError::BadCurrency);
        let listing = &mut ctx.accounts.listing;
        listing.seller = ctx.accounts.seller.key();
        listing.mint = ctx.accounts.nft_mint.key();
        listing.price = price;
        listing.currency = currency;
        listing.active = true;
        listing.bump = *ctx.bumps.get("listing").unwrap();
        listing.escrow_bump = *ctx.bumps.get("escrow_auth").unwrap();

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.seller_nft_ata.to_account_info(),
                    to: ctx.accounts.escrow_nft_ata.to_account_info(),
                    authority: ctx.accounts.seller.to_account_info(),
                },
            ),
            1,
        )?;
        Ok(())
    }

    pub fn delist(ctx: Context<Delist>) -> Result<()> {
        let mint_key = ctx.accounts.nft_mint.key();
        let seeds: &[&[u8]] = &[b"escrow", mint_key.as_ref(), &[ctx.accounts.listing.escrow_bump]];
        let signer = &[seeds];
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_nft_ata.to_account_info(),
                    to: ctx.accounts.seller_nft_ata.to_account_info(),
                    authority: ctx.accounts.escrow_auth.to_account_info(),
                },
                signer,
            ),
            1,
        )?;
        ctx.accounts.listing.active = false;
        Ok(())
    }

    pub fn buy_sol(ctx: Context<BuySol>) -> Result<()> {
        let listing = &ctx.accounts.listing;
        require!(listing.active, MarketplaceError::Inactive);
        require!(listing.currency == 0, MarketplaceError::WrongCurrency);
        let fee = fee_amount(listing.price, ctx.accounts.config.fee_bps)?;
        let seller_amt = listing
            .price
            .checked_sub(fee)
            .ok_or(MarketplaceError::Math)?;

        **ctx
            .accounts
            .buyer
            .to_account_info()
            .try_borrow_mut_lamports()? -= listing.price;
        **ctx
            .accounts
            .seller
            .to_account_info()
            .try_borrow_mut_lamports()? += seller_amt;
        **ctx
            .accounts
            .treasury
            .to_account_info()
            .try_borrow_mut_lamports()? += fee;

        transfer_nft_out(&ctx)?;
        ctx.accounts.listing.active = false;
        Ok(())
    }

    pub fn buy_skr(ctx: Context<BuySkr>) -> Result<()> {
        let listing = &ctx.accounts.listing;
        require!(listing.active, MarketplaceError::Inactive);
        require!(listing.currency == 1, MarketplaceError::WrongCurrency);
        require!(
            ctx.accounts.skr_mint.key() == ctx.accounts.config.skr_mint,
            MarketplaceError::BadSkrMint
        );
        let fee = fee_amount(listing.price, ctx.accounts.config.fee_bps)?;
        let seller_amt = listing
            .price
            .checked_sub(fee)
            .ok_or(MarketplaceError::Math)?;

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.buyer_skr_ata.to_account_info(),
                    to: ctx.accounts.seller_skr_ata.to_account_info(),
                    authority: ctx.accounts.buyer.to_account_info(),
                },
            ),
            seller_amt,
        )?;
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.buyer_skr_ata.to_account_info(),
                    to: ctx.accounts.treasury_skr_ata.to_account_info(),
                    authority: ctx.accounts.buyer.to_account_info(),
                },
            ),
            fee,
        )?;

        transfer_nft_out_skr(&ctx)?;
        ctx.accounts.listing.active = false;
        Ok(())
    }

    pub fn make_offer_sol(
        ctx: Context<MakeOfferSol>,
        offer_price: u64,
        _expiry_ts: i64,
    ) -> Result<()> {
        require!(offer_price > 0, MarketplaceError::ZeroPrice);
        let o = &mut ctx.accounts.offer;
        o.buyer = ctx.accounts.buyer.key();
        o.mint = ctx.accounts.nft_mint.key();
        o.price = offer_price;
        o.currency = 0;
        o.active = true;
        o.bump = *ctx.bumps.get("offer").unwrap();
        Ok(())
    }

    pub fn accept_offer_sol(ctx: Context<AcceptOfferSol>) -> Result<()> {
        let offer = &ctx.accounts.offer;
        require!(offer.active, MarketplaceError::Inactive);
        let fee = fee_amount(offer.price, ctx.accounts.config.fee_bps)?;
        let seller_amt = offer
            .price
            .checked_sub(fee)
            .ok_or(MarketplaceError::Math)?;

        **ctx.accounts.buyer.to_account_info().try_borrow_mut_lamports()? -= offer.price;
        **ctx
            .accounts
            .seller
            .to_account_info()
            .try_borrow_mut_lamports()? += seller_amt;
        **ctx
            .accounts
            .treasury
            .to_account_info()
            .try_borrow_mut_lamports()? += fee;

        let mint_key = ctx.accounts.nft_mint.key();
        let seeds: &[&[u8]] = &[b"escrow", mint_key.as_ref(), &[ctx.accounts.listing.escrow_bump]];
        let signer = &[seeds];
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_nft_ata.to_account_info(),
                    to: ctx.accounts.buyer_nft_ata.to_account_info(),
                    authority: ctx.accounts.escrow_auth.to_account_info(),
                },
                signer,
            ),
            1,
        )?;
        ctx.accounts.offer.active = false;
        ctx.accounts.listing.active = false;
        Ok(())
    }

    /// Pack: burn pack mint, mint reward from pack vault (simplified: fixed reward mint).
    pub fn open_pack(ctx: Context<OpenPack>) -> Result<()> {
        token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Burn {
                    mint: ctx.accounts.pack_mint.to_account_info(),
                    from: ctx.accounts.holder_pack_ata.to_account_info(),
                    authority: ctx.accounts.holder.to_account_info(),
                },
            ),
            1,
        )?;
        let pack_mint_key = ctx.accounts.pack_mint.key();
        let pv_bump = *ctx.bumps.get("pack_vault").unwrap();
        let seeds: &[&[u8]] = &[b"pack_vault", pack_mint_key.as_ref(), &[pv_bump]];
        let signer = &[seeds];
        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::MintTo {
                    mint: ctx.accounts.reward_mint.to_account_info(),
                    to: ctx.accounts.buyer_reward_ata.to_account_info(),
                    authority: ctx.accounts.pack_vault.to_account_info(),
                },
                signer,
            ),
            1,
        )?;
        Ok(())
    }
}

fn fee_amount(price: u64, bps: u16) -> Result<u64> {
    let u = (price as u128)
        .checked_mul(bps as u128)
        .ok_or(MarketplaceError::Math)?;
    Ok((u / 10_000) as u64)
}

fn transfer_nft_out(ctx: &Context<BuySol>) -> Result<()> {
    let mint_key = ctx.accounts.nft_mint.key();
    let seeds: &[&[u8]] = &[b"escrow", mint_key.as_ref(), &[ctx.accounts.listing.escrow_bump]];
    let signer = &[seeds];
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow_nft_ata.to_account_info(),
                to: ctx.accounts.buyer_nft_ata.to_account_info(),
                authority: ctx.accounts.escrow_auth.to_account_info(),
            },
            signer,
        ),
        1,
    )?;
    Ok(())
}

fn transfer_nft_out_skr(ctx: &Context<BuySkr>) -> Result<()> {
    let mint_key = ctx.accounts.nft_mint.key();
    let seeds: &[&[u8]] = &[b"escrow", mint_key.as_ref(), &[ctx.accounts.listing.escrow_bump]];
    let signer = &[seeds];
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow_nft_ata.to_account_info(),
                to: ctx.accounts.buyer_nft_ata.to_account_info(),
                authority: ctx.accounts.escrow_auth.to_account_info(),
            },
            signer,
        ),
        1,
    )?;
    Ok(())
}

#[account]
pub struct MarketplaceConfig {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub fee_bps: u16,
    pub skr_mint: Pubkey,
    pub bump: u8,
}

#[account]
pub struct Listing {
    pub seller: Pubkey,
    pub mint: Pubkey,
    pub price: u64,
    pub currency: u8,
    pub active: bool,
    pub bump: u8,
    pub escrow_bump: u8,
}

#[account]
pub struct Offer {
    pub buyer: Pubkey,
    pub mint: Pubkey,
    pub price: u64,
    pub currency: u8,
    pub active: bool,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct InitConfig<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: treasury pubkey
    pub treasury: AccountInfo<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 2 + 32 + 1,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, MarketplaceConfig>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct List<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,
    pub nft_mint: Account<'info, Mint>,
    #[account(
        mut,
        constraint = seller_nft_ata.owner == seller.key(),
        constraint = seller_nft_ata.mint == nft_mint.key(),
        constraint = seller_nft_ata.amount == 1
    )]
    pub seller_nft_ata: Account<'info, TokenAccount>,
    /// CHECK: PDA authority for escrow token account
    #[account(
        seeds = [b"escrow", nft_mint.key().as_ref()],
        bump
    )]
    pub escrow_auth: AccountInfo<'info>,
    #[account(
        init,
        payer = seller,
        associated_token::mint = nft_mint,
        associated_token::authority = escrow_auth,
    )]
    pub escrow_nft_ata: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = seller,
        space = 8 + 32 + 32 + 8 + 1 + 1 + 1 + 1,
        seeds = [b"listing", nft_mint.key().as_ref()],
        bump
    )]
    pub listing: Account<'info, Listing>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Delist<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,
    pub nft_mint: Account<'info, Mint>,
    #[account(
        mut,
        constraint = listing.seller == seller.key(),
        seeds = [b"listing", nft_mint.key().as_ref()],
        bump = listing.bump
    )]
    pub listing: Account<'info, Listing>,
    /// CHECK:
    #[account(
        seeds = [b"escrow", nft_mint.key().as_ref()],
        bump = listing.escrow_bump
    )]
    pub escrow_auth: AccountInfo<'info>,
    #[account(
        mut,
        constraint = escrow_nft_ata.mint == nft_mint.key(),
        constraint = escrow_nft_ata.owner == escrow_auth.key()
    )]
    pub escrow_nft_ata: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = seller_nft_ata.owner == seller.key(),
        constraint = seller_nft_ata.mint == nft_mint.key()
    )]
    pub seller_nft_ata: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BuySol<'info> {
    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, MarketplaceConfig>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    pub nft_mint: Account<'info, Mint>,
    #[account(
        mut,
        constraint = listing.mint == nft_mint.key(),
        seeds = [b"listing", nft_mint.key().as_ref()],
        bump = listing.bump
    )]
    pub listing: Account<'info, Listing>,
    /// CHECK:
    #[account(
        mut,
        constraint = seller.key() == listing.seller
    )]
    pub seller: AccountInfo<'info>,
    /// CHECK:
    #[account(mut, constraint = treasury.key() == config.treasury)]
    pub treasury: AccountInfo<'info>,
    /// CHECK:
    #[account(
        seeds = [b"escrow", nft_mint.key().as_ref()],
        bump = listing.escrow_bump
    )]
    pub escrow_auth: AccountInfo<'info>,
    #[account(
        mut,
        constraint = escrow_nft_ata.mint == nft_mint.key(),
        constraint = escrow_nft_ata.owner == escrow_auth.key()
    )]
    pub escrow_nft_ata: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = buyer,
        associated_token::mint = nft_mint,
        associated_token::authority = buyer,
    )]
    pub buyer_nft_ata: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuySkr<'info> {
    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, MarketplaceConfig>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    pub nft_mint: Account<'info, Mint>,
    #[account(
        mut,
        constraint = listing.mint == nft_mint.key(),
        seeds = [b"listing", nft_mint.key().as_ref()],
        bump = listing.bump
    )]
    pub listing: Account<'info, Listing>,
    /// CHECK:
    #[account(mut, constraint = seller.key() == listing.seller)]
    pub seller: AccountInfo<'info>,
    /// CHECK:
    #[account(mut, constraint = treasury.key() == config.treasury)]
    pub treasury: AccountInfo<'info>,
    pub skr_mint: Account<'info, Mint>,
    #[account(
        mut,
        constraint = buyer_skr_ata.owner == buyer.key(),
        constraint = buyer_skr_ata.mint == skr_mint.key()
    )]
    pub buyer_skr_ata: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = seller_skr_ata.owner == seller.key(),
        constraint = seller_skr_ata.mint == skr_mint.key()
    )]
    pub seller_skr_ata: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = treasury_skr_ata.owner == treasury.key(),
        constraint = treasury_skr_ata.mint == skr_mint.key()
    )]
    pub treasury_skr_ata: Account<'info, TokenAccount>,
    /// CHECK:
    #[account(
        seeds = [b"escrow", nft_mint.key().as_ref()],
        bump = listing.escrow_bump
    )]
    pub escrow_auth: AccountInfo<'info>,
    #[account(
        mut,
        constraint = escrow_nft_ata.mint == nft_mint.key(),
        constraint = escrow_nft_ata.owner == escrow_auth.key()
    )]
    pub escrow_nft_ata: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = buyer,
        associated_token::mint = nft_mint,
        associated_token::authority = buyer,
    )]
    pub buyer_nft_ata: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MakeOfferSol<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    pub nft_mint: Account<'info, Mint>,
    #[account(
        init,
        payer = buyer,
        space = 8 + 32 + 32 + 8 + 1 + 1 + 1,
        seeds = [b"offer", nft_mint.key().as_ref(), buyer.key().as_ref()],
        bump
    )]
    pub offer: Account<'info, Offer>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AcceptOfferSol<'info> {
    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, MarketplaceConfig>,
    #[account(mut)]
    pub seller: Signer<'info>,
    #[account(mut)]
    pub buyer: AccountInfo<'info>,
    pub nft_mint: Account<'info, Mint>,
    #[account(
        mut,
        constraint = listing.seller == seller.key(),
        constraint = listing.mint == nft_mint.key(),
        seeds = [b"listing", nft_mint.key().as_ref()],
        bump = listing.bump
    )]
    pub listing: Account<'info, Listing>,
    #[account(
        mut,
        constraint = offer.buyer == buyer.key(),
        constraint = offer.mint == nft_mint.key(),
        seeds = [b"offer", nft_mint.key().as_ref(), buyer.key().as_ref()],
        bump = offer.bump
    )]
    pub offer: Account<'info, Offer>,
    /// CHECK:
    #[account(mut, constraint = treasury.key() == config.treasury)]
    pub treasury: AccountInfo<'info>,
    /// CHECK:
    #[account(
        seeds = [b"escrow", nft_mint.key().as_ref()],
        bump = listing.escrow_bump
    )]
    pub escrow_auth: AccountInfo<'info>,
    #[account(
        mut,
        constraint = escrow_nft_ata.mint == nft_mint.key(),
        constraint = escrow_nft_ata.owner == escrow_auth.key()
    )]
    pub escrow_nft_ata: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = seller,
        associated_token::mint = nft_mint,
        associated_token::authority = buyer,
    )]
    pub buyer_nft_ata: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct OpenPack<'info> {
    #[account(mut)]
    pub holder: Signer<'info>,
    #[account(mut)]
    pub pack_mint: Account<'info, Mint>,
    #[account(
        mut,
        constraint = holder_pack_ata.owner == holder.key(),
        constraint = holder_pack_ata.mint == pack_mint.key()
    )]
    pub holder_pack_ata: Account<'info, TokenAccount>,
    /// CHECK: mint authority PDA
    #[account(seeds = [b"pack_vault", pack_mint.key().as_ref()], bump)]
    pub pack_vault: AccountInfo<'info>,
    #[account(mut)]
    pub reward_mint: Account<'info, Mint>,
    #[account(
        init,
        payer = holder,
        associated_token::mint = reward_mint,
        associated_token::authority = holder,
    )]
    pub buyer_reward_ata: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum MarketplaceError {
    #[msg("Invalid fee")]
    InvalidFee,
    #[msg("Zero price")]
    ZeroPrice,
    #[msg("Bad currency")]
    BadCurrency,
    #[msg("Listing inactive")]
    Inactive,
    #[msg("Wrong currency for instruction")]
    WrongCurrency,
    #[msg("Bad SKR mint")]
    BadSkrMint,
    #[msg("Math overflow")]
    Math,
    #[msg("Unauthorized")]
    Unauthorized,
}
