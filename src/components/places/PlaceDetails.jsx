import { useEffect, useState } from "react";
import { ArrowLeft, Clock, Compass, Phone, Utensils } from "lucide-react";
import HotelGallery from "../hotels/HotelGallery";
import ItemLocation from "../ItemLocation";
import PlaceActions from "../PlaceActions";
import { getPlacePhotos } from "../../services/hotelPhotosService";
import { useI18n } from "../../i18n/LanguageContext";
import { getLastCheckedAt, getSourceLabelKey } from "../../utils/dataProvenance";
import { buildOsmUrl, resolveReservationUrl, safeOsmEntityUrl } from "../../utils/links";

export default function PlaceDetails({ place, onClose, backLabel }) {
  const { t } = useI18n();
  const Icon = place.kind === "restaurant" ? Utensils : Compass;
  const sourceLabelKey = getSourceLabelKey(place);
  const lastCheckedAt = getLastCheckedAt(place);
  const [images, setImages] = useState(place.images || []);
  const osmUrl =
    safeOsmEntityUrl(place.sourceUrl) ||
    buildOsmUrl({ osmType: place.osmType, osmId: place.osmId });
  const reservationLabel =
    place.kind === "restaurant"
      ? "detail.reserveTable"
      : place.activityGroup === "attractions"
        ? "detail.bookTickets"
        : "detail.bookNow";

  useEffect(() => {
    const controller = new AbortController();
    setImages(place.images || []);
    getPlacePhotos(place, controller.signal)
      .then((photos) => {
        if (!controller.signal.aborted) setImages(photos);
      })
      .catch((error) => {
        if (error.name !== "AbortError") setImages(place.images || []);
      });
    return () => controller.abort();
  }, [place]);

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onClose}
        className="group inline-flex items-center gap-2 rounded-full border border-gold/35 bg-white/60 px-3 py-1.5 text-[11px] font-semibold text-ink/70 transition-all duration-300 hover:-translate-x-0.5 hover:border-gold/70 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep sm:text-xs"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5 rtl:rotate-180 rtl:group-hover:translate-x-0.5" aria-hidden="true" />
        {backLabel}
      </button>

      <div data-detail-card className="mt-3 overflow-hidden rounded-[1.25rem] border border-gold/30 bg-[#fbf6ea] shadow-[0_16px_36px_-24px_rgba(63,42,18,0.45)]">
        <HotelGallery images={images} name={place.name} kind={place.kind} city={place.city} />

        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">{place.name}</h2>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
                {place.typeLabel} · {place.city}
              </p>
            </div>
            <span className="rounded-full border border-[#c9a24b]/60 bg-[#c9a24b]/15 px-2.5 py-1 text-[11px] font-bold text-gold-deep">
              {t(sourceLabelKey)}
            </span>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-ink/70 sm:text-sm">{place.description}</p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <ItemLocation item={place} cityName={place.city} osmUrl={osmUrl} />

            <div className="rounded-xl border border-gold/25 bg-white/60 p-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
                {place.kind === "restaurant" ? t("places.diningDetails") : t("places.visitorDetails")}
              </h3>
              <ul className="mt-1.5 space-y-1.5 text-xs leading-relaxed text-ink/65">
                <li className="flex items-start gap-1.5">
                  <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{place.typeLabel}</span>
                </li>
                {place.cuisine && (
                  <li className="flex items-start gap-1.5">
                    <Utensils className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>{t("places.cuisine", { cuisine: place.cuisine })}</span>
                  </li>
                )}
                <li className="flex items-start gap-1.5">
                  <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{place.openingHours || t("places.openingNotVerified")}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-4 border-t border-gold/20 pt-0.5">
            <PlaceActions
              website={place.website}
              reservationUrl={resolveReservationUrl(place)}
              reservationLabel={reservationLabel}
              lat={place.lat}
              lon={place.lon}
              name={place.name}
              city={place.city}
              osmUrl={osmUrl}
            />
          </div>

          {place.phone && (
            <div className="mt-2">
              <a
                href={`tel:${String(place.phone).replace(/[^+\d]/g, "")}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-gold/50 px-3 py-1.5 text-[11px] font-semibold text-gold-deep transition-all duration-300 hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep sm:text-xs"
              >
                <Phone className="h-3 w-3" aria-hidden="true" />
                {place.phone}
              </a>
            </div>
          )}

          <p className="mt-3 border-t border-gold/20 pt-3 text-[10px] leading-relaxed text-ink/45">
            {t("places.detailsSource")}
            {lastCheckedAt
              ? ` ${t("common.lastChecked", { date: lastCheckedAt })}`
              : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
