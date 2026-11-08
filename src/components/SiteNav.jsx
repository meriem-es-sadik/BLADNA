import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ArrowLeft, BedDouble, Compass, Menu, Search, Utensils, X } from "lucide-react";
import BrandLogo from "./BrandLogo";
import LanguageSwitcher from "./LanguageSwitcher";
import SearchOverlay from "./SearchOverlay";
import { useI18n } from "../i18n/LanguageContext";

function linkClass(isActive) {
  return (
    "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep sm:text-[13px] sm:tracking-[0.14em] " +
    (isActive
      ? "bg-[#c9a24b]/15 text-gold-deep shadow-[inset_0_0_0_1px_rgba(201,162,75,0.7)]"
      : "text-ink/65 hover:bg-white/70 hover:text-ink")
  );
}

function iconButtonClass() {
  return "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-white/70 text-gold-deep transition hover:border-gold/70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep";
}

export default function SiteNav({ backTo, backLabel, category, onCategoryChange }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const hasCategories = typeof onCategoryChange === "function";

  const links = [
    { to: "/", label: t("nav.home"), end: true },
    { to: "/destinations", label: t("nav.destinations") },
    { to: "/cities", label: t("nav.cities") },
  ];

  const categories = [
    { id: "hotels", label: t("nav.hotels"), icon: BedDouble },
    { id: "restaurants", label: t("nav.restaurants"), icon: Utensils },
    { id: "activities", label: t("nav.activities"), icon: Compass },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 shrink-0 border-b border-gold/30 bg-ivory/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6 lg:px-10">
          {backTo ? (
            <Link
              to={backTo}
              aria-label={backLabel || t("nav.back")}
              className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gold/40 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-ink/70 transition-all duration-300 hover:border-gold/70 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep sm:gap-2 sm:px-4 sm:text-xs"
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
            <nav aria-label={t("nav.primary")} className="hidden items-center gap-1 md:flex">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => linkClass(isActive)}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {hasCategories ? (
              <nav
                aria-label={t("nav.categories")}
                className="hidden items-center gap-1 border-s border-gold/30 ps-3 lg:flex"
              >
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => onCategoryChange(cat.id)}
                      aria-pressed={isActive}
                      className={
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-300 " +
                        (isActive
                          ? "bg-[#c9a24b]/15 text-gold-deep shadow-[inset_0_0_0_1px_rgba(201,162,75,0.7)]"
                          : "text-ink/55 hover:bg-white/80 hover:text-ink")
                      }
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      {cat.label}
                    </button>
                  );
                })}
              </nav>
            ) : null}

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={t("nav.search")}
              title={t("nav.search")}
              className={iconButtonClass()}
            >
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>

            <LanguageSwitcher />

            <button
              type="button"
              className={iconButtonClass() + " md:hidden"}
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
            className="border-t border-gold/25 bg-ivory/98 px-4 py-3 md:hidden"
          >
            <nav aria-label={t("nav.mobile")} className="flex flex-col gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => linkClass(isActive) + " w-full"}
                >
                  {link.label}
                </NavLink>
              ))}
              {hasCategories
                ? categories.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          onCategoryChange(cat.id);
                          setOpen(false);
                        }}
                        aria-pressed={isActive}
                        className={
                          "inline-flex w-full items-center gap-2 rounded-full px-3 py-1.5 text-start text-xs font-semibold uppercase tracking-[0.16em] transition-colors " +
                          (isActive ? "bg-[#c9a24b]/15 text-gold-deep" : "text-ink/65")
                        }
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        {cat.label}
                      </button>
                    );
                  })
                : null}
            </nav>
            <div className="mt-3 flex items-center justify-between border-t border-gold/25 pt-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/50">
                {t("nav.language")}
              </span>
            <LanguageSwitcher className="hidden sm:inline-flex" />
            </div>
          </div>
        ) : null}
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
