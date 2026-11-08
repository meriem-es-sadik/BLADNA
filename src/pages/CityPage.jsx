import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { BedDouble, Compass, Utensils } from "lucide-react";
import SiteNav from "../components/SiteNav";
import ZelligeEdges from "../components/ZelligeEdges";
import CityHero from "../components/city/CityHero";
import HotelsSection from "../components/hotels/HotelsSection";
import PlacesSection from "../components/places/PlacesSection";
import { cities } from "../data/cities";
import { getCityGuide } from "../data/cityGuides";
import { useI18n } from "../i18n/LanguageContext";

export default function CityPage() {
  const { slug } = useParams();
  const { t } = useI18n();
  const [category, setCategory] = useState("hotels");
  const city = cities.find((candidate) => candidate.slug === slug);

  if (!city) {
    return <Navigate to="/cities" replace />;
  }

  const guide = getCityGuide(city.slug);

  const categories = [
    {
      id: "hotels",
      label: t("nav.hotels"),
      icon: BedDouble,
      blurb: t("city.blurbHotels"),
    },
    {
      id: "restaurants",
      label: t("nav.restaurants"),
      icon: Utensils,
      blurb: t("city.blurbRestaurants"),
    },
    {
      id: "activities",
      label: t("nav.activities"),
      icon: Compass,
      blurb: t("city.blurbActivities"),
    },
  ];

  const active = categories.find((item) => item.id === category) || categories[0];

  return (
    <div className="page-anim relative flex min-h-dvh flex-col overflow-clip bg-ivory font-sans text-ink antialiased">
      <ZelligeEdges />

      <SiteNav
        backTo="/cities"
        backLabel={t("city.backToCities")}
        category={category}
        onCategoryChange={setCategory}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-10">
        <CityHero guide={guide} city={city} />

        <nav
          aria-label={t("city.categoriesAria")}
          className="mt-6 flex shrink-0 justify-center"
        >
          <div className="inline-flex items-center gap-1 rounded-full border border-gold/35 bg-white/60 p-1.5 shadow-[0_14px_34px_-18px_rgba(63,42,18,0.4)] backdrop-blur-md sm:gap-1.5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = cat.id === category;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  aria-pressed={isActive}
                  className={
                    "flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300 sm:px-7 " +
                    (isActive
                      ? "bg-[#c9a24b]/15 text-gold-deep shadow-[inset_0_0_0_1px_rgba(201,162,75,0.7)]"
                      : "text-ink/55 hover:bg-white/80 hover:text-ink")
                  }
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </nav>

        <section key={active.id} className="animate-fade-in mt-7 flex flex-1 flex-col">
          {category === "hotels" ? (
            <HotelsSection city={city} />
          ) : (
            <PlacesSection
              city={city}
              kind={category === "restaurants" ? "restaurant" : "activity"}
            />
          )}
        </section>
      </div>
    </div>
  );
}
