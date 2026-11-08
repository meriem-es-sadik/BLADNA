import { ChevronDown, Globe } from "lucide-react";
import { useI18n } from "../i18n/LanguageContext";

export default function LanguageSwitcher({ className = "" }) {
  const { lang, setLang, languages, t } = useI18n();

  return (
    <label className={`relative inline-flex items-center ${className}`}>
      <Globe
        className="pointer-events-none absolute start-2.5 h-3.5 w-3.5 text-gold-deep"
        aria-hidden="true"
      />
      <span className="sr-only">{t("nav.selectLanguage")}</span>
      <select
        value={lang}
        onChange={(event) => setLang(event.target.value)}
        aria-label={t("nav.selectLanguage")}
        className="appearance-none rounded-full border border-gold/40 bg-white/70 py-1.5 pe-7 ps-8 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/70 transition hover:border-gold/70 focus:border-gold/80 focus:outline-none focus:ring-2 focus:ring-[#c9a24b]/30"
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.short}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute end-2 h-3.5 w-3.5 text-ink/45"
        aria-hidden="true"
      />
    </label>
  );
}
