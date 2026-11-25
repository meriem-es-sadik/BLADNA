import { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import SiteFooter from "./components/SiteFooter";
import { ContactProvider } from "./context/ContactContext";
import { useI18n } from "./i18n/LanguageContext";
import Home from "./pages/Home";
import ErrorBoundary from "./components/ErrorBoundary";

const Cities = lazy(() => import("./pages/Cities"));
const CityPage = lazy(() => import("./pages/CityPage"));
const Destinations = lazy(() => import("./pages/Destinations"));
const AboutPage = lazy(() => import("./pages/About"));
const HotelsPage = lazy(() => import("./pages/CityHotels"));
const RestaurantsPage = lazy(() => import("./pages/CityRestaurants"));
const ActivitiesPage = lazy(() => import("./pages/CityActivities"));
const AttractionsPage = lazy(() => import("./pages/CityAttractions"));
const ItemDetailPage = lazy(() => import("./pages/ItemDetailPage"));

function PageLoader() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-dvh items-center justify-center bg-ivory text-ink">
      <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-gold/30 border-t-gold-deep" />
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-deep">
          {t("common.loading")}
        </span>
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <div className="flex min-h-dvh flex-col">
      <ContactProvider>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/destinations" element={<Destinations />} />
              <Route path="/cities" element={<Cities />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/cities/:city/hotels/:itemId" element={<ItemDetailPage category="hotels" />} />
              <Route path="/cities/:city/restaurants/:itemId" element={<ItemDetailPage category="restaurants" />} />
              <Route path="/cities/:city/activities/:itemId" element={<ItemDetailPage category="activities" />} />
              <Route path="/cities/:city/attractions/:itemId" element={<ItemDetailPage category="attractions" />} />
              <Route path="/cities/:city/places/:itemId" element={<ItemDetailPage category="places" />} />
              <Route path="/cities/:city/hotels" element={<HotelsPage />} />
              <Route path="/cities/:city/restaurants" element={<RestaurantsPage />} />
              <Route path="/cities/:city/activities" element={<ActivitiesPage />} />
              <Route path="/cities/:city/attractions" element={<AttractionsPage />} />
              <Route path="/cities/:slug" element={<CityPage />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
        <SiteFooter />
      </ContactProvider>
    </div>
  );
}
