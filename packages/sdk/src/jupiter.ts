/**
 * Jupiter v6 quote + swap (dual SKR path: swap into SOL or USDC before marketplace buy).
 * See https://station.jup.ag/docs/apis/swap-api
 */

export type JupiterQuoteResponse = {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  priceImpactPct: string;
};

export async function getQuote(params: {
  inputMint: string;
  outputMint: string;
  amount: string;
  slippageBps: number;
}): Promise<JupiterQuoteResponse> {
  const u = new URL("https://quote-api.jup.ag/v6/quote");
  u.searchParams.set("inputMint", params.inputMint);
  u.searchParams.set("outputMint", params.outputMint);
  u.searchParams.set("amount", params.amount);
  u.searchParams.set("slippageBps", String(params.slippageBps));
  const res = await fetch(u.toString());
  if (!res.ok) throw new Error(`Jupiter quote failed: ${res.status}`);
  return res.json() as Promise<JupiterQuoteResponse>;
}

export async function getSwapTransaction(params: {
  quoteResponse: unknown;
  userPublicKey: string;
  wrapAndUnwrapSol?: boolean;
}): Promise<{ swapTransaction: string }> {
  const res = await fetch("https://quote-api.jup.ag/v6/swap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quoteResponse: params.quoteResponse,
      userPublicKey: params.userPublicKey,
      wrapAndUnwrapSol: params.wrapAndUnwrapSol ?? true,
    }),
  });
  if (!res.ok) throw new Error(`Jupiter swap failed: ${res.status}`);
  return res.json() as Promise<{ swapTransaction: string }>;
}
