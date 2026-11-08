import { useId } from "react";
import { useI18n } from "../i18n/LanguageContext";

export default function BrandLogo({ showWordmark = true, className = "" }) {
  const gradientId = useId().replace(/[:]/g, "");
  const { t } = useI18n();

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e7c47c" />
            <stop offset="0.55" stopColor="#d3a24b" />
            <stop offset="1" stopColor="#97742e" />
          </linearGradient>
        </defs>
        <path
          d="M16 2.5 19.2 8.4 25.8 6.9 24.3 13.5 30 16 24.3 18.5 25.8 25.1 19.2 23.6 16 29.5 12.8 23.6 6.2 25.1 7.7 18.5 2 16 7.7 13.5 6.2 6.9 12.8 8.4Z"
          fill={`url(#${gradientId})`}
        />
        <circle cx="16" cy="16" r="5.2" fill="#fbf6ea" />
        <circle cx="16" cy="16" r="2.2" fill="#97742e" />
      </svg>
      {showWordmark ? (
        <span className="font-display text-sm font-semibold uppercase tracking-[0.3em] text-gold-deep sm:text-base">
          {t("brand.name")}
        </span>
      ) : null}
    </span>
  );
}
