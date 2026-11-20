import { useEffect, useMemo, useState } from "react";
import { RotateCcw, Search } from "lucide-react";
import PlaceCard from "./PlaceCard";
import PlaceDetails from "./PlaceDetails";
import SectionIntro from "../SectionIntro";
import {
  getFallbackPlaces,
  getPlaces,
  mergePlaces,
  normalizeText,
  sortPlaces,
} from "../../services/placesService";
import { useI18n } from "../../i18n/LanguageContext";

const PAGE_SIZE = 9;

const LANDMARK_TYPES = new Set([
  "Museum",
  "Historic castle",
  "Historic fort",
  "Monument",
  "Memorial",
  "Archaeological site",
  "Historic ruins",
  "Historic site",
  "Historic building",
  "Religious site",
  "Historic gate",
  "Landmark",
  "Public artwork",
  "Attraction",
]);

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

export default function PlacesSection({
  city,
  kind,
  group = "all",
  kicker,
  heading,
  blurb,
  showHeader = true,
}) {
  const { t } = useI18n();
  const isRestaurant = kind === "restaurant";
  const isLandmarks = group === "landmarks";
  const nounPlural = isRestaurant
    ? t("places.nounRestaurants")
    : isLandmarks
      ? t("places.nounAttractions")
      : t("places.nounActivities");
  const [places, setPlaces] = useState(() => getFallbackPlaces(city, kind));
  const [status, setStatus] = useState(places.length ? "ready" : "loading");
  const [liveStatus, setLiveStatus] = useState("loading");
  const [query, setQuery] = useState("");
  const [type, setType] = useState(null);
  const [sort, setSort] = useState("recommended");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [forceLive, setForceLive] = useState(false);

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

    getPlaces(city, kind, { force: forceLive })
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
  }, [city, kind, reloadToken, forceLive]);

  const groupedPlaces = useMemo(() => {
    if (isRestaurant || group === "all") return places;
    return places.filter((place) =>
      group === "landmarks"
        ? LANDMARK_TYPES.has(place.typeLabel)
        : !LANDMARK_TYPES.has(place.typeLabel)
    );
  }, [places, isRestaurant, group]);

  const filtered = useMemo(() => {
    let list = groupedPlaces;
    const q = normalizeText(query);
    if (q) list = list.filter((place) => place.searchText.includes(q));
    if (type !== null) list = list.filter((place) => place.typeLabel === type);
    return sortPlaces(list, sort);
  }, [groupedPlaces, query, type, sort]);

  const availableTypes = useMemo(
    () =>
      [...new Set(groupedPlaces.map((place) => place.typeLabel))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [groupedPlaces]
  );
  const groupEmpty = groupedPlaces.length === 0;
  const headingText =
    heading ||
    `${isRestaurant ? t("places.whereToEat") : t("places.thingsToDo")} ${t("places.in")} ${city.name}`;
  const introText =
    blurb || (isRestaurant ? t("places.restaurantBlurb") : t("places.activityBlurb"));
  const kickerText = kicker || t("places.verifiedBy");

  const reset = () => {
    setQuery("");
    setType(null);
    setSort("recommended");
    setVisible(PAGE_SIZE);
  };

  const retryLive = () => {
    setForceLive(true);
    setReloadToken((token) => token + 1);
  };

  if (status === "error") {
    return (
      <div className="w-full rounded-[1.5rem] border border-gold/30 bg-white/60 px-6 py-12 text-center">
        <h2 className="font-display text-2xl font-medium text-ink">{t("places.emptyTitle", { noun: nounPlural, city: city.name })}</h2>
        <p className="mt-2 text-sm text-ink/60">
          {t("places.errorBody", { noun: nounPlural, city: city.name })}
        </p>
        <button
          type="button"
          onClick={retryLive}
          className="mt-5 rounded-full bg-linear-to-r from-[#d9b466] via-[#c9a24b] to-[#b3863d] px-6 py-2.5 text-sm font-semibold text-[#3d270e] shadow transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep"
        >
          {t("common.tryAgain")}
        </button>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="w-full" aria-busy="true">
        {showHeader ? (
          <SectionIntro kicker={kickerText} title={headingText} intro={introText} className="mb-8" />
        ) : null}
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
      <div className="w-full">
        {showHeader ? (
          <SectionIntro kicker={kickerText} title={headingText} intro={introText} className="mb-8" />
        ) : null}
        <div className="rounded-[1.5rem] border border-gold/30 bg-white/60 px-6 py-12 text-center">
          <h2 className="font-display text-2xl font-medium text-ink">
            {t("places.emptyTitle", { noun: nounPlural, city: city.name })}
          </h2>
          <p className="mt-2 text-sm text-ink/60">{t("places.emptyBody")}</p>
          <button
            type="button"
            onClick={retryLive}
            className="mt-5 rounded-full border border-gold/50 px-6 py-2.5 text-sm font-semibold text-gold-deep transition hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep"
          >
            {t("common.tryAgain")}
          </button>
        </div>
      </div>
    );
  }

  if (selected) {
    return <PlaceDetails place={selected} onClose={() => setSelected(null)} />;
  }

  return (
    <div className="w-full">
      {showHeader ? (
        <SectionIntro
          kicker={kickerText}
          title={headingText}
          intro={introText}
          className="mb-8"
        />
      ) : null}

      <div className="mb-6 flex flex-col gap-3 rounded-[1.35rem] border border-gold/25 bg-white/55 p-3 shadow-[0_14px_34px_-28px_rgba(63,42,18,0.45)] backdrop-blur-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-4">
        <label className="relative block w-full sm:max-w-xs">
          <span className="sr-only">
            {t("places.searchLabel", { noun: nounPlural })}
          </span>
          <Search
            className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisible(PAGE_SIZE);
            }}
            placeholder={t("places.searchPlaceholder", { noun: nounPlural })}
            className="w-full rounded-full border border-gold/35 bg-white/70 py-2.5 ps-10 pe-4 text-sm text-ink placeholder:text-ink/40 focus:border-gold/80 focus:outline-none focus:ring-2 focus:ring-[#c9a24b]/30"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <label>
            <span className="sr-only">
              {isRestaurant ? t("places.filterCuisine") : t("places.filterType")}
            </span>
            <select
              value={type ?? ""}
              onChange={(event) => {
                setType(event.target.value || null);
                setVisible(PAGE_SIZE);
              }}
              className="rounded-full border border-gold/35 bg-white/70 px-3.5 py-2 text-xs font-semibold text-ink focus:border-gold/80 focus:outline-none focus:ring-2 focus:ring-[#c9a24b]/30"
            >
              <option value="">
                {isRestaurant ? t("places.allCuisines") : t("places.allTypes")}
              </option>
              {availableTypes.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">{t("places.sort", { noun: nounPlural })}</span>
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setVisible(PAGE_SIZE);
              }}
              className="rounded-full border border-gold/35 bg-white/70 px-3.5 py-2 text-xs font-semibold text-ink focus:border-gold/80 focus:outline-none focus:ring-2 focus:ring-[#c9a24b]/30"
            >
              <option value="recommended">{t("places.sortRecommended")}</option>
              <option value="az">{t("places.sortAz")}</option>
              <option value="za">{t("places.sortZa")}</option>
              <option value="area">{t("places.sortArea")}</option>
            </select>
          </label>

          {(query || type !== null || sort !== "recommended") && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-xs font-semibold text-ink/50 underline-offset-2 transition-colors hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              {t("places.reset")}
            </button>
          )}

          <span className="hidden text-xs text-ink/45 lg:inline">
            {t("places.matching", { count: filtered.length, noun: nounPlural })}
          </span>
        </div>
      </div>

      {liveStatus === "offline" && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/35 bg-[#f6ecd8]/70 px-4 py-3 text-start">
          <p className="text-xs leading-relaxed text-ink/65">
            {t("places.offline", { count: groupedPlaces.length, noun: nounPlural })}
          </p>
          <button
            type="button"
            onClick={retryLive}
            className="rounded-full border border-gold/50 px-4 py-1.5 text-xs font-semibold text-gold-deep transition hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
          >
            {t("places.retryLive")}
          </button>
        </div>
      )}

      {groupEmpty ? (
        <div className="rounded-[1.5rem] border border-gold/30 bg-white/60 px-6 py-12 text-center">
          <h2 className="font-display text-xl font-medium text-ink">
            {t("places.emptyTitle", { noun: nounPlural, city: city.name })}
          </h2>
          <p className="mt-2 text-sm text-ink/55">{t("places.emptyBody")}</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {group === "landmarks" || group === "experiences" ? (
              <a
                href={group === "landmarks" ? "#activities" : "#attractions"}
                className="inline-flex rounded-full border border-gold/50 px-6 py-2.5 text-sm font-semibold text-gold-deep transition hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep"
              >
                {t(group === "landmarks" ? "city.activities" : "city.attractions")}
              </a>
            ) : null}
            <button
              type="button"
              onClick={retryLive}
              className="inline-flex rounded-full border border-gold/50 px-6 py-2.5 text-sm font-semibold text-gold-deep transition hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep"
            >
              {t("common.tryAgain")}
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[1.5rem] border border-gold/30 bg-white/60 px-6 py-12 text-center">
          <h2 className="font-display text-xl font-medium text-ink">
            {t("places.noMatchTitle", { noun: nounPlural })}
          </h2>
          <p className="mt-2 text-sm text-ink/55">{t("places.noMatchBody")}</p>
          <button
            type="button"
            onClick={reset}
            className="mt-5 rounded-full border border-gold/50 px-6 py-2.5 text-sm font-semibold text-gold-deep transition hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep"
          >
            {t("places.resetFilters")}
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
              {t("places.showing", {
                shown: Math.min(visible, filtered.length),
                total: filtered.length,
                noun: nounPlural,
              })}
              {groupedPlaces.length !== filtered.length
                ? t("places.showingFrom", { count: groupedPlaces.length })
                : ""}
            </p>
            {visible < filtered.length && (
              <button
                type="button"
                onClick={() => setVisible((current) => current + PAGE_SIZE)}
                className="mt-4 rounded-full border border-gold/50 px-7 py-3 text-sm font-semibold text-gold-deep transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep"
              >
                {t("places.loadMore")}
              </button>
            )}
          </div>
        </>
      )}

      <p className="mt-6 text-center text-[11px] leading-relaxed text-ink/40">
        {t("places.attribution")}
      </p>
    </div>
  );
}
