import { useI18n } from "../i18n/LanguageContext";

export default function BrandLogo({ showWordmark = true, className = "" }) {
  const { t } = useI18n();

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src="/img/zliij-removebg-preview.png"
        alt=""
        width="242"
        height="240"
        className="h-9 w-auto shrink-0 object-contain"
        aria-hidden="true"
      />
      {showWordmark ? (
        <span className="font-display text-sm font-semibold uppercase tracking-[0.3em] text-gold-deep sm:text-base">
          {t("brand.name")}
        </span>
      ) : null}
    </span>
  );
}
