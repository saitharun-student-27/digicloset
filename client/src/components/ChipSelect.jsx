import { formatFieldLabel } from "../utils/wardrobeTaxonomy";

export default function ChipSelect({
  value,
  options,
  onChange,
  formatOption = formatFieldLabel,
  emptyLabel = "Not set",
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = option === value;
        const label = option ? formatOption(option) : emptyLabel;

        return (
          <button
            key={option || "__empty__"}
            type="button"
            onClick={() => onChange(option)}
            className={`inline-flex min-h-[var(--touch-target-min)] items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition ${
              isSelected
                ? "bg-charcoal text-ivory shadow-soft"
                : "bg-ivory text-charcoal hover:bg-linen"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
