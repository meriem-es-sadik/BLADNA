import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.replace("#", "");

    const scroll = () => {
      const el = document.getElementById(id);
      if (!el) return false;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return true;
    };

    if (scroll()) return undefined;

    const timers = [50, 150, 350, 700].map((ms) => setTimeout(scroll, ms));
    return () => timers.forEach(clearTimeout);
  }, [pathname, hash]);

  return null;
}
