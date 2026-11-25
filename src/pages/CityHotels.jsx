import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { cities } from "../data/cities";
import { getCityName } from "../data/cityNames";
import HotelsSection from "../components/hotels/HotelsSection";
import SiteNav from "../components/SiteNav";
import ZelligeEdges from "../components/ZelligeEdges";
import { useI18n } from "../i18n/LanguageContext";

export default function CityHotels() {
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
      <ZelligeEdges />

      <SiteNav
        backTo={`/cities/${slug}`}
        backLabel={t("city.backToCity", { city: cityName })}
        hideSearch={true}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-14 pt-6 sm:px-6 sm:pt-8 lg:px-10">
        <section id="hotels" className="scroll-mt-44">
          <HotelsSection
            city={city}
            showHeader
            kicker={t("city.hotelsKicker")}
            heading={t("city.hotelsTitle", { city: cityName })}
            blurb={t("city.hotelsIntro")}
          />
        </section>
      </div>
    </div>
  );
}