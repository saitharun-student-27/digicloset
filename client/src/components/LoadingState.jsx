export default function LoadingState() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-64 animate-pulse rounded-2xl border border-black/5 bg-white p-5 shadow-soft"
        >
          <div className="flex gap-3">
            <div className="h-12 w-12 rounded-2xl bg-linen" />
            <div className="flex-1">
              <div className="h-4 w-2/3 rounded bg-linen" />
              <div className="mt-3 h-3 w-1/3 rounded bg-linen/70" />
            </div>
          </div>
          <div className="mt-6 h-2 rounded-full bg-linen" />
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="h-16 rounded-2xl bg-linen/80" />
            <div className="h-16 rounded-2xl bg-linen/80" />
            <div className="h-16 rounded-2xl bg-linen/80" />
            <div className="h-16 rounded-2xl bg-linen/80" />
          </div>
        </div>
      ))}
    </div>
  );
}
