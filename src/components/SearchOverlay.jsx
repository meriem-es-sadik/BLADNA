import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MapPin, Search, X } from "lucide-react";
import { cities } from "../data/cities";
import { regions, regionName } from "../data/regions";
import { destinations } from "../data/destinations";
import { useI18n } from "../i18n/LanguageContext";

const DESTINATION_IDS = new Set(destinations.map((destination) => destination.id));

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, " ")
    .trim();
}

export default function SearchOverlay({ open, onClose }) {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const returnFocus = useRef(null);

  const cityItems = useMemo(
    () =>
      cities.map((city) => {
        const region = regions.find((candidate) => candidate.id === city.region) || null;
        const regionNames = region ? Object.values(region.name) : [];
        return {
          key: `city-${city.slug}`,
          type: "city",
          title: city.name,
          subtitle: region ? regionName(region, lang) : "",
          badge: DESTINATION_IDS.has(city.slug) ? t("search.destinationBadge") : null,
          to: `/cities/${city.slug}`,
          haystack: normalize(
            [
              city.name,
              ...(city.aliases || []),
              ...regionNames,
              "Morocco",
              "Maroc",
              "المغرب",
            ].join(" ")
          ),
        };
      }),
    [lang, t]
  );

  const regionItems = useMemo(
    () =>
      regions.map((region) => {
        const count = cities.filter((city) => city.region === region.id).length;
        return {
          key: `region-${region.id}`,
          type: "region",
          title: regionName(region, lang),
          subtitle: t("search.citiesCount", { count }),
          badge: null,
          to: `/cities#region-${region.id}`,
          haystack: normalize([...Object.values(region.name), "Morocco", "Maroc"].join(" ")),
        };
      }),
    [lang, t]
  );

  const normalizedQuery = normalize(query);
  const filteredCities = normalizedQuery
    ? cityItems.filter((item) => item.haystack.includes(normalizedQuery))
    : [];
  const filteredRegions = normalizedQuery
    ? regionItems.filter((item) => item.haystack.includes(normalizedQuery))
    : [];
  const results = [...filteredCities, ...filteredRegions];
  const suggestions = cityItems.filter((item) => item.badge);
  const visibleItems = normalizedQuery ? results : suggestions;

  useEffect(() => {
    setActiveIndex(0);
  }, [normalizedQuery]);

  useEffect(() => {
    if (!open) return undefined;
    returnFocus.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      if (returnFocus.current instanceof HTMLElement) returnFocus.current.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const go = (item) => {
    if (!item) return;
    onClose();
    navigate(item.to);
  };

  const onInputKeyDown = (event) => {
    if (!visibleItems.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % visibleItems.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current - 1 + visibleItems.length) % visibleItems.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(visibleItems[activeIndex]);
    }
  };

  if (!open) return null;

  const renderItem = (item, index) => (
    <button
      key={item.key}
      type="button"
      onClick={() => go(item)}
      onMouseEnter={() => setActiveIndex(index)}
      className={
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep " +
        (index === activeIndex ? "bg-[#c9a24b]/15" : "hover:bg-white/70")
      }
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/35 bg-white/70 text-gold-deep">
        <MapPin className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-sm font-semibold text-ink">
          {item.title}
        </span>
        <span className="block truncate text-xs text-ink/55">{item.subtitle}</span>
      </span>
      {item.badge ? (
        <span className="hidden shrink-0 rounded-full border border-gold/35 bg-[#f6ecd8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-deep sm:inline">
          {item.badge}
        </span>
      ) : null}
      <ArrowRight className="h-4 w-4 shrink-0 text-gold-deep rtl:rotate-180" aria-hidden="true" />
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#120d08]/60 px-4 pt-[12vh] backdrop-blur-sm sm:pt-[16vh]"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("search.title")}
        className="w-full max-w-2xl overflow-hidden rounded-[1.5rem] border border-gold/40 bg-ivory shadow-[0_30px_80px_-20px_rgba(15,10,4,0.6)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-gold/25 px-4 py-3 sm:px-5">
          <Search className="h-4 w-4 shrink-0 text-gold-deep" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder={t("search.placeholder")}
            aria-label={t("search.title")}
            className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={t("search.close")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/35 text-ink/60 transition hover:border-gold/70 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3 sm:p-4">
          {!normalizedQuery ? (
            <div>
              <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-deep">
                {t("search.destinations")}
              </p>
              <div>{suggestions.map((item, index) => renderItem(item, index))}</div>
              <p className="px-3 pb-2 pt-3 text-xs leading-relaxed text-ink/45">
                {t("search.hint")}
              </p>
            </div>
          ) : results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-ink/55">{t("search.noResults")}</p>
          ) : (
            <div aria-label={t("search.results")}>
              {filteredCities.length > 0 ? (
                <div>
                  <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-deep">
                    {t("search.cities")}
                  </p>
                  {filteredCities.map((item, index) => renderItem(item, index))}
                </div>
              ) : null}
              {filteredRegions.length > 0 ? (
                <div>
                  <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-deep">
                    {t("search.regions")}
                  </p>
                  {filteredRegions.map((item, index) =>
                    renderItem(item, filteredCities.length + index)
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
