import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Images, MapPin, Star } from "lucide-react";
import { getFallbackPhoto, getPrimaryPhoto } from "../../services/hotelPhotosService";
import { useI18n } from "../../i18n/LanguageContext";
import {
  getRatingSourceLabelKey,
  getRatingSourceShortLabelKey,
  getSourceLabelKey,
} from "../../utils/dataProvenance";
import { buildOsmUrl } from "../../utils/links";
import PlaceActions from "../PlaceActions";

function photoFromHotel(hotel) {
  if (!hotel.image) return null;
  return {
    url: hotel.image,
    credit: hotel.imageCredit,
    license: hotel.imageLicense,
    sourceUrl: hotel.imageSourceUrl,
  };
}

export default function HotelCard({ hotel, cityName, href }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const sourceLabelKey = getSourceLabelKey(hotel);
  const ratingSourceLabelKey = getRatingSourceLabelKey(hotel);
  const ratingSourceShortLabelKey = getRatingSourceShortLabelKey(hotel);
  const [photo, setPhoto] = useState(() => photoFromHotel(hotel));
  const [loading, setLoading] = useState(!hotel.image);
  const failedRef = useRef(false);

  useEffect(() => {
    failedRef.current = false;
    if (hotel.image) {
      setPhoto(photoFromHotel(hotel));
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    setPhoto(null);
    setLoading(true);
    getPrimaryPhoto(hotel, controller.signal)
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
  }, [hotel.id, hotel.image, hotel.wikimediaCommons, hotel.wikidata]);

  const fallback = getFallbackPhoto(hotel);
  const src = photo?.url || fallback?.url || "/img/hotel-placeholder.svg";
  const isIllustrative = !photo || photo.isIllustrative;
  const location = hotel.address || hotel.area || hotel.city || cityName;
  const imageCount = hotel.images?.length || 0;
  const hasMultiple = imageCount > 1;
  const meta = [hotel.typeLabel, hotel.stars ? t("hotels.star", { count: hotel.stars }) : null]
    .filter(Boolean)
    .join(" · ");
  const ratingSourceLabel = ratingSourceLabelKey ? t(ratingSourceLabelKey) : null;
  const ratingSourceShort = ratingSourceShortLabelKey ? t(ratingSourceShortLabelKey) : null;
  const alt = isIllustrative
    ? t("gallery.illustrativeAlt", { kind: "hotel" })
    : t("gallery.photoAlt", {
        name: hotel.name,
        index: 1,
        total: Math.max(1, imageCount),
      });

  const open = () => navigate(href);

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
      className="group flex cursor-pointer flex-col overflow-hidden rounded-[1.25rem] border border-gold/30 bg-[#fbf6ea] shadow-[0_10px_26px_-18px_rgba(63,42,18,0.4)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-[0_18px_36px_-18px_rgba(63,42,18,0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep focus-within:border-gold/60"
    >
      <div className="relative overflow-hidden bg-[#efe3c8]">
        <div className="aspect-[16/9] w-full">
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onError={() => {
              if (!failedRef.current && photo && !photo.isIllustrative) {
                failedRef.current = true;
                setPhoto(null);
                setLoading(false);
              }
            }}
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
          />
        </div>
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#1b140c]/45 via-transparent to-transparent"
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

        {ratingSourceLabel && (
          <span
            title={ratingSourceLabel}
            aria-label={`${hotel.rating.toFixed(1)} — ${ratingSourceLabel}`}
            className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full border border-[#c9a24b]/60 bg-white/90 px-2.5 py-1 text-xs font-bold text-gold-deep shadow-sm backdrop-blur-sm"
          >
            <Star className="h-3 w-3" fill="currentColor" aria-hidden="true" />
            {hotel.rating.toFixed(1)}
            <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-gold-deep/70">
              {ratingSourceShort}
            </span>
          </span>
        )}

        {hasMultiple && (
          <span className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/40 bg-[#1b140c]/55 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
            <Images className="h-3 w-3" aria-hidden="true" />
            {imageCount}
          </span>
        )}

        {isIllustrative ? (
          <span
            title={
              fallback?.credit
                ? `${t("common.illustrative")}: ${fallback.credit}${fallback.license ? ` (${fallback.license})` : ""}`
                : t("common.illustrative")
            }
            className="absolute bottom-2 end-2 max-w-[calc(100%-1rem)] truncate rounded-full border border-white/40 bg-[#1b140c]/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm"
          >
            {loading ? t("hotels.loadingPhoto") : t("gallery.illustrativeHotel")}
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
        <h3
          title={hotel.name}
          className="line-clamp-2 break-words font-display text-base font-semibold leading-snug text-ink sm:text-lg"
        >
          {hotel.name}
        </h3>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-deep">
          {meta}
        </p>
        <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-relaxed text-ink/55">
          <MapPin className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="line-clamp-1 break-words">{location}</span>
        </p>
        {hotel.description ? (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink/60">
            {hotel.description}
          </p>
        ) : null}
        <p className="mt-2 inline-flex w-fit items-center rounded-full border border-gold/25 bg-[#f6ecd8]/80 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-ink/55">
          {t(sourceLabelKey)}
        </p>

        <div className="mt-auto">
          <PlaceActions
            variant="card"
            website={hotel.website}
            bookingUrl={hotel.bookingUrl}
            reservationUrl={hotel.reservationUrl}
            reservationLabel="detail.bookNow"
            lat={hotel.lat}
            lon={hotel.lon}
            name={hotel.name}
            city={cityName}
            osmUrl={buildOsmUrl({ osmType: hotel.osmType, osmId: hotel.osmId })}
          />

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              open();
            }}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-gold/50 px-4 py-1.5 text-xs font-semibold text-gold-deep transition-all duration-300 hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep sm:w-fit"
          >
            {t("common.viewDetails")}
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
