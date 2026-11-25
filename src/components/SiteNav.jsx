import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, BedDouble, Compass, Landmark, Menu, Search, Utensils, X } from "lucide-react";
import BrandLogo from "./BrandLogo";
import LanguageSwitcher from "./LanguageSwitcher";
import SearchOverlay from "./SearchOverlay";
import { useI18n } from "../i18n/LanguageContext";
import { useContact } from "../context/ContactContext";

function linkClass(isActive, transparent, plain) {
  const base =
    "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep sm:text-[11px] sm:tracking-[0.12em] ";
  if (plain) {
    return (
      base +
      (isActive
        ? "text-gold-deep"
        : transparent
          ? "text-white/90 hover:text-white"
          : "text-ink/65 hover:text-ink")
    );
  }
  return (
    base +
    "rounded-full px-2.5 py-1.5 " +
    (isActive
      ? "bg-[#c9a24b]/20 text-gold-deep shadow-[inset_0_0_0_1px_rgba(201,162,75,0.7)]"
      : transparent
        ? "text-white/90 hover:bg-white/15 hover:text-white"
        : "text-ink/65 hover:bg-white/70 hover:text-ink")
  );
}

function iconButtonClass(transparent) {
  return (
    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep " +
    (transparent
      ? "border-white/35 bg-white/10 text-white hover:bg-white/20"
      : "border-gold/40 bg-white/70 text-gold-deep hover:border-gold/70")
  );
}

export default function SiteNav({ backTo, backLabel, hideSearch, transparent, plain }) {
  const { t } = useI18n();
  const { openContact } = useContact();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = location.pathname.replace(/\/$/, "") || "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const cityMatch = pathname.match(/^\/cities\/([^/]+)(?:\/|$)/);
  let citySlug = null;
  if (cityMatch) {
    try {
      citySlug = decodeURIComponent(cityMatch[1]);
    } catch {
      citySlug = cityMatch[1];
    }
  }

  const categoryMatch = pathname.match(
    /^\/cities\/[^/]+\/(hotels|restaurants|activities|attractions|places)(?:\/|$)/
  );
  const activeCategory = categoryMatch
    ? categoryMatch[1] === "places"
      ? "attractions"
      : categoryMatch[1]
    : null;

  const categoryHref = (id) =>
    citySlug ? `/cities/${encodeURIComponent(citySlug)}/${id}` : `/cities?category=${id}`;

  const categories = [
    { id: "hotels", label: t("nav.hotels"), icon: BedDouble },
    { id: "restaurants", label: t("nav.restaurants"), icon: Utensils },
    { id: "activities", label: t("nav.activities"), icon: Compass },
    { id: "attractions", label: t("nav.attractions"), icon: Landmark },
  ];

  const links = [
    { to: "/", label: t("nav.home"), end: true },
    { to: "/cities", label: t("nav.cities"), end: true },
    ...(citySlug
      ? categories.map((category) => ({
          to: categoryHref(category.id),
          label: category.label,
          icon: category.icon,
          category: category.id,
        }))
      : []),
    { to: "/about", label: t("nav.about") },
  ];

  const isLinkActive = (link) =>
    link.category
      ? activeCategory === link.category
      : link.end
        ? pathname === link.to
        : pathname === link.to || pathname.startsWith(`${link.to}/`);

  const handleContactClick = () => {
    openContact();
    setOpen(false);
  };

  const headerBg = plain
    ? "border-b border-transparent bg-transparent"
    : transparent
      ? scrolled
        ? "border-b border-gold/25 bg-[#14110d]/95 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md"
        : "border-b border-transparent bg-linear-to-b from-[#120b04]/75 via-[#120b04]/30 to-transparent backdrop-blur-[2px]"
      : "border-b border-gold/30 bg-ivory/95 shadow-[0_10px_30px_-22px_rgba(63,42,18,0.55)] backdrop-blur-md";

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 w-full">
        <header className={headerBg}>
          <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6 lg:px-10">
            {backTo ? (
              <Link
                to={backTo}
                aria-label={backLabel || t("nav.back")}
                className={
                  "group inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep sm:gap-2 sm:px-4 sm:text-xs " +
                  (transparent
                    ? "border-white/35 bg-white/10 text-white hover:bg-white/20"
                    : "border-gold/40 bg-white/70 text-ink/70 hover:border-gold/70 hover:text-ink")
                }
              >
                <ArrowLeft
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5 rtl:rotate-180 rtl:group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
                <span className="hidden sm:inline">{backLabel || t("nav.back")}</span>
              </Link>
            ) : null}

            <Link
              to="/"
              aria-label={t("brand.home")}
              className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep"
            >
              <BrandLogo />
            </Link>

            <div className="ms-auto flex items-center gap-1.5 sm:gap-2">
              <nav
                aria-label={t("nav.primary")}
                className={
                  "hidden items-center lg:flex " +
                  (pathname === "/" ? "gap-4 xl:gap-5" : "gap-0.5")
                }
              >
                {links.map((link) => {
                  const Icon = link.icon;
                  const active = isLinkActive(link);
                  return (
                    <Link
                      key={link.to + link.label}
                      to={link.to}
                      aria-current={active ? "page" : undefined}
                      className={linkClass(active, transparent, plain) + (Icon ? " px-2" : "")}
                    >
                      {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                      {link.label}
                    </Link>
                  );
                })}
                <button
                  type="button"
                  onClick={handleContactClick}
                  className={linkClass(false, transparent, plain)}
                >
                  {t("nav.contact")}
                </button>
              </nav>

              <LanguageSwitcher />

              <button
                type="button"
                className={iconButtonClass(transparent) + " lg:hidden"}
                aria-expanded={open}
                aria-controls="site-nav-menu"
                aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
                onClick={() => setOpen((current) => !current)}
              >
                {open ? (
                  <X className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Menu className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {open ? (
            <div
              id="site-nav-menu"
              className={
                "border-t px-4 py-3 lg:hidden " +
                (transparent ? "border-white/15 bg-[#14110d]/98 backdrop-blur-md" : "border-gold/25 bg-ivory/98")
              }
            >
              <nav aria-label={t("nav.mobile")} className="flex flex-col gap-1">
                {links.map((link) => {
                  const Icon = link.icon;
                  const active = isLinkActive(link);
                  return (
                    <Link
                      key={link.to + link.label}
                      to={link.to}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={linkClass(active, transparent, plain) + " w-full justify-start"}
                    >
                      {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                      {link.label}
                    </Link>
                  );
                })}
                <button
                  type="button"
                  onClick={handleContactClick}
                  className={linkClass(false, transparent, plain) + " w-full justify-start"}
                >
                  {t("nav.contact")}
                </button>
              </nav>
            </div>
          ) : null}
        </header>

        {!hideSearch && !transparent && (
          <div className="border-t border-gold/20 bg-ivory/95 backdrop-blur-md">
            <div className="mx-auto w-full max-w-7xl px-4 py-2 sm:px-6 lg:px-10">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label={t("search.title")}
                title={t("nav.search")}
                className="group mx-auto flex w-full max-w-xl items-center gap-2.5 rounded-full border border-gold/40 bg-white/70 px-4 py-2 text-start text-sm text-ink/55 transition-all duration-300 hover:border-gold/70 hover:bg-white hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
              >
                <Search className="h-4 w-4 shrink-0 text-gold-deep" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{t("search.placeholder")}</span>
                <span className="hidden shrink-0 rounded-full border border-gold/35 bg-[#f6ecd8] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-deep sm:inline">
                  {t("nav.search")}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
