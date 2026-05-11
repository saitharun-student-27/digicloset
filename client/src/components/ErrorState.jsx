import { AlertTriangle, RefreshCcw } from "lucide-react";


export default function ErrorState({
  title = "Could not load wardrobe",
  message,
  onRetry,
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100 text-red-800">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-red-950">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-red-700">{message}</p>
        </div>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-900"
        >
          <RefreshCcw className="h-4 w-4" />
          Retry
        </button>
      ) : null}
    </div>
  );
}
