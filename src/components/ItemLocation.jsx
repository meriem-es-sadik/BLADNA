import { ExternalLink, MapPin, Navigation } from "lucide-react";
import { useI18n } from "../i18n/LanguageContext";
import { buildOsmDirectionsUrl, buildOsmEmbedUrl, isValidCoordinates } from "../utils/links";

export default function ItemLocation({ item, cityName, osmUrl }) {
  const { t } = useI18n();
  const hasCoordinates = isValidCoordinates(item?.lat, item?.lon);
  const city = item?.city || cityName;
  const embedUrl = hasCoordinates ? buildOsmEmbedUrl(item) : null;
  const directionsUrl = hasCoordinates ? buildOsmDirectionsUrl(item) : null;
  const hasExactLocation = Boolean(item?.address || item?.area || hasCoordinates);
  const linkClass =
    "inline-flex items-center gap-1.5 rounded-full border border-gold/50 px-2.5 py-1 text-[11px] font-semibold text-gold-deep transition-all duration-300 hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep sm:text-xs";

  return (
    <section data-location-panel className="rounded-xl border border-gold/25 bg-white/60 p-3">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
        {t("detail.location")}
      </h3>

      {hasExactLocation ? (
        <>
          <dl className="mt-2 space-y-1 text-xs leading-relaxed text-ink/70">
            {city ? (
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 font-semibold text-ink/55">{t("detail.city")}:</dt>
                <dd className="min-w-0 break-words">{city}</dd>
              </div>
            ) : null}
            {item?.area ? (
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 font-semibold text-ink/55">
                  {t("detail.neighborhood")}:
                </dt>
                <dd className="min-w-0 break-words">{item.area}</dd>
              </div>
            ) : null}
            {item?.address ? (
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 font-semibold text-ink/55">{t("detail.address")}:</dt>
                <dd className="min-w-0 break-words">{item.address}</dd>
              </div>
            ) : null}
            {hasCoordinates ? (
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 font-semibold text-ink/55">
                  {t("detail.coordinates")}:
                </dt>
                <dd className="min-w-0 break-words" dir="ltr">
                  {Number(item.lat).toFixed(5)}, {Number(item.lon).toFixed(5)}
                </dd>
              </div>
            ) : null}
          </dl>

          {embedUrl ? (
            <div className="mt-2 overflow-hidden rounded-lg border border-gold/20 bg-[#f6ecd8]">
              <iframe
                data-map-frame
                title={`${t("detail.mapPreview")} — ${item?.name || city}`}
                src={embedUrl}
                className="block h-36 w-full sm:h-44"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          ) : null}

          <div className="mt-2 flex flex-wrap gap-1.5">
            {directionsUrl ? (
              <a
                data-direction-link
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                <Navigation className="h-3 w-3" aria-hidden="true" />
                {t("detail.getDirections")}
              </a>
            ) : null}
            {osmUrl ? (
              <a href={osmUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
                {t("common.viewOnOsm")}
              </a>
            ) : null}
          </div>
        </>
      ) : (
        <p data-location-unavailable className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-ink/60">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {t("detail.locationUnavailable")}
        </p>
      )}
    </section>
  );
}
