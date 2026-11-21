import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  BedDouble,
  Building2,
  Camera,
  Compass,
  Landmark,
  MapPin,
  Sparkles,
  Utensils,
} from "lucide-react";
import SiteNav from "../components/SiteNav";
import ZelligeEdges, { ZelligeDivider } from "../components/ZelligeEdges";
import HotelsSection from "../components/hotels/HotelsSection";
import PlacesSection from "../components/places/PlacesSection";
import SectionIntro from "../components/SectionIntro";
import { cities, getCityRegion } from "../data/cities";
import { getCityGuide } from "../data/cityGuides";
import { getCityStory } from "../data/cityStories";
import { getCityName } from "../data/cityNames";
import { regionName } from "../data/regions";
import { useI18n } from "../i18n/LanguageContext";

function CityHero({ city, guide, cityName, story, t }) {
  const images = guide?.images?.filter((img) => img?.src) || [];
  const [index, setIndex] = useState(0);
  const hero = images[index] || images[0] || null;

  useEffect(() => {
    setIndex(0);
  }, [city.slug]);

  useEffect(() => {
    if (images.length < 2) return undefined;
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (media?.matches) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [images.length, city.slug]);

  const scrollToDiscover = () => {
    document.getElementById("discover")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const tagline = guide?.tagline || story?.tagline || t("city.defaultTagline");
  const intro = story?.description || guide?.description || t("city.defaultDescription");

  return (
    <section id="hero" className="relative isolate min-h-[78vh] w-full overflow-hidden bg-[#1b1208] sm:min-h-[86vh]">
      {images.map((img, i) => (
        <img
          key={`${city.slug}-${img.src}`}
          src={img.src}
          alt={i === index ? img.alt || cityName : ""}
          aria-hidden={i !== index}
          loading={i === 0 ? "eager" : "lazy"}
          fetchPriority={i === 0 ? "high" : "auto"}
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ease-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-linear-to-t from-[#120b04]/90 via-[#120b04]/35 to-[#120b04]/15" />
      <div className="absolute inset-0 bg-linear-to-r from-[#120b04]/55 via-transparent to-[#120b04]/20 rtl:bg-linear-to-l" />

      <div className="relative z-10 mx-auto flex min-h-[78vh] w-full max-w-7xl flex-col px-4 pb-14 pt-28 sm:min-h-[86vh] sm:px-6 sm:pb-20 sm:pt-32 lg:px-10">
        <div className="mt-auto max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#f4dfb0]/90">
            {guide?.kicker || t("city.guide")}
          </p>
          <h1 className="mt-4 font-display text-5xl font-medium leading-[0.95] text-white sm:text-6xl lg:text-7xl">
            {cityName}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            {t("city.welcomeHeadline", { city: cityName })}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-[15px]">
            {tagline}. {intro}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={scrollToDiscover}
              className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-[#ddb35e] via-[#c9a24b] to-[#b3863d] px-7 py-3 text-sm font-semibold text-[#3d270e] shadow-[0_12px_30px_-12px_rgba(201,162,75,0.7)] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              {t("city.exploreCta")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </button>
            <a
              href="#hotels"
              className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {t("nav.hotels")}
            </a>
          </div>

          {images.length > 1 ? (
            <div className="mt-8 flex items-center gap-2" aria-label={t("city.photoStatus", { index: index + 1, total: images.length, alt: hero?.alt || cityName })}>
              {images.map((img, i) => (
                <button
                  key={img.src}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={t("city.showPhoto", { index: i + 1, total: images.length })}
                  aria-current={i === index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? "w-7 bg-[#f4dfb0]" : "w-1.5 bg-white/45 hover:bg-white/75"
                  }`}
                />
              ))}
            </div>
          ) : null}
        </div>

        {hero?.credit ? (
          <a
            href={hero.sourceUrl || hero.licenseUrl || "#"}
            target={hero.sourceUrl || hero.licenseUrl ? "_blank" : undefined}
            rel={hero.sourceUrl || hero.licenseUrl ? "noopener noreferrer" : undefined}
            className="absolute bottom-4 end-4 max-w-[14rem] truncate rounded-full border border-white/20 bg-[#120b04]/45 px-3 py-1 text-[10px] text-white/75 backdrop-blur-md hover:text-white sm:bottom-6 sm:end-6"
          >
            {t("city.photoCredit", { credit: hero.credit })}
          </a>
        ) : null}
      </div>
    </section>
  );
}

export default function CityPage() {
  const { slug } = useParams();
  const { t, lang } = useI18n();
  const city = cities.find((candidate) => candidate.slug === slug);
  const [activeCategory, setActiveCategory] = useState("hotels");

  if (!city) {
    return <Navigate to="/cities" replace />;
  }

  const guide = getCityGuide(city.slug);
  const story = getCityStory(city.slug, lang) || {};
  const culture = story.culture || {};
  const history = story.history || [];
  const monuments = story.monuments || [];
  const knownFor = story.knownFor || [];
  const region = getCityRegion(city);
  const regionLabel = regionName(region, lang) || city.region;
  const cityName = getCityName(city, lang) || city.name;
  const introText = story.overview || story.description || guide?.description || t("city.defaultDescription");
  const introImage =
    guide?.images?.[1]?.src || guide?.images?.[0]?.src || "/img/cities/home4.png";

  const highlights = useMemo(() => {
    const items = [
      { icon: MapPin, label: t("city.region"), value: regionLabel },
      knownFor[0]
        ? { icon: Sparkles, label: t("city.knownFor"), value: knownFor[0] }
        : culture.identity
          ? { icon: Sparkles, label: t("city.identity"), value: culture.identity }
          : null,
      monuments[0]
        ? { icon: Landmark, label: t("city.heritage"), value: monuments[0] }
        : history[0]
          ? { icon: Landmark, label: t("city.history"), value: history[0] }
          : null,
      culture.cuisine
        ? { icon: Utensils, label: t("city.cuisine"), value: culture.cuisine }
        : culture.crafts
          ? { icon: Building2, label: t("city.crafts"), value: culture.crafts }
          : { icon: Camera, label: t("city.localCharacter"), value: story.tagline || guide?.tagline || t("city.defaultTagline") },
    ].filter(Boolean);
    return items.slice(0, 4);
  }, [culture, guide?.tagline, history, knownFor, monuments, regionLabel, story.tagline, t]);

  const secondaryNav = [
    { id: "hotels", label: t("nav.hotels"), icon: BedDouble, href: "#hotels", to: `/cities/${city.slug}/hotels` },
    { id: "restaurants", label: t("nav.restaurants"), icon: Utensils, href: "#restaurants", to: `/cities/${city.slug}/restaurants` },
    { id: "activities", label: t("nav.activities"), icon: Compass, href: "#activities", to: `/cities/${city.slug}/activities` },
  ];

  const scrollTo = (id) => {
    setActiveCategory(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const mapHref =
    typeof city.lat === "number" && typeof city.lon === "number"
      ? `https://www.openstreetmap.org/?mlat=${city.lat}&mlon=${city.lon}#map=12/${city.lat}/${city.lon}`
      : null;

  return (
    <div className="page-anim relative flex min-h-dvh flex-col overflow-clip bg-ivory font-sans text-ink antialiased">
      <ZelligeEdges />

      <SiteNav transparent hideSearch backTo="/cities" backLabel={t("city.backToCities")} />

      <main className="relative z-10 flex-1">
        <CityHero city={city} guide={guide} cityName={cityName} story={story} t={t} />

        <section id="discover" className="scroll-mt-36 px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div>
              <SectionIntro
                kicker={t("city.overviewKicker")}
                title={t("city.discoverTitle", { city: cityName })}
                intro={introText}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {highlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article
                      key={item.label}
                      className="rounded-[1.35rem] border border-gold/30 bg-white/70 p-5 shadow-[0_16px_40px_-30px_rgba(63,42,18,0.45)]"
                    >
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f6ecd8] text-gold-deep">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-deep">
                        {item.label}
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink/75">{item.value}</p>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-3 -z-10 rounded-[2rem] border border-gold/25 bg-[#f6ecd8]/50" aria-hidden="true" />
              <div className="overflow-hidden rounded-[1.75rem] border border-gold/30 shadow-[0_30px_70px_-40px_rgba(63,42,18,0.55)]">
                <img
                  src={introImage}
                  alt={guide?.images?.[1]?.alt || guide?.images?.[0]?.alt || cityName}
                  loading="lazy"
                  decoding="async"
                  className="h-[22rem] w-full object-cover sm:h-[30rem] lg:h-[34rem]"
                />
              </div>
            </div>
          </div>
        </section>

        {(history.length > 0 || monuments.length > 0) ? (
          <section className="bg-[#f6ecd8]/30 px-4 py-14 sm:px-6 lg:px-10">
            <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <SectionIntro
                  kicker={t("city.historyKicker")}
                  title={t("city.historyTitle", { city: cityName })}
                  intro={t("city.historyIntro", { city: cityName })}
                />
                <div className="space-y-4">
                  {(history.length ? history : [introText]).slice(0, 3).map((paragraph, idx) => (
                    <p key={idx} className="text-[15px] leading-8 text-ink/75">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
              <div className="space-y-5">
                {monuments.length ? (
                  <aside className="rounded-[1.5rem] border border-gold/30 bg-[#1b1208] p-6 text-ivory shadow-[0_20px_50px_-32px_rgba(27,18,8,0.8)]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
                      {t("city.monuments")}
                    </p>
                    <ul className="mt-4 space-y-3">
                      {monuments.slice(0, 5).map((monument, index) => (
                        <li key={monument} className="flex items-start gap-3 text-sm leading-relaxed text-ivory/85">
                          <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/45 text-[11px] font-semibold text-gold">
                            {index + 1}
                          </span>
                          <span>{monument}</span>
                        </li>
                      ))}
                    </ul>
                  </aside>
                ) : null}
                {culture.identity ? (
                  <article className="rounded-[1.5rem] border border-gold/30 bg-white/70 p-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-deep">
                      {t("city.culture")}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-ink/75">{culture.identity}</p>
                    {culture.cuisine ? (
                      <p className="mt-3 text-sm leading-relaxed text-ink/70">
                        <span className="font-semibold text-ink/80">{t("city.cuisine")}:</span> {culture.cuisine}
                      </p>
                    ) : null}
                  </article>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        <nav
          aria-label={t("city.categoriesAria")}
          className="sticky top-[4.25rem] z-30 mx-auto mt-6 w-full max-w-7xl px-4 sm:px-6 lg:px-10"
        >
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-[1.4rem] border border-gold/35 bg-ivory/95 p-2 shadow-[0_18px_40px_-24px_rgba(63,42,18,0.45)] ring-1 ring-gold/10 backdrop-blur-md">
            {secondaryNav.map((item) => {
              const Icon = item.icon;
              const active = activeCategory === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollTo(item.id)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-[#c9a24b]/18 text-gold-deep shadow-[inset_0_0_0_1px_rgba(201,162,75,0.7)]"
                      : "text-ink/60 hover:bg-white hover:text-ink"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        <ZelligeDivider />


        <section id="attractions" className="scroll-mt-36 bg-[#f6ecd8]/35 px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">
            <SectionIntro
              kicker={t("city.attractionsKicker")}
              title={t("city.topAttractions", { city: cityName })}
              intro={t("city.attractionsIntro")}
              align="center"
            />
            <PlacesSection
              city={city}
              kind="activity"
              group="landmarks"
              showHeader={false}
            />
          </div>
        </section>

        <section id="hotels" className="scroll-mt-36 px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">
            <SectionIntro
              kicker={t("city.hotelsKicker")}
              title={t("city.hotelsTitle", { city: cityName })}
              intro={t("city.hotelsIntro")}
              align="center"
            />
            <HotelsSection city={city} showHeader={false} />
            <div className="mt-8 flex justify-center">
              <Link
                to={`/cities/${city.slug}/hotels`}
                className="inline-flex items-center gap-2 rounded-full border border-gold/45 bg-white/70 px-6 py-2.5 text-sm font-semibold text-gold-deep transition hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep"
              >
                {t("city.exploreHotels")}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <ZelligeDivider />

        <section id="restaurants" className="scroll-mt-36 bg-white/35 px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">
            <SectionIntro
              kicker={t("city.restaurantsKicker")}
              title={t("city.restaurantsTitle", { city: cityName })}
              intro={t("city.restaurantsIntro")}
              align="center"
            />
            <PlacesSection
              city={city}
              kind="restaurant"
              showHeader={false}
            />
            <div className="mt-8 flex justify-center">
              <Link
                to={`/cities/${city.slug}/restaurants`}
                className="inline-flex items-center gap-2 rounded-full border border-gold/45 bg-white/70 px-6 py-2.5 text-sm font-semibold text-gold-deep transition hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep"
              >
                {t("city.exploreRestaurants")}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <ZelligeDivider />

        <section id="activities" className="scroll-mt-36 px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">
            <SectionIntro
              kicker={t("city.activitiesKicker")}
              title={t("city.activitiesTitle", { city: cityName })}
              intro={t("city.activitiesIntro")}
              align="center"
            />
            <PlacesSection
              city={city}
              kind="activity"
              group="experiences"
              showHeader={false}
            />
            <div className="mt-8 flex justify-center">
              <Link
                to={`/cities/${city.slug}/activities`}
                className="inline-flex items-center gap-2 rounded-full border border-gold/45 bg-white/70 px-6 py-2.5 text-sm font-semibold text-gold-deep transition hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep"
              >
                {t("city.exploreActivities")}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {mapHref ? (
          <section id="map" className="scroll-mt-36 px-4 pb-16 pt-4 sm:px-6 lg:px-10">
            <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-[1.75rem] border border-gold/30 bg-[#1b1208] text-ivory shadow-[0_24px_60px_-36px_rgba(27,18,8,0.8)]">
              <div className="grid items-center gap-6 p-8 sm:p-10 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f4dfb0]">
                    {t("city.mapKicker")}
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-medium text-white">
                    {t("city.mapTitle", { city: cityName })}
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-ivory/75">
                    {t("city.mapIntro", { city: cityName })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 lg:justify-end">
                  <a
                    href={mapHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#f4dfb0] px-6 py-3 text-sm font-semibold text-[#3d270e] transition hover:bg-[#e7c97d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f4dfb0]"
                  >
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {t("common.viewOnOsm")}
                  </a>
                  <Link
                    to="/cities"
                    className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    {t("city.backToCities")}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
