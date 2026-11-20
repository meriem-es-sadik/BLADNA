import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useI18n } from "../i18n/LanguageContext";
import { goldCtaClass, goldCtaIconClass } from "../utils/ctaStyles";

export default function HeroCard() {
  const { t } = useI18n();

  return (
    <section
      style={{ animationDelay: "400ms" }}
      className="animate-fade-up flex w-full flex-col items-center rounded-[1.75rem] border border-[rgba(240,215,165,0.3)] bg-[rgba(230,205,155,0.18)] px-6 py-8 text-center shadow-[0_22px_56px_-16px_rgba(15,10,4,0.38),inset_0_1px_0_rgba(242,216,166,0.28),inset_0_-28px_48px_-24px_rgba(211,162,75,0.2)] backdrop-blur-[8px] sm:px-8 sm:py-8"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-ivory [text-shadow:0_1px_8px_rgba(40,26,8,0.7)] sm:text-xs">
        {t("home.welcome")}
      </p>

      <h1 className="mt-4 font-display text-[2rem] font-medium leading-[1.2] text-ivory drop-shadow-[0_2px_14px_rgba(40,26,8,0.7)] sm:text-4xl lg:text-[2.55rem]">
        {t("home.titleA")}{" "}
        <br className="hidden md:block" aria-hidden="true" />
        {t("home.titleB")}{" "}
        <br className="hidden md:block" aria-hidden="true" />
        <span className="italic">{t("home.titleC")}</span>
      </h1>

      <p className="mt-4 max-w-[26rem] text-sm leading-relaxed text-ivory [text-shadow:0_1px_8px_rgba(40,26,8,0.65)] sm:mt-5 sm:text-[15px]">
        {t("home.description")}
      </p>

      <Link
        to="/destinations"
        className={`${goldCtaClass} mt-7 gap-2.5 px-7 py-3.5 text-sm sm:mt-8`}
      >
        {t("home.cta")}
        <ArrowRight className={goldCtaIconClass} aria-hidden="true" />
      </Link>
    </section>
  );
}
