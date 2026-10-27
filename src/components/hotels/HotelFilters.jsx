export default function HotelFilters({
  availableStars,
  availableTypes,
  stars,
  type,
  sort,
  onStars,
  onType,
  onSort,
  onReset,
  filtered,
}) {
  const starOptions = [5, 4, 3, 2, 1].filter((s) => availableStars.includes(s));
  const hasAnyFilter = stars !== null || type !== null;

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => onStars(null)}
          aria-pressed={stars === null}
          className={
            "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 " +
            (stars === null
              ? "border-[#c9a24b]/70 bg-[#c9a24b]/15 text-gold-deep"
              : "border-gold/30 bg-white/60 text-ink/60 hover:border-gold/60 hover:text-ink")
          }
        >
          All stars
        </button>
        {starOptions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onStars(stars === s ? null : s)}
            aria-pressed={stars === s}
            className={
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 " +
              (stars === s
                ? "border-[#c9a24b]/70 bg-[#c9a24b]/15 text-gold-deep"
                : "border-gold/30 bg-white/60 text-ink/60 hover:border-gold/60 hover:text-ink")
            }
          >
            {s}★
          </button>
        ))}
      </div>

      {availableTypes.length > 1 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onType(null)}
            aria-pressed={type === null}
            className={
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 " +
              (type === null
                ? "border-[#c9a24b]/70 bg-[#c9a24b]/15 text-gold-deep"
                : "border-gold/30 bg-white/60 text-ink/60 hover:border-gold/60 hover:text-ink")
            }
          >
            All types
          </button>
          {availableTypes.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onType(type === t.value ? null : t.value)}
              aria-pressed={type === t.value}
              className={
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 " +
                (type === t.value
                  ? "border-[#c9a24b]/70 bg-[#c9a24b]/15 text-gold-deep"
                  : "border-gold/30 bg-white/60 text-ink/60 hover:border-gold/60 hover:text-ink")
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <label className="flex items-center gap-2 text-xs text-ink/60">
        <span className="sr-only sm:not-sr-only">Sort</span>
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value)}
          className="rounded-full border border-gold/35 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-ink focus:border-gold/80 focus:outline-none focus:ring-2 focus:ring-[#c9a24b]/30"
        >
          <option value="rating">Customer rating</option>
          <option value="stars">Stars high → low</option>
          <option value="az">Name A → Z</option>
          <option value="za">Name Z → A</option>
        </select>
      </label>

      {hasAnyFilter && (
        <button
          type="button"
          onClick={onReset}
          className="rounded-full px-2.5 py-1.5 text-xs font-semibold text-ink/50 underline-offset-2 transition-colors hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
        >
          Reset
        </button>
      )}

      <span className="ml-auto hidden text-xs text-ink/45 lg:inline">
        {filtered} hotel{filtered === 1 ? "" : "s"} matching
      </span>
    </div>
  );
}
