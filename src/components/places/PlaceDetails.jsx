import { useEffect, useState } from "react";
import { ArrowLeft, Clock, Compass, MapPin, Phone, Utensils } from "lucide-react";
import HotelGallery from "../hotels/HotelGallery";
import PlaceActions from "../PlaceActions";
import { getPlacePhotos } from "../../services/hotelPhotosService";
import { useI18n } from "../../i18n/LanguageContext";

export default function PlaceDetails({ place, onClose }) {
  const { t } = useI18n();
  const Icon = place.kind === "restaurant" ? Utensils : Compass;
  const [images, setImages] = useState(place.images || []);

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

  const backLabel =
    place.kind === "restaurant"
      ? t("places.backRestaurants", { city: place.city })
      : t("places.backActivities", { city: place.city });

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onClose}
        className="group inline-flex items-center gap-2 rounded-full border border-gold/35 bg-white/60 px-4 py-2 text-xs font-semibold text-ink/70 transition-all duration-300 hover:-translate-x-0.5 hover:border-gold/70 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep sm:text-sm"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5 rtl:rotate-180 rtl:group-hover:translate-x-0.5" aria-hidden="true" />
        {backLabel}
      </button>

      <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-gold/30 bg-[#fbf6ea] shadow-[0_22px_50px_-24px_rgba(63,42,18,0.45)]">
        <HotelGallery images={images} name={place.name} kind={place.kind} city={place.city} />

        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{place.name}</h2>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-gold-deep">
                {place.typeLabel} · {place.city}
              </p>
            </div>
            <span className="rounded-full border border-[#c9a24b]/60 bg-[#c9a24b]/15 px-3.5 py-1.5 text-xs font-bold text-gold-deep">
              {t("common.verified")}
            </span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-ink/70">{place.description}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-gold/25 bg-white/60 p-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
                {t("places.location")}
              </h3>
              <p className="mt-2 flex items-start gap-2 text-sm text-ink/70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{place.address || place.area || place.city}</span>
              </p>
            </div>

            <div className="rounded-2xl border border-gold/25 bg-white/60 p-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
                {place.kind === "restaurant" ? t("places.diningDetails") : t("places.visitorDetails")}
              </h3>
              <ul className="mt-2 space-y-2 text-sm text-ink/65">
                <li className="flex items-start gap-2">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{place.typeLabel}</span>
                </li>
                {place.cuisine && (
                  <li className="flex items-start gap-2">
                    <Utensils className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{t("places.cuisine", { cuisine: place.cuisine })}</span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{place.openingHours || t("places.openingNotVerified")}</span>
                </li>
              </ul>
            </div>
          </div>

          <PlaceActions
            website={place.website}
            lat={place.lat}
            lon={place.lon}
            name={place.name}
            city={place.city}
            osmUrl={place.sourceUrl}
          />

          {place.phone && (
            <div className="mt-3">
              <a
                href={`tel:${String(place.phone).replace(/[^+\d]/g, "")}`}
                className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-5 py-2.5 text-xs font-semibold text-gold-deep transition-all duration-300 hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep sm:text-sm"
              >
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                {place.phone}
              </a>
            </div>
          )}

          <p className="mt-4 text-[11px] leading-relaxed text-ink/45">
            {t("places.detailsSource", {
              verified: place.verifiedAt
                ? t("places.verifiedOn", { date: place.verifiedAt })
                : "",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
