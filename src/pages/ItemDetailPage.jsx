import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import SiteNav from "../components/SiteNav";
import ZelligeEdges from "../components/ZelligeEdges";
import HotelDetails from "../components/hotels/HotelDetails";
import PlaceDetails from "../components/places/PlaceDetails";
import { getCity } from "../data/cities";
import { getCityName } from "../data/cityNames";
import { useI18n } from "../i18n/LanguageContext";
import {
  getFallbackHotels,
  getHotels,
  mergeHotels,
} from "../services/hotelsService";
import {
  getFallbackPlaces,
  getPlaces,
  mergePlaces,
} from "../services/placesService";
import { buildBackPath, decodeItemId } from "../utils/itemRoutes";

const CATEGORY_CONFIG = {
  hotels: {
    kind: "hotel",
    labelKey: "nav.hotels",
    nounKey: "detail.nounHotel",
    backKey: "hotels.back",
  },
  restaurants: {
    kind: "restaurant",
    labelKey: "nav.restaurants",
    nounKey: "places.nounRestaurant",
    backKey: "places.backRestaurants",
  },
  activities: {
    kind: "activity",
    labelKey: "nav.activities",
    nounKey: "places.nounActivity",
    backKey: "places.backActivities",
  },
  attractions: {
    kind: "activity",
    labelKey: "nav.attractions",
    nounKey: "places.nounAttraction",
    backKey: "places.backAttractions",
  },
  places: {
    kind: "activity",
    labelKey: "city.attractions",
    nounKey: "places.nounAttraction",
    backKey: "places.backAttractions",
  },
};

function StatusPanel({ title, body, backPath, backLabel }) {
  return (
    <div className="rounded-[1.25rem] border border-gold/30 bg-white/65 px-5 py-10 text-center shadow-[0_14px_36px_-26px_rgba(63,42,18,0.45)]">
      <MapPin className="mx-auto h-5 w-5 text-gold-deep" aria-hidden="true" />
      <h2 className="mt-3 font-display text-xl font-medium text-ink sm:text-2xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-ink/65 sm:text-sm">{body}</p>
      <Link
        to={backPath}
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/50 bg-ivory px-3.5 py-1.5 text-[11px] font-semibold text-gold-deep transition hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep sm:text-xs"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        {backLabel}
      </Link>
    </div>
  );
}

export default function ItemDetailPage({ category }) {
  const { city: citySlug, itemId: rawItemId } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.places;
  const city = getCity(citySlug);
  const itemId = decodeItemId(rawItemId || "");
  const cityName = city ? getCityName(city, lang) || city.name : "";
  const backPath = city ? buildBackPath(city.slug, category) : "/cities";

  const [item, setItem] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!city || !itemId) {
      setItem(null);
      setStatus("not-found");
      return undefined;
    }

    let cancelled = false;
    let settled = false;
    let controller = null;
    const isHotel = category === "hotels";
    const fallback = isHotel
      ? getFallbackHotels(city)
      : getFallbackPlaces(city, config.kind);
    const initial = fallback.find((entry) => entry.id === itemId) || null;

    setItem(initial);
    setStatus(initial ? "ready" : "loading");

    const resolve = (live) => {
      if (cancelled || settled) return;
      settled = true;
      const merged = isHotel
        ? mergeHotels(fallback, live || [], city)
        : mergePlaces(fallback, live || [], config.kind, city);
      const found = merged.find((entry) => entry.id === itemId) || initial;
      setItem(found);
      setStatus(found ? "ready" : "not-found");
    };

    const fail = (error) => {
      if (cancelled || settled || error?.name === "AbortError") return;
      settled = true;
      if (!initial) {
        setItem(null);
        setStatus("not-found");
      }
    };

    if (isHotel) {
      controller = new AbortController();
      getHotels(city, controller.signal).then(resolve).catch(fail);
    } else {
      getPlaces(city, config.kind).then(resolve).catch(fail);
    }

    const timeoutId = initial
      ? null
      : setTimeout(() => {
          if (cancelled || settled) return;
          settled = true;
          setItem(null);
          setStatus("not-found");
        }, 12000);

    return () => {
      cancelled = true;
      controller?.abort();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [city?.slug, category, config.kind, itemId]);

  const backLabel = cityName
    ? t(config.backKey, { city: cityName })
    : t("nav.back");
  const notFoundTitle = t("detail.notFoundTitle", {
    noun: t(config.nounKey),
    city: cityName,
  });
  const notFoundBody = t("detail.notFoundBody", {
    noun: t(config.nounKey),
    city: cityName,
  });

  return (
    <div className="page-anim relative flex min-h-dvh flex-col overflow-clip bg-ivory font-sans text-ink antialiased">
      <ZelligeEdges />
      <SiteNav backTo={backPath} backLabel={backLabel} hideSearch />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
        {status === "loading" ? (
          <StatusPanel
            title={t("detail.loadingTitle")}
            body={t("detail.loadingBody", { noun: t(config.nounKey) })}
            backPath={backPath}
            backLabel={backLabel}
          />
        ) : status === "not-found" ? (
          <StatusPanel
            title={notFoundTitle}
            body={notFoundBody}
            backPath={backPath}
            backLabel={backLabel}
          />
        ) : category === "hotels" ? (
          <HotelDetails hotel={item} cityName={cityName} onClose={() => navigate(backPath)} />
        ) : (
          <PlaceDetails
            place={item}
            onClose={() => navigate(backPath)}
            backLabel={backLabel}
          />
        )}
      </div>
    </div>
  );
}
