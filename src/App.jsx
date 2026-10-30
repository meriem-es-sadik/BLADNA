import { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";

const Cities = lazy(() => import("./pages/Cities"));
const CityPage = lazy(() => import("./pages/CityPage"));
const Destinations = lazy(() => import("./pages/Destinations"));

function PageLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-ivory text-ink">
      <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-gold/30 border-t-gold-deep" />
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-deep">
          Loading
        </span>
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/cities" element={<Cities />} />
        <Route path="/cities/:slug" element={<CityPage />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Suspense>
  );
}
