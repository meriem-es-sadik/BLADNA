import { useEffect, useMemo, useRef, useState } from "react";
import HotelCard from "./HotelCard";
import HotelDetails from "./HotelDetails";
import HotelFilters from "./HotelFilters";
import HotelSearch from "./HotelSearch";
import {
  getFallbackHotels,
  getHotels,
  mergeHotels,
  normalizeText,
  sortHotels,
} from "../../services/hotelsService";
import { fallbackAttribution } from "../../data/hotelsFallback";

const PAGE_SIZE = 12;

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-[1.25rem] border border-gold/25 bg-white/50">
      <div className="aspect-[16/10] w-full bg-ink/10" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-2/3 rounded-full bg-ink/10" />
        <div className="h-3 w-1/3 rounded-full bg-ink/10" />
        <div className="h-3 w-full rounded-full bg-ink/10" />
        <div className="h-3 w-3/4 rounded-full bg-ink/10" />
        <div className="h-7 w-24 rounded-full bg-ink/10" />
      </div>
    </div>
  );
}

export default function HotelsSection({ city }) {
  const [hotels, setHotels] = useState(() => getFallbackHotels(city));
  const [status, setStatus] = useState(hotels.length ? "ready" : "loading");
  const [liveStatus, setLiveStatus] = useState("loading");
  const [query, setQuery] = useState("");
  const [stars, setStars] = useState(null);
  const [type, setType] = useState(null);
  const [sort, setSort] = useState("rating");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);
  const forceRefresh = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    const fallback = getFallbackHotels(city);
    setHotels(fallback);
    setStatus(fallback.length ? "ready" : "loading");
    setLiveStatus("loading");
    setQuery("");
    setStars(null);
    setType(null);
    setSort("rating");
    setVisible(PAGE_SIZE);
    setSelected(null);

    getHotels(city, controller.signal, { force: forceRefresh.current })
      .then((list) => {
        const merged = mergeHotels(fallback, list, city);
        setHotels(merged);
        setStatus(merged.length ? "ready" : "empty");
        setLiveStatus("live");
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setLiveStatus("offline");
        setStatus(fallback.length ? "ready" : "error");
      });

    return () => controller.abort();
  }, [city, reloadToken]);

  const filtered = useMemo(() => {
    let list = hotels;
    const q = normalizeText(query);
    if (q) list = list.filter((h) => h.searchText.includes(q));
    if (stars !== null) list = list.filter((h) => h.stars === stars);
    if (type !== null) list = list.filter((h) => h.typeLabel === type);
    return sortHotels(list, sort);
  }, [hotels, query, stars, type, sort]);

  const availableStars = useMemo(
    () => [...new Set(hotels.map((h) => h.stars).filter(Boolean))],
    [hotels]
  );

  const availableTypes = useMemo(() => {
    const labels = new Set();
    for (const h of hotels) labels.add(h.typeLabel);
    return [...labels].map((label) => ({ value: label, label }));
  }, [hotels]);

  const retry = () => {
    forceRefresh.current = true;
    setReloadToken((t) => t + 1);
  };

  if (status === "error") {
    return (
      <div className="w-full rounded-[1.5rem] border border-gold/30 bg-white/60 px-6 py-12 text-center">
        <h2 className="font-display text-2xl font-medium text-ink">Something went wrong</h2>
        <p className="mt-2 text-sm text-ink/60">
          We couldn't load hotels in {city.name}. The public OpenStreetMap provider may be busy.
        </p>
        <button
          type="button"
          onClick={retry}
          className="mt-5 rounded-full bg-linear-to-r from-[#d9b466] via-[#c9a24b] to-[#b3863d] px-6 py-2.5 text-sm font-semibold text-[#3d270e] shadow transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep"
        >
          Try again
        </button>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="w-full">
        <div className="mb-6 flex justify-center">
          <div className="h-10 w-64 animate-pulse rounded-full border border-gold/25 bg-white/50" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className="w-full rounded-[1.5rem] border border-gold/30 bg-white/60 px-6 py-12 text-center">
        <h2 className="font-display text-2xl font-medium text-ink">
          No mapped hotels found in {city.name}
        </h2>
        <p className="mt-2 text-sm text-ink/60">
          OpenStreetMap has no accommodation records for this area right now.
        </p>
        <button
          type="button"
          onClick={retry}
          className="mt-5 rounded-full border border-gold/50 px-6 py-2.5 text-sm font-semibold text-gold-deep transition hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep"
        >
          Try again
        </button>
      </div>
    );
  }

  if (selected) {
    return (
      <HotelDetails
        hotel={selected}
        cityName={city.name}
        onClose={() => setSelected(null)}
      />
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <HotelSearch
          value={query}
          onChange={(v) => {
            setQuery(v);
            setVisible(PAGE_SIZE);
          }}
        />
        <HotelFilters
          availableStars={availableStars}
          availableTypes={availableTypes}
          stars={stars}
          type={type}
          sort={sort}
          onStars={(v) => {
            setStars(v);
            setVisible(PAGE_SIZE);
          }}
          onType={(v) => {
            setType(v);
            setVisible(PAGE_SIZE);
          }}
          onSort={(v) => {
            setSort(v);
            setVisible(PAGE_SIZE);
          }}
          onReset={() => {
            setQuery("");
            setStars(null);
            setType(null);
            setVisible(PAGE_SIZE);
          }}
          filtered={filtered.length}
        />
      </div>

      {liveStatus === "offline" && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/35 bg-[#f6ecd8]/70 px-4 py-3 text-left">
          <p className="text-xs leading-relaxed text-ink/65">
            Live OpenStreetMap data is temporarily unavailable. Showing{" "}
            <strong className="font-semibold text-ink/80">{hotels.length} verified hotels</strong>{" "}
            from BLADNA's bundled list.
          </p>
          <button
            type="button"
            onClick={retry}
            className="rounded-full border border-gold/50 px-4 py-1.5 text-xs font-semibold text-gold-deep transition hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
          >
            Retry live data
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-[1.5rem] border border-gold/30 bg-white/60 px-6 py-12 text-center">
          <h2 className="font-display text-xl font-medium text-ink">
            No hotels match your search
          </h2>
          <p className="mt-2 text-sm text-ink/55">Try another name, area, or reset the filters.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setStars(null);
              setType(null);
              setVisible(PAGE_SIZE);
            }}
            className="mt-5 rounded-full border border-gold/50 px-6 py-2.5 text-sm font-semibold text-gold-deep transition hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.slice(0, visible).map((h) => (
              <HotelCard key={h.id} hotel={h} cityName={city.name} onDetails={setSelected} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-ink/45">
              Showing {Math.min(visible, filtered.length)} of {filtered.length} mapped hotels
              {hotels.length !== filtered.length ? ` (from ${hotels.length} found)` : ""}
            </p>
            {visible < filtered.length && (
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="mt-4 rounded-full border border-gold/50 px-7 py-3 text-sm font-semibold text-gold-deep transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep"
              >
                Load More
              </button>
            )}
          </div>
        </>
      )}

      <p className="mt-8 text-center text-[11px] leading-relaxed text-ink/45">
        Hotel data from{" "}
        <a
          href={fallbackAttribution.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-gold-deep underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
        >
          OpenStreetMap
        </a>{" "}
        contributors ({fallbackAttribution.license}). Bundled listings verified on{" "}
        {fallbackAttribution.verifiedAt}. Photos via Wikimedia Commons under their stated
        licenses. No prices or live availability are shown.
      </p>
    </div>
  );
}
