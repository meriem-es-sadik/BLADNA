import { useEffect, useState } from "react";
import HotelGallery from "./HotelGallery";
import PlaceActions from "../PlaceActions";
import { getHotelPhotos } from "../../services/hotelPhotosService";
import { useI18n } from "../../i18n/LanguageContext";
import { buildOsmUrl } from "../../utils/links";

export default function HotelDetails({ hotel, cityName, onClose }) {
  const { t } = useI18n();
  const [images, setImages] = useState(hotel.images || []);

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
  const location = hotel.address || hotel.area || `${hotel.city}, Morocco`;

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onClose}
        className="group inline-flex items-center gap-2 rounded-full border border-gold/35 bg-white/60 px-4 py-2 text-xs font-semibold text-ink/70 transition-all duration-300 hover:-translate-x-0.5 hover:border-gold/70 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep sm:text-sm"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5 rtl:rotate-180 rtl:group-hover:translate-x-0.5"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        {t("hotels.back", { city: cityName })}
      </button>

      <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-gold/30 bg-[#fbf6ea] shadow-[0_22px_50px_-24px_rgba(63,42,18,0.45)]">
        <HotelGallery images={images} name={hotel.name} kind="hotel" city={hotel.city} />

        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                {hotel.name}
              </h2>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-gold-deep">
                {hotel.typeLabel}
                {hotel.stars ? ` · ${t("hotels.star", { count: hotel.stars })}` : ""} · {hotel.city}
              </p>
            </div>
            {typeof hotel.rating === "number" && (
              <span className="rounded-full border border-[#c9a24b]/60 bg-[#c9a24b]/15 px-3.5 py-1.5 text-sm font-bold text-gold-deep">
                {hotel.rating.toFixed(1)} / 5
              </span>
            )}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-ink/70">{hotel.description}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-gold/25 bg-white/60 p-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
                {t("hotels.location")}
              </h3>
              <p className="mt-2 flex items-start gap-2 text-sm text-ink/70">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-4 w-4 shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>{location}</span>
              </p>
            </div>

            <div className="rounded-2xl border border-gold/25 bg-white/60 p-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
                {t("hotels.amenities")}
              </h3>
              {hotel.amenities?.length ? (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {hotel.amenities.map((a) => (
                    <li key={a} className="rounded-full border border-gold/25 bg-[#f6ecd8] px-2.5 py-1 text-[11px] font-semibold text-ink/65">
                      {a}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-ink/55">{t("hotels.noAmenities")}</p>
              )}
            </div>
          </div>

          <PlaceActions
            website={hotel.website}
            lat={hotel.lat}
            lon={hotel.lon}
            name={hotel.name}
            city={hotel.city || cityName}
            osmUrl={osmUrl}
          />

          {hotel.phone && (
            <div className="mt-3">
              <a
                href={`tel:${String(hotel.phone).replace(/[^+\d]/g, "")}`}
                className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-5 py-2.5 text-xs font-semibold text-gold-deep transition-all duration-300 hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep sm:text-sm"
              >
                {hotel.phone}
              </a>
            </div>
          )}

          <p className="mt-4 text-[11px] leading-relaxed text-ink/45">
            {t("hotels.detailsSource", {
              verified: hotel.verifiedAt
                ? t("hotels.verifiedOn", { date: hotel.verifiedAt })
                : "",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
