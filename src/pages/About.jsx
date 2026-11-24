import { useEffect } from "react";
import SiteNav from "../components/SiteNav";
import ZelligeEdges from "../components/ZelligeEdges";
import ZelligeOrnament from "../components/ZelligeOrnament";
import { useI18n } from "../i18n/LanguageContext";

const ABOUT_HERO_IMAGE = "/img/Marrakech%20Sunset%20with%20Atlas%20Mountains.png";

const ABOUT_WHY_IMAGES = [
  {
    src: "/img/rabat-morocco.jpg",
    altKey: "about.why.imageAltRabat",
  },
  {
    src: "/img/Chefchaouen,Morroco.jpg",
    altKey: "about.why.imageAltChefchaouen",
  },
];

const ABOUT_STORY_IMAGE = {
  src: "/img/%E2%99%A5%EF%B8%8F%D8%A7%D9%84%D8%AF%D8%A7%D8%B1%20%D8%A7%D9%84%D8%A8%D9%8A%D8%B6%D8%A7%D8%A1%20%20%D8%B9%D8%A7%D8%B5%D9%85%D8%A9%20%D8%A7%D9%84%D8%A7%D9%82%D8%AA%D8%B5%D8%A7%D8%AF%D9%8A%D8%A9.jpg",
  altKey: "about.story.imageAltCasablanca",
};

