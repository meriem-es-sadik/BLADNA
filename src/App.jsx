import { Route, Routes, useLocation } from "react-router-dom";
import Cities from "./pages/Cities";
import CityPage from "./pages/CityPage";
import Destinations from "./pages/Destinations";
import Home from "./pages/Home";

export default function App() {
  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Home />} />
      <Route path="/destinations" element={<Destinations />} />
      <Route path="/cities" element={<Cities />} />
      <Route path="/cities/:slug" element={<CityPage />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
