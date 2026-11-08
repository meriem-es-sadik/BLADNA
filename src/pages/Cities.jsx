import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import SiteNav from "../components/SiteNav";
import { citiesByRegion } from "../data/cities";
import { regionName } from "../data/regions";
import { useI18n } from "../i18n/LanguageContext";

const CITY_STORAGE_KEY = "bladna-selected-city";

export default function Cities() {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const { t, lang } = useI18n();

  useEffect(() => {
    if (!hash) return;
    const target = document.getElementById(hash.slice(1));
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash]);

  const selectCity = (city) => {
    sessionStorage.setItem(
      CITY_STORAGE_KEY,
      JSON.stringify({ name: city.name, slug: city.slug })
    );
    navigate(`/cities/${city.slug}`);
  };

  return (
    <div className="page-anim relative flex min-h-dvh flex-col overflow-clip bg-ivory font-sans text-ink antialiased">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 select-none">
        <img
          src="/img/zliij.png"
          alt=""
          loading="eager"
          className="absolute -left-44 -top-44 w-[380px] opacity-90 mix-blend-multiply sm:-left-52 sm:-top-52 sm:w-[470px]"
          style={{
            maskImage: "radial-gradient(circle at 25% 25%, black 28%, transparent 55%)",
            WebkitMaskImage: "radial-gradient(circle at 25% 25%, black 28%, transparent 55%)",
          }}
        />
        <img
          src="/img/zliij.png"
          alt=""
          loading="lazy"
          className="absolute -right-44 top-[12%] hidden w-[330px] opacity-85 mix-blend-multiply sm:block"
          style={{
            maskImage: "radial-gradient(circle at 80% 50%, black 26%, transparent 52%)",
            WebkitMaskImage: "radial-gradient(circle at 80% 50%, black 26%, transparent 52%)",
          }}
        />
        <img
          src="/img/zliij.png"
          alt=""
          loading="lazy"
          className="absolute -bottom-44 -right-48 w-[380px] opacity-80 mix-blend-multiply sm:-bottom-52 sm:-right-52 sm:w-[460px]"
          style={{
            maskImage: "radial-gradient(circle at 70% 70%, black 28%, transparent 55%)",
            WebkitMaskImage: "radial-gradient(circle at 70% 70%, black 28%, transparent 55%)",
          }}
        />
      </div>

      <SiteNav />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-10 pt-4 sm:px-6 lg:px-10">
        <section className="flex shrink-0 flex-col items-center text-center">
          <span className="mt-2 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/70 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-deep">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
            {t("cities.regionsCovered")}
          </span>
          <h1 className="mt-3 max-w-2xl font-display text-3xl font-medium leading-tight text-ink sm:text-4xl lg:text-[2.5rem] lg:leading-[1.15]">
            {t("cities.titleA")} <span className="italic text-terra">{t("cities.titleB")}</span>
          </h1>
          <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-ink/70 sm:text-[15px]">
            {t("cities.subtitle")}
          </p>
        </section>

        <section aria-label={t("cities.listAria")} className="mt-4 flex flex-col">
          {citiesByRegion.map((region) => (
            <section
              key={region.id}
              id={`region-${region.id}`}
              className="scroll-mt-28 pt-6 first:pt-2"
            >
              <div className="flex items-center gap-3">
                <h2 className="font-display text-lg font-semibold text-ink sm:text-xl">
                  {regionName(region, lang)}
                </h2>
                <span className="shrink-0 rounded-full border border-gold/35 bg-white/70 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-deep">
                  {t("cities.citiesCount", { count: region.cities.length })}
                </span>
                <span className="h-px flex-1 bg-gold/25" aria-hidden="true" />
              </div>

              <ul className="mt-3 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {region.cities.map((city) => (
                  <li key={city.slug} className="min-h-[64px]">
                    <button
                      type="button"
                      onClick={() => selectCity(city)}
                      aria-label={t("cities.select", { city: city.name })}
                      className="group flex h-full min-h-[64px] w-full items-center justify-between gap-3 rounded-[1.1rem] border border-gold/40 bg-[#fbf6ea] px-5 text-start shadow-[0_10px_28px_-16px_rgba(63,42,18,0.4)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold/80 hover:bg-[#f6ecd8] hover:shadow-[0_16px_34px_-16px_rgba(63,42,18,0.45)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep active:translate-y-0"
                    >
                      <span className="font-display text-base font-semibold text-ink sm:text-lg">
                        {city.name}
                      </span>
                      <ArrowUpRight
                        className="h-4 w-4 shrink-0 text-gold-deep transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:rotate-[-90deg] rtl:group-hover:-translate-x-0.5"
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </section>
      </div>
    </div>
  );
}