export default function About() {
  const { t } = useI18n();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const values = [
    { key: "cities", num: "01" },
    { key: "culture", num: "02" },
    { key: "heritage", num: "03" },
    { key: "experiences", num: "04" },
  ];

  return (
    <div className="page-anim relative flex min-h-dvh flex-col overflow-clip bg-ivory font-sans text-ink antialiased">
      <ZelligeEdges />

      <SiteNav transparent hideSearch />

      <main className="relative z-10 flex-1">
        <section
          className="relative isolate flex min-h-[70vh] w-full items-end overflow-hidden bg-[#1b1208] sm:min-h-[78vh]"
          style={{
            backgroundImage: `url("${ABOUT_HERO_IMAGE}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-linear-to-t from-[#120b04]/92 via-[#120b04]/45 to-[#120b04]/20" />
          <div className="absolute inset-0 bg-linear-to-r from-[#120b04]/40 via-transparent to-transparent rtl:bg-linear-to-l" />
          <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-32 sm:px-6 sm:pb-20 sm:pt-36 lg:px-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#f4dfb0]/90">
              {t("about.kicker")}
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-5xl font-medium leading-[0.98] text-white sm:text-6xl lg:text-7xl">
              {t("about.heroTitle")}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
              {t("about.heroIntro")}
            </p>
            <ZelligeOrnament className="mt-8 h-5 w-40 opacity-90" color="#f4dfb0" />
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
          <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="relative order-2 lg:order-1">
              <div className="absolute -inset-3 -z-10 rounded-[2rem] border border-gold/25 bg-[#f6ecd8]/50" aria-hidden="true" />
              <div className="grid gap-3 sm:grid-cols-5">
                <img
                  src={ABOUT_WHY_IMAGES[0].src}
                  alt={t(ABOUT_WHY_IMAGES[0].altKey)}
                  loading="lazy"
                  decoding="async"
                  className="h-64 w-full rounded-[1.75rem] border border-gold/30 object-cover shadow-[0_30px_70px_-40px_rgba(63,42,18,0.55)] sm:col-span-3 sm:h-[26rem]"
                />
                <img
                  src={ABOUT_WHY_IMAGES[1].src}
                  alt={t(ABOUT_WHY_IMAGES[1].altKey)}
                  loading="lazy"
                  decoding="async"
                  className="h-48 w-full rounded-[1.4rem] border border-gold/30 object-cover shadow-[0_30px_70px_-40px_rgba(63,42,18,0.55)] sm:col-span-2 sm:mt-16 sm:h-[20rem]"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-deep">
                {t("about.why.kicker")}
              </p>
              <ZelligeOrnament className="mt-3 h-4 w-32 opacity-85" />
              <h2 className="mt-3 font-display text-3xl font-medium leading-tight text-ink sm:text-[2.1rem]">
                {t("about.why.title")}
              </h2>
              <p className="mt-4 text-[15px] leading-8 text-ink/75">{t("about.why.body1")}</p>
              <p className="mt-4 text-[15px] leading-8 text-ink/75">{t("about.why.body2")}</p>
            </div>
          </div>
        </section>

        <section className="bg-[#f6ecd8]/35 px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
          <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-deep">
                {t("about.story.kicker")}
              </p>
              <ZelligeOrnament className="mt-3 h-4 w-32 opacity-85" />
              <h2 className="mt-3 font-display text-3xl font-medium leading-tight text-ink sm:text-[2.1rem]">
                {t("about.story.title")}
              </h2>
              <p className="mt-4 text-[15px] leading-8 text-ink/75">{t("about.story.body1")}</p>
              <p className="mt-4 text-[15px] leading-8 text-ink/75">{t("about.story.body2")}</p>
              <blockquote className="mt-6 rounded-[1.25rem] border border-gold/30 bg-white/70 p-5 text-sm leading-relaxed text-ink/75 shadow-[0_16px_40px_-30px_rgba(63,42,18,0.45)]">
                <span className="block font-display text-lg text-gold-deep">{t("about.story.quote")}</span>
              </blockquote>
            </div>
            <div className="relative">
              <div className="absolute -inset-3 -z-10 rounded-[2rem] border border-gold/25 bg-white/40" aria-hidden="true" />
              <img
                src={ABOUT_STORY_IMAGE.src}
                alt={t(ABOUT_STORY_IMAGE.altKey)}
                loading="lazy"
                decoding="async"
                className="h-[20rem] w-full rounded-[1.75rem] border border-gold/30 object-cover shadow-[0_30px_70px_-40px_rgba(63,42,18,0.55)] sm:h-[26rem]"
              />
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-deep">
                {t("about.different.kicker")}
              </p>
              <ZelligeOrnament className="mx-auto mt-3 h-4 w-32 opacity-85" />
              <h2 className="mt-3 font-display text-3xl font-medium leading-tight text-ink sm:text-[2.1rem]">
                {t("about.different.title")}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ink/65 sm:text-[15px]">
                {t("about.different.intro")}
              </p>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {["curated", "authentic", "local"].map((item) => (
                <article
                  key={item}
                  className="rounded-[1.5rem] border border-gold/30 bg-white/70 p-6 shadow-[0_16px_40px_-30px_rgba(63,42,18,0.45)]"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold/35 bg-[#f6ecd8] font-display text-sm font-semibold text-gold-deep">
                    ✦
                  </span>
                  <h3 className="mt-4 font-display text-xl font-medium text-ink">
                    {t(`about.different.${item}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">
                    {t(`about.different.${item}.body`)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#1b1208] px-4 py-16 text-ivory sm:px-6 sm:py-20 lg:px-10">
          <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-2">
            <div className="rounded-[1.75rem] border border-gold/25 bg-white/5 p-7 sm:p-9">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f4dfb0]">
                {t("about.mission.kicker")}
              </p>
              <ZelligeOrnament className="mt-3 h-4 w-32 opacity-90" color="#f4dfb0" />
              <h2 className="mt-3 font-display text-3xl font-medium text-white">
                {t("about.mission.title")}
              </h2>
              <p className="mt-4 text-sm leading-8 text-ivory/80 sm:text-[15px]">
                {t("about.mission.body")}
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-gold/25 bg-white/5 p-7 sm:p-9">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f4dfb0]">
                {t("about.vision.kicker")}
              </p>
              <ZelligeOrnament className="mt-3 h-4 w-32 opacity-90" color="#f4dfb0" />
              <h2 className="mt-3 font-display text-3xl font-medium text-white">
                {t("about.vision.title")}
              </h2>
              <p className="mt-4 text-sm leading-8 text-ivory/80 sm:text-[15px]">
                {t("about.vision.body")}
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
          <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-deep">
                {t("about.goal.kicker")}
              </p>
              <ZelligeOrnament className="mt-3 h-4 w-32 opacity-85" />
              <h2 className="mt-3 font-display text-3xl font-medium leading-tight text-ink sm:text-[2.1rem]">
                {t("about.goal.title")}
              </h2>
              <p className="mt-4 text-[15px] leading-8 text-ink/75">{t("about.goal.body")}</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {values.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-start gap-3 rounded-[1.2rem] border border-gold/30 bg-white/70 p-4"
                  >
                    <span className="font-display text-lg font-medium text-gold-deep">{item.num}</span>
                    <div>
                      <p className="text-sm font-semibold text-ink">{t(`about.goal.${item.key}.title`)}</p>
                      <p className="mt-1 text-xs leading-relaxed text-ink/65">{t(`about.goal.${item.key}.body`)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <img
                src="/img/cities/rabat.png"
                alt={t("about.goal.imageAlt1")}
                loading="lazy"
                decoding="async"
                className="h-56 w-full rounded-[1.4rem] border border-gold/30 object-cover shadow-[0_20px_45px_-30px_rgba(63,42,18,0.5)] sm:h-72"
              />
              <img
                src="/img/cities/ouarzazate.png"
                alt={t("about.goal.imageAlt2")}
                loading="lazy"
                decoding="async"
                className="h-56 w-full rounded-[1.4rem] border border-gold/30 object-cover shadow-[0_20px_45px_-30px_rgba(63,42,18,0.5)] sm:mt-10 sm:h-72"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
