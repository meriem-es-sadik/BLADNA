import { useEffect, useRef, useState } from "react";
import { ArrowLeft, MapPin, Phone, Star } from "lucide-react";
import HotelGallery from "./HotelGallery";
import PlaceActions from "../PlaceActions";
import { getHotelPhotos } from "../../services/hotelPhotosService";
import { useI18n } from "../../i18n/LanguageContext";
import {
  getLastCheckedAt,
  getRatingSourceLabelKey,
  getSourceLabelKey,
} from "../../utils/dataProvenance";
import { buildOsmUrl } from "../../utils/links";

export default function HotelDetails({ hotel, cityName, onClose }) {
  const { t } = useI18n();
  const sourceLabelKey = getSourceLabelKey(hotel);
  const ratingSourceLabelKey = getRatingSourceLabelKey(hotel);
  const lastCheckedAt = getLastCheckedAt(hotel);
  const [images, setImages] = useState(hotel.images || []);
  const backRef = useRef(null);

  useEffect(() => {
    backRef.current?.focus();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setImages(hotel.images || []);
    getHotelPhotos(hotel, controller.signal)
      .then((photos) => {
        if (!controller.signal.aborted) setImages(photos);
      })
      .catch((error) => {
        if (error.name !== "AbortError") setImages(hotel.images || []);
      });
    return () => controller.abort();
  }, [hotel]);

  const osmUrl = buildOsmUrl({ osmType: hotel.osmType, osmId: hotel.osmId });
  const location = hotel.address || hotel.area || hotel.city || cityName;
  const meta = [hotel.typeLabel, hotel.stars ? t("hotels.star", { count: hotel.stars }) : null]
    .filter(Boolean)
    .join(" · ");
  const ratingSourceLabel = ratingSourceLabelKey ? t(ratingSourceLabelKey) : null;
  const phone = String(hotel.phone || "").split(";")[0].trim();
  const phoneDigits = phone.replace(/[^+\d]/g, "");
  const hasPhone = /\d/.test(phoneDigits);
  const phoneHref = hasPhone ? `tel:${phoneDigits}` : null;

  return (
    <div className="w-full">
      <button
        ref={backRef}
        type="button"
        onClick={onClose}
        className="group inline-flex items-center gap-2 rounded-full border border-gold/35 bg-white/60 px-4 py-2 text-xs font-semibold text-ink/70 transition-all duration-300 hover:-translate-x-0.5 hover:border-gold/70 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep sm:text-sm rtl:hover:translate-x-0.5"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5 rtl:rotate-180 rtl:group-hover:translate-x-0.5" aria-hidden="true" />
        {t("hotels.back", { city: cityName })}
      </button>

      <article className="mt-4 overflow-hidden rounded-[1.5rem] border border-gold/30 bg-[#fbf6ea] shadow-[0_22px_50px_-24px_rgba(63,42,18,0.45)]">
        <HotelGallery images={images} name={hotel.name} kind="hotel" city={hotel.city} />

        <div className="p-5 sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <h2 className="break-words font-display text-2xl font-semibold leading-tight text-ink sm:text-3xl">
                {hotel.name}
              </h2>
              <p className="mt-2 flex items-start gap-1.5 text-sm leading-relaxed text-ink/65">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="break-words">{location}</span>
              </p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
                {meta}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
              <span className="rounded-full border border-gold/35 bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/55">
                {t(sourceLabelKey)}
              </span>
              {ratingSourceLabel && (
                <span
                  title={ratingSourceLabel}
                  aria-label={`${hotel.rating.toFixed(1)} / 5 — ${ratingSourceLabel}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#c9a24b]/60 bg-[#c9a24b]/15 px-3.5 py-1.5 text-sm font-bold text-gold-deep"
                >
                  <Star className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true" />
                  {hotel.rating.toFixed(1)} / 5
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gold-deep/70">
                    {ratingSourceLabel}
                  </span>
                </span>
              )}
            </div>
          </div>

          <div className={"mt-6 grid gap-3 sm:grid-cols-2 " + (hasPhone ? "lg:grid-cols-3" : "")}>
            <section className="h-full rounded-2xl border border-gold/25 bg-white/60 p-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
                {t("hotels.location")}
              </h3>
              <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-ink/70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="break-words">{location}</span>
              </p>
            </section>

            <section className="h-full rounded-2xl border border-gold/25 bg-white/60 p-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
                {t("hotels.amenities")}
              </h3>
              {hotel.amenities?.length ? (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {hotel.amenities.map((amenity) => (
                    <li key={amenity} className="rounded-full border border-gold/25 bg-[#f6ecd8] px-2.5 py-1 text-[11px] font-semibold text-ink/65">
                      {amenity}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-ink/55">{t("hotels.noAmenities")}</p>
              )}
            </section>

            {hasPhone && (
              <section className="h-full rounded-2xl border border-gold/25 bg-white/60 p-4">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
                  {t("hotels.phone")}
                </h3>
                <a
                  href={phoneHref}
                  className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-gold-deep underline-offset-2 transition-colors hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {phone}
                </a>
              </section>
            )}
          </div>

          <div className="mt-6 border-t border-gold/20 pt-1">
            <PlaceActions
              website={hotel.website}
              bookingUrl={hotel.bookingUrl}
              lat={hotel.lat}
              lon={hotel.lon}
              name={hotel.name}
              city={hotel.city || cityName}
              osmUrl={osmUrl}
            />
          </div>

          <p className="mt-4 border-t border-gold/20 pt-4 text-[11px] leading-relaxed text-ink/45">
            {t("hotels.detailsSource")}
            {lastCheckedAt
              ? ` ${t("common.lastChecked", { date: lastCheckedAt })}`
              : ""}
          </p>
        </div>
      </article>
    </div>
  );
}
