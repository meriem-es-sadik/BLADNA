import { useEffect, useMemo, useState } from "react";
import { RotateCcw, Search } from "lucide-react";
import PlaceCard from "./PlaceCard";
import PlaceDetails from "./PlaceDetails";
import {
  getFallbackPlaces,
  getPlaces,
  mergePlaces,
  normalizeText,
  sortPlaces,
} from "../../services/placesService";

const PAGE_SIZE = 9;

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-[1.25rem] border border-gold/25 bg-white/50">
      <div className="aspect-[16/10] w-full bg-ink/10" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-2/3 rounded-full bg-ink/10" />
        <div className="h-3 w-1/3 rounded-full bg-ink/10" />
        <div className="h-3 w-full rounded-full bg-ink/10" />
        <div className="h-7 w-24 rounded-full bg-ink/10" />
      </div>
    </div>
  );
}

export default function PlacesSection({ city, kind }) {
  const isRestaurant = kind === "restaurant";
  const noun = isRestaurant ? "restaurant" : "activity";
  const nounPlural = isRestaurant ? "restaurants" : "activities";
  const [places, setPlaces] = useState(() => getFallbackPlaces(city, kind));
  const [status, setStatus] = useState(places.length ? "ready" : "loading");
  const [liveStatus, setLiveStatus] = useState("loading");
  const [query, setQuery] = useState("");
  const [type, setType] = useState(null);
  const [sort, setSort] = useState("recommended");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fallback = getFallbackPlaces(city, kind);
    setPlaces(fallback);
    setStatus(fallback.length ? "ready" : "loading");
    setLiveStatus("loading");
    setQuery("");
    setType(null);
    setSort("recommended");
    setVisible(PAGE_SIZE);
    setSelected(null);

    getPlaces(city, kind)
      .then((live) => {
        if (cancelled) return;
        const merged = mergePlaces(fallback, live, kind, city);
        setPlaces(merged);
        setStatus(merged.length ? "ready" : "empty");
        setLiveStatus("live");
      })
      .catch(() => {
        if (cancelled) return;
        setLiveStatus("offline");
        setStatus(fallback.length ? "ready" : "error");
      });

    return () => {
      cancelled = true;
    };
  }, [city, kind, reloadToken]);

  const filtered = useMemo(() => {
    let list = places;
    const q = normalizeText(query);
    if (q) list = list.filter((place) => place.searchText.includes(q));
    if (type !== null) list = list.filter((place) => place.typeLabel === type);
    return sortPlaces(list, sort);
  }, [places, query, type, sort]);

  const availableTypes = useMemo(
    () => [...new Set(places.map((place) => place.typeLabel))].sort((a, b) => a.localeCompare(b)),
    [places]
  );

  const reset = () => {
    setQuery("");
    setType(null);
    setSort("recommended");
    setVisible(PAGE_SIZE);
  };

  if (status === "error") {
    return (
      <div className="w-full rounded-[1.5rem] border border-gold/30 bg-white/60 px-6 py-12 text-center">
        <h2 className="font-display text-2xl font-medium text-ink">Something went wrong</h2>
        <p className="mt-2 text-sm text-ink/60">
          We couldn't load {nounPlural} in {city.name}.
        </p>
        <button
          type="button"
          onClick={() => setReloadToken((token) => token + 1)}
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
          {Array.from({ length: 6 }, (_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className="w-full rounded-[1.5rem] border border-gold/30 bg-white/60 px-6 py-12 text-center">
        <h2 className="font-display text-2xl font-medium text-ink">
          No verified {nounPlural} found in {city.name}
        </h2>
        <p className="mt-2 text-sm text-ink/60">Try refreshing the live OpenStreetMap data.</p>
        <button
          type="button"
          onClick={() => setReloadToken((token) => token + 1)}
          className="mt-5 rounded-full border border-gold/50 px-6 py-2.5 text-sm font-semibold text-gold-deep transition hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep"
        >
          Try again
        </button>
      </div>
    );
  }

  if (selected) {
    return <PlaceDetails place={selected} onClose={() => setSelected(null)} />;
  }

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-deep">
          Verified by OpenStreetMap
        </p>
        <h2 className="mt-2 font-display text-2xl font-medium text-ink sm:text-[1.75rem]">
          {isRestaurant ? "Where to Eat" : "Things to Do"} in{" "}
          <span className="italic text-terra">{city.name}</span>
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink/60">
          {isRestaurant
            ? "Real neighbourhood restaurants, cafés and local favourites, mapped by the community."
            : "Museums, monuments, gardens and outdoor places worth making time for."}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <label className="relative block w-full sm:max-w-xs">
          <span className="sr-only">Search {nounPlural} by name, type or area</span>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisible(PAGE_SIZE);
            }}
            placeholder={`Search ${nounPlural} by name or area…`}
            className="w-full rounded-full border border-gold/35 bg-white/70 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink/40 focus:border-gold/80 focus:outline-none focus:ring-2 focus:ring-[#c9a24b]/30"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <label>
            <span className="sr-only">Filter by {isRestaurant ? "cuisine" : "type"}</span>
            <select
              value={type ?? ""}
              onChange={(event) => {
                setType(event.target.value || null);
                setVisible(PAGE_SIZE);
              }}
              className="rounded-full border border-gold/35 bg-white/70 px-3.5 py-2 text-xs font-semibold text-ink focus:border-gold/80 focus:outline-none focus:ring-2 focus:ring-[#c9a24b]/30"
            >
              <option value="">All {isRestaurant ? "cuisines" : "types"}</option>
              {availableTypes.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Sort {nounPlural}</span>
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setVisible(PAGE_SIZE);
              }}
              className="rounded-full border border-gold/35 bg-white/70 px-3.5 py-2 text-xs font-semibold text-ink focus:border-gold/80 focus:outline-none focus:ring-2 focus:ring-[#c9a24b]/30"
            >
              <option value="recommended">Recommended</option>
              <option value="az">Name A → Z</option>
              <option value="za">Name Z → A</option>
              <option value="area">Neighbourhood</option>
            </select>
          </label>

          {(query || type !== null || sort !== "recommended") && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-xs font-semibold text-ink/50 underline-offset-2 transition-colors hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset
            </button>
          )}

          <span className="hidden text-xs text-ink/45 lg:inline">
            {filtered.length} {filtered.length === 1 ? noun : nounPlural} matching
          </span>
        </div>
      </div>

      {liveStatus === "offline" && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/35 bg-[#f6ecd8]/70 px-4 py-3 text-left">
          <p className="text-xs leading-relaxed text-ink/65">
            Live OpenStreetMap data is temporarily unavailable. Showing{" "}
            <strong className="font-semibold text-ink/80">
              {places.length} verified {nounPlural}
            </strong>{" "}
            from BLADNA's bundled list.
          </p>
          <button
            type="button"
            onClick={() => setReloadToken((token) => token + 1)}
            className="rounded-full border border-gold/50 px-4 py-1.5 text-xs font-semibold text-gold-deep transition hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
          >
            Retry live data
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-[1.5rem] border border-gold/30 bg-white/60 px-6 py-12 text-center">
          <h2 className="font-display text-xl font-medium text-ink">
            No {nounPlural} match your search
          </h2>
          <p className="mt-2 text-sm text-ink/55">Try another name, area, or reset the filters.</p>
          <button
            type="button"
            onClick={reset}
            className="mt-5 rounded-full border border-gold/50 px-6 py-2.5 text-sm font-semibold text-gold-deep transition hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.slice(0, visible).map((place) => (
              <PlaceCard key={place.id} place={place} onDetails={setSelected} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-ink/45">
              Showing {Math.min(visible, filtered.length)} of {filtered.length} verified {nounPlural}
              {places.length !== filtered.length ? ` (from ${places.length} found)` : ""}
            </p>
            {visible < filtered.length && (
              <button
                type="button"
                onClick={() => setVisible((current) => current + PAGE_SIZE)}
                className="mt-4 rounded-full border border-gold/50 px-7 py-3 text-sm font-semibold text-gold-deep transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep"
              >
                Load More
              </button>
            )}
          </div>
        </>
      )}

      <p className="mt-6 text-center text-[11px] leading-relaxed text-ink/40">
        Places are mapped by OpenStreetMap contributors under the ODbL 1.0 license. No prices,
        ratings or availability are shown.
      </p>
    </div>
  );
}
