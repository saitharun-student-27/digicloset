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
        className="mx-auto inline-flex h-12 w-12 items-center justify-center text-[1.8rem] text-charcoal"
        style={serifTitleStyle}
      >
        DC
      </div>
      <p
        className="mt-2.5 text-[2.7rem] leading-none text-charcoal sm:text-[2.95rem]"
        style={serifTitleStyle}
      >
        DigiCloset
      </p>
      <p className="mt-3 text-[0.72rem] font-medium uppercase tracking-[0.26em] text-stone">
        {label}
      </p>
    </div>
  );
}

export function AuthPhoneFrame({ children }) {
  return (
    <div className="mx-auto flex min-h-[100vh] min-h-[100dvh] w-full items-center justify-center overflow-x-hidden bg-[radial-gradient(circle_at_top,#f7f1e7_0%,#f8f5ee_42%,#efe6d8_100%)] px-3 py-3 sm:px-6 sm:py-8">
      <div className="relative w-full max-w-[28.25rem] rounded-none bg-transparent sm:rounded-[2.75rem] sm:border sm:border-white/70 sm:bg-[linear-gradient(180deg,rgba(255,252,247,0.98)_0%,rgba(247,242,233,0.98)_100%)] sm:shadow-[0_26px_75px_rgba(29,29,27,0.14)]">
        <div className="pointer-events-none absolute inset-0 hidden rounded-[2.75rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9)_0%,transparent_40%)] sm:block" />
        <div className="relative min-h-[100vh] min-h-[100dvh] overflow-hidden rounded-none bg-[linear-gradient(180deg,rgba(255,252,247,0.96)_0%,rgba(247,242,233,0.98)_100%)] sm:min-h-[51rem] sm:rounded-[2.75rem]">
          {children}
        </div>
      </div>
    </div>
  );
}

export function CurvedTopSurface() {
  return (
    <>
      <div className="absolute inset-x-[-24%] top-[-8rem] h-48 rounded-b-[100%] border border-brass/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(249,245,238,0.98)_100%)]" />
      <div className="absolute inset-x-[-16%] top-[-7.25rem] h-40 rounded-b-[100%] border border-brass/10" />
      <div className="absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.78)_0%,transparent_62%)]" />
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
      <CurvedTopSurface />

      {backTo ? (
        <div className="relative z-20 px-5 pt-[max(0.85rem,env(safe-area-inset-top))] sm:px-6">
          <Link
            to={backTo}
            aria-label={backLabel}
            className="inline-flex h-11 min-h-[var(--touch-target-min)] w-11 min-w-[var(--touch-target-min)] items-center justify-center rounded-full text-charcoal transition hover:bg-white/60"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>
      ) : (
        <div className="pt-[max(1rem,env(safe-area-inset-top))]" />
      )}

      <div className="relative z-10 flex min-h-[calc(100vh-3rem)] min-h-[calc(100dvh-3rem)] flex-col px-6 pb-8 pt-2 sm:min-h-[48rem] sm:px-8 sm:pb-10">
        <BrandLockup className="mt-2" />

        <div className="mx-auto mt-5 w-full max-w-[22rem] text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[1rem] border border-brass/35 bg-[#f8f1e7] text-brass">
            <Shirt className="h-5 w-5" />
          </div>
          <h1
            className="mt-5 text-[2.15rem] leading-[1.06] text-charcoal"
            style={serifTitleStyle}
          >
            {title}
          </h1>
          <p className="mt-3 text-[0.98rem] leading-7 text-stone">{subtitle}</p>
        </div>

        <div className="mx-auto mt-6 w-full max-w-[22rem] flex-1">{children}</div>

        {footer ? (
          <div className="mx-auto mt-5 w-full max-w-[22rem] text-center text-sm leading-6 text-stone">
            {footer}
          </div>
        ) : null}
      </div>
    </AuthPhoneFrame>
  );
}

export default AuthShell;
