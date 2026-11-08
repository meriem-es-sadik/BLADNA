import { useEffect, useRef, useState } from "react";
import { getFallbackPhoto, getPrimaryPhoto } from "../../services/hotelPhotosService";
import { useI18n } from "../../i18n/LanguageContext";
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

export default function HotelCard({ hotel, cityName, onDetails }) {
  const { t } = useI18n();
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
  const src = photo?.url || fallback?.url;
  const isIllustrative = !photo || photo.isIllustrative;
  const location = hotel.address || hotel.area || cityName;

  const open = () => onDetails(hotel);

  return (
    <article
      onClick={open}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-[1.25rem] border border-gold/30 bg-[#fbf6ea] shadow-[0_12px_30px_-18px_rgba(63,42,18,0.4)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-gold/60 hover:shadow-[0_20px_40px_-18px_rgba(63,42,18,0.45)]"
    >
      <div className="relative overflow-hidden">
        <img
          src={src}
          alt={isIllustrative ? t("hotels.illustrative") : hotel.name}
          loading="lazy"
          decoding="async"
          onError={() => {
            if (!failedRef.current && photo && !photo.isIllustrative) {
              failedRef.current = true;
              setPhoto(null);
              setLoading(false);
            }
          }}
          className="aspect-[16/10] w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
        />
        {loading && (
          <span
            className="pointer-events-none absolute inset-0 animate-pulse bg-white/35"
            aria-hidden="true"
          />
        )}
        {isIllustrative ? (
          <span
            title={
              fallback?.credit
                ? `${t("common.illustrative")}: ${fallback.credit}${fallback.license ? ` (${fallback.license})` : ""}`
                : t("common.illustrative")
            }
            className="absolute bottom-2 end-2 max-w-[calc(100%-1rem)] truncate rounded-full border border-gold/30 bg-white/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/55 backdrop-blur-sm"
          >
            {loading ? t("hotels.loadingPhoto") : t("hotels.illustrative")}
          </span>
        ) : (
          photo?.credit && (
            <a
              href={photo.sourceUrl || photo.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title={`${t("common.photo", { credit: photo.credit })}${photo.license ? ` (${photo.license})` : ""}`}
              className="absolute bottom-2 end-2 max-w-[calc(100%-1rem)] truncate rounded-full border border-gold/30 bg-white/85 px-2 py-0.5 text-[10px] font-semibold text-ink/60 backdrop-blur-sm hover:text-gold-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
            >
              {t("common.photo", { credit: photo.credit })}
              {photo.license ? ` · ${photo.license}` : ""}
            </a>
          )
        )}
        {typeof hotel.rating === "number" && (
          <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full border border-[#c9a24b]/60 bg-white/90 px-2.5 py-1 text-xs font-bold text-gold-deep shadow-sm backdrop-blur-sm">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3" aria-hidden="true"><path d="m12 2 2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2Z"/></svg>
            {hotel.rating.toFixed(1)}
          </span>
        )}
        {hotel.images?.length > 1 && (
          <span className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/40 bg-[#1b140c]/55 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
            {hotel.images.length}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 text-start sm:p-5">
        <h3 className="font-display text-lg font-semibold leading-snug text-ink">
          {hotel.name}
        </h3>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-deep">
          {hotel.typeLabel}
          {hotel.stars ? ` · ${t("hotels.star", { count: hotel.stars })}` : ""}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">{hotel.description}</p>
        <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-ink/55">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-3.5 w-3.5 shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>{location}</span>
        </p>

        <PlaceActions
          variant="card"
          website={hotel.website}
          lat={hotel.lat}
          lon={hotel.lon}
          name={hotel.name}
          city={cityName}
          osmUrl={buildOsmUrl({ osmType: hotel.osmType, osmId: hotel.osmId })}
        />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
          className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-gold/50 px-4 py-1.5 text-xs font-semibold text-gold-deep transition-all duration-300 hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
        >
          {t("common.viewDetails")}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 rtl:rotate-180"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </div>
    </article>
  );
}
