import { ExternalLink, MapPin, Navigation } from "lucide-react";
import { useI18n } from "../i18n/LanguageContext";
import {
  buildOsmDirectionsUrl,
  buildOsmLocationUrl,
  safeBookingUrl,
  safeExternalUrl,
  safeOsmEntityUrl,
  safeReservationUrl,
} from "../utils/links";

export default function PlaceActions({
  website,
  bookingUrl,
  reservationUrl,
  lat,
  lon,
  name,
  city,
  osmUrl,
  reservationLabel = "detail.bookNow",
  variant = "details",
  className = "",
}) {
  const { t } = useI18n();
  const site = safeExternalUrl(website);
  const booking = safeBookingUrl(bookingUrl) || safeReservationUrl(reservationUrl);
  const mapUrl = buildOsmLocationUrl({ lat, lon });
  const directionsUrl = buildOsmDirectionsUrl({ lat, lon });
  const sourceUrl = safeOsmEntityUrl(osmUrl);
  const isCard = variant === "card";

  const base = isCard
    ? "inline-flex items-center gap-1 rounded-full border border-gold/50 px-2.5 py-1 text-[11px] font-semibold text-gold-deep transition-all duration-300 hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
    : "inline-flex items-center gap-1.5 rounded-full border border-gold/50 px-3 py-1.5 text-[11px] font-semibold text-gold-deep transition-all duration-300 hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep sm:text-xs";

  const iconClass = "h-3 w-3";

  return (
    <div
      data-detail-actions
      className={(isCard ? "mt-3 flex flex-wrap gap-1.5 " : "mt-3 flex flex-wrap gap-2 ") + className}
    >
      {site ? (
        <a
          href={site}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => event.stopPropagation()}
          className={base}
        >
          <ExternalLink className={iconClass} aria-hidden="true" />
          {t("common.visitWebsite")}
        </a>
      ) : null}
      {booking ? (
        <a
          data-booking-link
          href={booking}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => event.stopPropagation()}
          className={base}
        >
          <ExternalLink className={iconClass} aria-hidden="true" />
          {t(reservationLabel)}
        </a>
      ) : null}
      {mapUrl ? (
        <a
          data-map-link
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => event.stopPropagation()}
          className={base}
        >
          <MapPin className={iconClass} aria-hidden="true" />
          {t("common.viewOnMap")}
        </a>
      ) : null}
      {directionsUrl && !isCard ? (
        <a
          data-direction-link
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => event.stopPropagation()}
          className={base}
        >
          <Navigation className={iconClass} aria-hidden="true" />
          {t("detail.getDirections")}
        </a>
      ) : null}
      {sourceUrl && !isCard ? (
        <a
          data-source-link
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => event.stopPropagation()}
          className={base}
        >
          <ExternalLink className={iconClass} aria-hidden="true" />
          {t("common.viewOnOsm")}
        </a>
      ) : null}
    </div>
  );
}
