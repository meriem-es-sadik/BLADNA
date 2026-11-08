import { ExternalLink, MapPin } from "lucide-react";
import { useI18n } from "../i18n/LanguageContext";
import { buildMapUrl, safeExternalUrl } from "../utils/links";

export default function PlaceActions({
  website,
  lat,
  lon,
  name,
  city,
  osmUrl,
  variant = "details",
  className = "",
}) {
  const { t } = useI18n();
  const site = safeExternalUrl(website);
  const mapUrl = buildMapUrl({ lat, lon, name, city });
  const isCard = variant === "card";

  const base = isCard
    ? "inline-flex items-center gap-1 rounded-full border border-gold/50 px-2.5 py-1 text-[11px] font-semibold text-gold-deep transition-all duration-300 hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
    : "inline-flex items-center gap-2 rounded-full border border-gold/50 px-5 py-2.5 text-xs font-semibold text-gold-deep transition-all duration-300 hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep sm:text-sm";

  const iconClass = isCard ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <div className={(isCard ? "mt-3 flex flex-wrap gap-1.5 " : "mt-5 flex flex-wrap gap-2.5 ") + className}>
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
      {mapUrl ? (
        <a
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
      {osmUrl && !isCard ? (
        <a
          href={osmUrl}
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
