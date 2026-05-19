import { useEffect, useMemo, useRef, useState } from "react";

import {
  formatColorLabel,
  formatFormalityLabel,
  formatOccasionLabel,
  formatSeasonLabel,
  formatStyleLabel,
  getFieldSuggestions,
  normalizeColor,
  normalizeFormality,
  normalizeOccasion,
  normalizeSeason,
  normalizeStyle,
  formatFieldLabel,
} from "../utils/wardrobeTaxonomy";

const inputClassName =
  "h-11 min-h-[var(--touch-target-min)] w-full rounded-xl border border-black/10 bg-white px-3 text-sm text-charcoal outline-none transition placeholder:text-stone/60 focus:border-sage focus:ring-4 focus:ring-sage/10";

const fieldHelpers = {
  color: {
    normalize: normalizeColor,
    format: formatColorLabel,
  },
  season: {
    normalize: normalizeSeason,
    format: formatSeasonLabel,
  },
  occasion: {
    normalize: normalizeOccasion,
    format: formatOccasionLabel,
  },
  style: {
    normalize: normalizeStyle,
    format: formatStyleLabel,
  },
  formality: {
    normalize: normalizeFormality,
    format: formatFormalityLabel,
  },
};

function getHelpers(field) {
  return fieldHelpers[field] || {
    normalize: (value) => value,
    format: (value) => formatFieldLabel(value),
  };
}

export default function AutosuggestField({
  id,
  name,
  value,
  onChange,
  field,
  placeholder = "",
  className = "",
  required = false,
}) {
  const { normalize, format } = getHelpers(field);
  const [draft, setDraft] = useState(value ? format(value) : "");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const rootRef = useRef(null);
  const ignoreBlurRef = useRef(false);

  const suggestions = useMemo(
    () => getFieldSuggestions(field, draft).slice(0, 8),
    [draft, field],
  );

  useEffect(() => {
    if (!isOpen) {
      setDraft(value ? format(value) : "");
    }
  }, [format, isOpen, value]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [draft]);

  function commitValue(nextValue) {
    const normalizedValue = normalize(nextValue);
    onChange?.(normalizedValue);
    setDraft(normalizedValue ? format(normalizedValue) : "");
    setIsOpen(false);
  }

  function handleBlur() {
    window.setTimeout(() => {
      if (ignoreBlurRef.current) {
        ignoreBlurRef.current = false;
        return;
      }

      if (!draft.trim()) {
        setDraft("");
        setIsOpen(false);
        return;
      }

      commitValue(draft);
    }, 0);
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <input
        id={id}
        name={name}
        type="text"
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={handleBlur}
        required={required}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && suggestions.length > 0) {
            event.preventDefault();
            setIsOpen(true);
            setHighlightedIndex((current) =>
              Math.min(current + 1, suggestions.length - 1),
            );
            return;
          }

          if (event.key === "ArrowUp" && suggestions.length > 0) {
            event.preventDefault();
            setHighlightedIndex((current) => Math.max(current - 1, 0));
            return;
          }

          if (event.key === "Enter") {
            if (isOpen && suggestions.length > 0) {
              event.preventDefault();
              commitValue(suggestions[highlightedIndex]?.value || draft);
            } else if (draft.trim()) {
              event.preventDefault();
              commitValue(draft);
            }
            return;
          }

          if (event.key === "Escape") {
            setIsOpen(false);
          }
        }}
        placeholder={placeholder}
        className={inputClassName}
      />

      {isOpen && (suggestions.length > 0 || draft.trim()) ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 rounded-[1.25rem] border border-black/8 bg-white p-2 shadow-[0_20px_50px_rgba(17,17,15,0.12)]">
          <div className="max-h-64 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.value}
                type="button"
                onMouseDown={() => {
                  ignoreBlurRef.current = true;
                }}
                onClick={() => commitValue(suggestion.value)}
                className={`flex min-h-[var(--touch-target-min)] w-full items-center rounded-[1rem] px-3 py-3 text-left text-sm transition ${
                  highlightedIndex === index
                    ? "bg-linen text-charcoal"
                    : "text-charcoal hover:bg-ivory"
                }`}
              >
                {suggestion.label}
              </button>
            ))}

            {draft.trim() ? (
              <button
                type="button"
                onMouseDown={() => {
                  ignoreBlurRef.current = true;
                }}
                onClick={() => commitValue(draft)}
                className="flex min-h-[var(--touch-target-min)] w-full items-center rounded-[1rem] px-3 py-3 text-left text-sm text-stone transition hover:bg-ivory hover:text-charcoal"
              >
                Use "{formatFieldLabel(draft)}"
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
