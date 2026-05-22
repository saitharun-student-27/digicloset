import { ArrowLeft, Shirt } from "lucide-react";
import { Link } from "react-router-dom";

const serifTitleStyle = {
  fontFamily: 'Georgia, "Times New Roman", serif',
};

export function BrandLockup({
  label = "PRIVATE WARDROBE MEMORY",
  className = "",
}) {
  return (
    <div className={`text-center ${className}`}>
      <div
        className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/5 bg-white/65 text-[1.55rem] text-charcoal shadow-sm"
        style={serifTitleStyle}
      >
        DC
      </div>
      <p
        className="mt-2.5 text-[2.15rem] leading-none text-charcoal sm:text-[2.35rem]"
        style={serifTitleStyle}
      >
        DigiCloset
      </p>
      <p className="mt-2.5 text-[0.67rem] font-semibold uppercase tracking-[0.24em] text-stone/85">
        {label}
      </p>
    </div>
  );
}

export function AuthPhoneFrame({ children }) {
  return (
    <div className="auth-canvas mx-auto flex min-h-[100vh] min-h-[100dvh] w-full items-center justify-center overflow-x-hidden px-3 py-3 sm:px-6 sm:py-8">
      <div className="relative w-full max-w-[30rem] rounded-none bg-transparent sm:rounded-[2.6rem] sm:border sm:border-white/70 sm:bg-[linear-gradient(180deg,rgba(255,252,247,0.98)_0%,rgba(247,242,233,0.98)_100%)] sm:shadow-[0_24px_70px_rgba(29,29,27,0.12)]">
        <div className="pointer-events-none absolute inset-0 hidden rounded-[2.6rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.88)_0%,transparent_42%)] sm:block" />
        <div className="relative min-h-[100vh] min-h-[100dvh] overflow-hidden rounded-none bg-[linear-gradient(180deg,rgba(255,252,247,0.96)_0%,rgba(247,242,233,0.98)_100%)] sm:min-h-[49rem] sm:rounded-[2.6rem]">
          {children}
        </div>
      </div>
    </div>
  );
}

export function CurvedTopSurface() {
  return (
    <>
      <div className="absolute inset-x-[-16%] top-[-7rem] h-44 rounded-b-[100%] border border-brass/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(249,245,238,0.98)_100%)]" />
      <div className="absolute inset-x-[-10%] top-[-6.15rem] h-36 rounded-b-[100%] border border-brass/10" />
      <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.76)_0%,transparent_62%)]" />
    </>
  );
}

export function AuthShell({
  backTo,
  backLabel = "Back",
  title,
  subtitle,
  footer,
  children,
}) {
  return (
    <AuthPhoneFrame>
      <div className="relative min-h-[100vh] min-h-[100dvh] bg-transparent sm:min-h-[49rem]">
        <CurvedTopSurface />

        {backTo ? (
          <div className="relative z-20 px-5 pt-[max(0.85rem,env(safe-area-inset-top))] sm:px-6">
            <Link
              to={backTo}
              aria-label={backLabel}
              className="inline-flex h-11 min-h-[var(--touch-target-min)] w-11 min-w-[var(--touch-target-min)] items-center justify-center rounded-full border border-black/5 bg-white/68 text-charcoal shadow-sm transition hover:bg-white/82"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="pt-[max(1rem,env(safe-area-inset-top))]" />
        )}

        <div className="relative z-10 flex min-h-[calc(100vh-3rem)] min-h-[calc(100dvh-3rem)] flex-col px-6 pb-8 pt-2 sm:min-h-[46rem] sm:px-8 sm:pb-10">
          <BrandLockup className="mt-1" />

          <div className="mx-auto mt-5 w-full max-w-[23rem] text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-[1rem] border border-brass/30 bg-[#f8f1e7] text-brass shadow-sm">
              <Shirt className="h-4.5 w-4.5" />
            </div>
            <h1
              className="mt-4 text-[1.95rem] leading-[1.05] text-charcoal sm:text-[2.1rem]"
              style={serifTitleStyle}
            >
              {title}
            </h1>
            <p className="mt-3 text-[0.96rem] leading-7 text-stone">{subtitle}</p>
          </div>

          <div className="mx-auto mt-6 w-full max-w-[23rem] flex-1">{children}</div>

          {footer ? (
            <div className="mx-auto mt-5 w-full max-w-[23rem] text-center text-sm leading-6 text-stone">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </AuthPhoneFrame>
  );
}

export default AuthShell;
