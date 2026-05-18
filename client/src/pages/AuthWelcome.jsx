import { Link } from "react-router-dom";

import { AuthPhoneFrame, BrandLockup } from "../components/AuthShell.jsx";

const serifTitleStyle = {
  fontFamily: 'Georgia, "Times New Roman", serif',
};

function WardrobeScene() {
  return (
    <div className="relative flex-1 overflow-hidden px-7 pt-[max(1.45rem,env(safe-area-inset-top)+0.75rem)] sm:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.65)_0%,transparent_48%)]" />
      <div className="absolute left-[-18%] top-12 h-px w-[70%] rotate-12 bg-brass/25" />
      <div className="absolute right-[-10%] top-16 h-px w-[50%] bg-brass/20" />

      <BrandLockup label="YOUR WARDROBE," className="relative z-10 mt-1" />
      <p
        className="relative z-10 mt-2 text-center text-[2.1rem] italic leading-none text-brass/90"
        style={serifTitleStyle}
      >
        remembered.
      </p>

      <div className="relative z-10 mt-6 flex justify-start pl-2">
        <div className="relative h-56 w-[16rem]">
          <div className="absolute left-7 top-1 h-56 w-[1px] bg-brass/40" />
          <div className="absolute left-7 top-1 h-[1px] w-40 bg-brass/40" />
          <div className="absolute left-[11.25rem] top-1 h-40 w-[1px] bg-brass/30" />
          {[
            { left: "2.15rem", width: "2.5rem", color: "#7b583d", height: "9.6rem" },
            { left: "4.75rem", width: "2.7rem", color: "#d9c9af", height: "9rem" },
            { left: "7.55rem", width: "2.7rem", color: "#f0e6d7", height: "9.9rem" },
            { left: "10.25rem", width: "2.6rem", color: "#403023", height: "10.25rem" },
          ].map((garment, index) => (
            <div
              key={garment.left}
              className="absolute top-7 rounded-b-[1.45rem] rounded-t-[1rem] shadow-[0_14px_28px_rgba(17,17,15,0.12)]"
              style={{
                left: garment.left,
                width: garment.width,
                height: garment.height,
                background: garment.color,
                transform: `rotate(${index === 0 ? -2 : index === 2 ? 1.5 : 0}deg)`,
              }}
            >
              <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full border border-brass/35 bg-transparent" />
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-20 right-8 h-36 w-24 rounded-[2rem] border border-brass/25 bg-white/35 shadow-soft" />
      <div className="pointer-events-none absolute bottom-28 right-16 h-20 w-16 rounded-full bg-brass/10 blur-2xl" />
    </div>
  );
}

export default function AuthWelcome() {
  return (
    <AuthPhoneFrame>
      <div className="relative flex min-h-[100vh] min-h-[100dvh] flex-col bg-[linear-gradient(180deg,#efe5d7_0%,#f8f4ed_55%,#f7f2ea_100%)] sm:min-h-[51rem]">
        <WardrobeScene />

        <section className="relative z-10 -mt-3 rounded-t-[3rem] border-t border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(248,245,238,0.98)_100%)] px-7 pb-[calc(1.6rem+env(safe-area-inset-bottom))] pt-6 shadow-[0_-20px_50px_rgba(29,29,27,0.09)] sm:px-8">
          <div className="absolute inset-x-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white/95" />
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[1rem] border border-brass/30 bg-[#f8f1e7] text-brass">
            <span className="text-lg">⌂</span>
          </div>
          <p
            className="mx-auto mt-4 max-w-[18rem] text-center text-[1.7rem] leading-tight text-charcoal"
            style={serifTitleStyle}
          >
            A private space to save complete looks and rediscover what works
            for you.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-charcoal" />
            <span className="h-2.5 w-2.5 rounded-full bg-black/12" />
            <span className="h-2.5 w-2.5 rounded-full bg-black/12" />
          </div>

          <Link
            to="/login"
            className="mt-5 inline-flex h-14 w-full items-center justify-center rounded-full bg-[#11110f] px-5 text-base font-medium text-ivory shadow-[0_18px_30px_rgba(17,17,15,0.22)] transition hover:bg-charcoal"
          >
            Open My Closet
          </Link>

          <Link
            to="/signup"
            className="mt-4 inline-flex w-full items-center justify-center text-base font-medium text-[#7d6246] transition hover:text-charcoal"
          >
            Create New Closet
          </Link>
        </section>
      </div>
    </AuthPhoneFrame>
  );
}
