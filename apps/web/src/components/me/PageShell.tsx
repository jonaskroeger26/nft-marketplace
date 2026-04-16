import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";

type PageShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  /** e.g. "Trade" for breadcrumb-style subtitle */
  eyebrow?: string;
};

export function PageShell({
  title,
  description,
  children,
  eyebrow,
}: PageShellProps) {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:py-10">
      {eyebrow && (
        <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">
          {description}
        </p>
      )}
      <div className="mt-8">{children}</div>
    </div>
  );
}

export function MePanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-[#111111] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

export function MeLabel({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-medium uppercase tracking-wide text-neutral-500"
    >
      {children}
    </label>
  );
}

export function MeInput({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`mt-1.5 w-full rounded-xl border border-white/[0.1] bg-[#0b0b0b] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-[#e42575]/50 focus:ring-2 focus:ring-[#e42575]/20 ${className}`}
    />
  );
}

export function MeButton({
  children,
  variant = "primary",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e42575]/40 disabled:opacity-40";
  const styles = {
    primary:
      "bg-gradient-to-r from-[#e42575] to-[#9333ea] text-white shadow-lg shadow-purple-900/20 hover:brightness-110",
    secondary:
      "border border-white/[0.12] bg-white/[0.04] text-white hover:bg-white/[0.08]",
    ghost: "text-neutral-300 hover:bg-white/[0.06] hover:text-white",
  };
  return (
    <button
      type="button"
      className={`${base} ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
