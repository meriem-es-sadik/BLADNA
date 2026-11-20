import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { cities } from "../data/cities";
import { getCityName } from "../data/cityNames";
import PlacesSection from "../components/places/PlacesSection";
import SiteNav from "../components/SiteNav";
import { useI18n } from "../i18n/LanguageContext";

export default function CityRestaurants() {
  const { city: slug } = useParams();
  const { t, lang } = useI18n();
  const navigate = useNavigate();

  const city = cities.find((c) => c.slug === slug);
  const cityName = city ? getCityName(city, lang) || city.name : "";

  useEffect(() => {
    if (!city) navigate("/cities");
  }, [city, navigate]);

  if (!city) return null;

  return (
    <div className="page-anim relative flex min-h-dvh flex-col overflow-clip bg-ivory font-sans text-ink antialiased">
      <SiteNav
        backTo={`/cities/${slug}`}
        backLabel={t("city.backToCity", { city: cityName })}
        hideSearch={true}
        category="restaurants"
        onCategoryChange={(id) => navigate(`/cities/${slug}/${id}`)}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-14 pt-8 sm:px-6 sm:pt-10 lg:px-10">
        <section id="restaurants" className="scroll-mt-44">
          <PlacesSection
            city={city}
            kind="restaurant"
            showHeader
            kicker={t("city.restaurantsKicker")}
            heading={t("city.restaurantsTitle", { city: cityName })}
            blurb={t("city.restaurantsIntro")}
          />
        </section>
      </div>
    </div>
  );
}