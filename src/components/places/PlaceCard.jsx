import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { getFallbackPhoto, getPrimaryPhoto } from "../../services/hotelPhotosService";
import { useI18n } from "../../i18n/LanguageContext";
import { getSourceLabelKey } from "../../utils/dataProvenance";
import { buildOsmUrl } from "../../utils/links";
import PlaceActions from "../PlaceActions";

function photoFromPlace(place) {
  if (!place.image) return null;
  return {
    url: place.image,
    credit: place.imageCredit,
    license: place.imageLicense,
    sourceUrl: place.imageSourceUrl,
  };
}

export default function PlaceCard({ place, href }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const sourceLabelKey = getSourceLabelKey(place);
  const [photo, setPhoto] = useState(() => photoFromPlace(place));
  const [loading, setLoading] = useState(!place.image);
  const failedRef = useRef(false);

  useEffect(() => {
    failedRef.current = false;
    if (place.image) {
      setPhoto(photoFromPlace(place));
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    setPhoto(null);
    setLoading(true);
    getPrimaryPhoto(place, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setPhoto(result);
        setLoading(false);
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setLoading(false);
      });
    return () => controller.abort();
  }, [place.id, place.image, place.wikimediaCommons, place.wikidata]);

  const open = () => navigate(href);
  const fallback = getFallbackPhoto(place);
  const src = photo?.url || fallback?.url;
  const isIllustrative = !photo || photo.isIllustrative;
  const illustrationText =
    place.kind === "restaurant"
      ? t("gallery.illustrativeRestaurant")
      : t("gallery.illustrativePlace");

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={open}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      }}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-[1.25rem] border border-gold/30 bg-[#fbf6ea] shadow-[0_10px_26px_-18px_rgba(63,42,18,0.4)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-[0_18px_36px_-18px_rgba(63,42,18,0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
    >
      <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-[#efe3c8]">
        <img
          src={src}
          alt={
            isIllustrative
              ? t("gallery.illustrativeAlt", { kind: place.kind })
              : place.name
          }
          loading="lazy"
          decoding="async"
          onError={() => {
            if (!failedRef.current && photo && !photo.isIllustrative) {
              failedRef.current = true;
              setPhoto(null);
              setLoading(false);
            }
          }}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div
          className="absolute inset-0 bg-linear-to-t from-[#1b140c]/45 via-transparent to-transparent"
          aria-hidden="true"
        />
        <span className="pointer-events-none absolute inset-x-3 top-1/2 flex -translate-y-[35%] items-center justify-center gap-1.5 rounded-full border border-white/45 bg-[#1b140c]/70 px-3 py-1.5 text-[11px] font-semibold text-white opacity-0 backdrop-blur-sm transition duration-300 group-hover:-translate-y-1/2 group-hover:opacity-100 group-focus-visible:-translate-y-1/2 group-focus-visible:opacity-100">
          {t("common.viewDetails")}
          <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
        </span>

        {loading && (
          <span
            className="pointer-events-none absolute inset-0 animate-pulse bg-white/30"
            aria-hidden="true"
          />
        )}

        <span className="absolute start-3 top-3 rounded-full border border-gold/35 bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-deep backdrop-blur-sm">
          {t(sourceLabelKey)}
        </span>

        {isIllustrative ? (
          <span
            title={
              fallback?.credit
                ? `${t("common.illustrative")}: ${fallback.credit}${fallback.license ? ` (${fallback.license})` : ""}`
                : t("common.illustrative")
            }
            className="absolute bottom-2 end-2 max-w-[calc(100%-1rem)] truncate rounded-full border border-white/40 bg-[#1b140c]/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm"
          >
            {loading ? t("hotels.loadingPhoto") : illustrationText}
          </span>
        ) : (
          photo?.credit && (
            <a
              href={photo.sourceUrl || photo.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
              title={`${t("common.photo", { credit: photo.credit })}${photo.license ? ` (${photo.license})` : ""}`}
              className="absolute bottom-2 end-2 max-w-[calc(100%-1rem)] truncate rounded-full border border-white/40 bg-[#1b140c]/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {t("common.photo", { credit: photo.credit })}
              {photo.license ? ` · ${photo.license}` : ""}
            </a>
          )
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 text-start">
        <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug text-ink sm:text-lg">
          {place.name}
        </h3>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-deep">
          {place.typeLabel}
        </p>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink/65">
          {place.description}
        </p>
        <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-relaxed text-ink/55">
          <MapPin className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="line-clamp-1">{place.location}</span>
        </p>

        <PlaceActions
          variant="card"
          website={place.website}
          reservationUrl={place.reservationUrl}
          reservationLabel={
            place.kind === "restaurant"
              ? "detail.reserveTable"
              : place.activityGroup === "attractions"
                ? "detail.bookTickets"
                : "detail.bookNow"
          }
          lat={place.lat}
          lon={place.lon}
          name={place.name}
          city={place.city}
          osmUrl={buildOsmUrl({ osmType: place.osmType, osmId: place.osmId })}
        />

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            open();
          }}
          className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-gold/50 px-4 py-1.5 text-xs font-semibold text-gold-deep transition-all duration-300 hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
        >
          {t("common.viewDetails")}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </div>
    </article>
  );
}
