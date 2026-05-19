import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  formatCategoryLabel,
  getCategorySuggestions,
  getGroupedCategoryOptions,
  getCategorySection,
  normalizeCategory,
} from "../utils/wardrobeTaxonomy";

function SuggestionButton({ option, onSelect }) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => onSelect(option.value)}
      className="flex min-h-[var(--touch-target-min)] w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-ivory"
    >
      <span className="text-sm font-medium text-charcoal">{option.label}</span>
      <span className="text-xs text-stone">{option.section}</span>
    </button>
  );
}

export default function CategoryPicker({
  value,
  onChange,
  id,
  name,
  placeholder = "Search categories",
  className = "",
}) {
  const [query, setQuery] = useState(formatCategoryLabel(value));
  const [isOpen, setIsOpen] = useState(false);
  const blurTimeoutRef = useRef(null);

  useEffect(() => {
    setQuery(formatCategoryLabel(value));
  }, [value]);

  useEffect(
    () => () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    },
    [],
  );

  const suggestions = useMemo(() => {
    if (!query.trim()) {
      return getGroupedCategoryOptions().flatMap((group) =>
        group.options.map((option) => ({
          ...option,
          section: group.label,
        })),
      );
    }

    return getCategorySuggestions(query).slice(0, 12);
  }, [query]);

  function commitValue(nextValue) {
    const normalized = normalizeCategory(nextValue);
    onChange(normalized);
    setQuery(formatCategoryLabel(normalized));
    setIsOpen(false);
  }

  function handleBlur() {
    blurTimeoutRef.current = setTimeout(() => {
      if (query.trim()) {
        commitValue(query);
      } else {
        commitValue("other");
      }
    }, 120);
  }

  function handleFocus() {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    setIsOpen(true);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && isOpen) {
      event.preventDefault();
      if (suggestions.length > 0) {
        commitValue(suggestions[0].value);
      } else {
        commitValue(query);
      }
    }

    if (event.key === "Escape") {
      setIsOpen(false);
      setQuery(formatCategoryLabel(value));
    }
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-stone/60">
        <Search className="h-4 w-4" />
      </div>
      <input
        id={id}
        name={name}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className={`h-11 min-h-[var(--touch-target-min)] w-full rounded-xl border border-black/10 bg-white pl-10 pr-3 text-sm text-charcoal outline-none transition placeholder:text-stone/60 focus:border-sage focus:ring-4 focus:ring-sage/10 ${className}`}
      />

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.45rem)] z-30 max-h-72 overflow-y-auto rounded-[1.25rem] border border-black/8 bg-white p-2 shadow-[0_20px_40px_rgba(29,29,27,0.14)]">
          {suggestions.length > 0 ? (
            <div className="space-y-1">
              {suggestions.map((option) => (
                <SuggestionButton
                  key={`${option.value}-${option.section}`}
                  option={option}
                  onSelect={commitValue}
                />
              ))}
            </div>
          ) : (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => commitValue(query)}
              className="flex min-h-[var(--touch-target-min)] w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-ivory"
            >
              <span className="text-sm font-medium text-charcoal">
                Use "{formatCategoryLabel(query)}"
              </span>
              <span className="text-xs text-stone">
                {getCategorySection(query)}
              </span>
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
