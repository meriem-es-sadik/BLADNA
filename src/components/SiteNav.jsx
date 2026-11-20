import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ArrowLeft, BedDouble, Compass, Menu, Search, Utensils, X } from "lucide-react";
import BrandLogo from "./BrandLogo";
import LanguageSwitcher from "./LanguageSwitcher";
import SearchOverlay from "./SearchOverlay";
import { useI18n } from "../i18n/LanguageContext";
import { useContact } from "../context/ContactContext";

function linkClass(isActive, transparent) {
  return (
    "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep sm:text-[13px] sm:tracking-[0.14em] " +
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

export default function SiteNav({
  backTo,
  backLabel,
  category,
  onCategoryChange,
  hideSearch,
  transparent,
}) {
  const { t } = useI18n();
  const { openContact } = useContact();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const hasCategories = typeof onCategoryChange === "function";

  const links = [
    { to: "/", label: t("nav.home"), end: true },
    { to: "/destinations", label: t("nav.destinations") },
    { to: "/cities", label: t("nav.cities") },
    { to: "/about", label: t("nav.about") },
  ];

  const handleContactClick = () => {
    openContact();
    setOpen(false);
  };

  const categories = [
    { id: "hotels", label: t("nav.hotels"), icon: BedDouble },
    { id: "restaurants", label: t("nav.restaurants"), icon: Utensils },
    { id: "activities", label: t("nav.activities"), icon: Compass },
  ];

  const headerBg = transparent
    ? "bg-linear-to-b from-[#120b04]/70 via-[#120b04]/25 to-transparent backdrop-blur-[2px]"
    : "sticky top-0 z-40 shrink-0 border-b border-gold/30 bg-ivory/95 backdrop-blur-md";

  return (
    <>
      <header className={headerBg + (transparent ? " relative z-40" : "")}>
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
            <nav aria-label={t("nav.primary")} className="hidden items-center gap-1 md:flex">
              {links.map((link) => (
                <NavLink
                  key={link.to + link.label}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => linkClass(isActive, transparent)}
                >
                  {link.label}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={handleContactClick}
                className={linkClass(false, transparent)}
              >
                {t("nav.contact")}
              </button>
            </nav>

            {hasCategories ? (
              <nav
                aria-label={t("nav.categories")}
                className={
                  "hidden items-center gap-1 border-s ps-3 lg:flex " +
                  (transparent ? "border-white/25" : "border-gold/30")
                }
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
                          ? "bg-[#c9a24b]/20 text-gold-deep shadow-[inset_0_0_0_1px_rgba(201,162,75,0.7)]"
                          : transparent
                            ? "text-white/85 hover:bg-white/15 hover:text-white"
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

            <LanguageSwitcher />

            <button
              type="button"
              className={iconButtonClass(transparent) + " md:hidden"}
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
              "border-t px-4 py-3 md:hidden " +
              (transparent ? "border-white/15 bg-[#120b04]/90 backdrop-blur-md" : "border-gold/25 bg-ivory/98")
            }
          >
            <nav aria-label={t("nav.mobile")} className="flex flex-col gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.to + link.label}
                  to={link.to}
                  end={link.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => linkClass(isActive, transparent) + " w-full"}
                >
                  {link.label}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={handleContactClick}
                className={linkClass(false, transparent) + " w-full text-start"}
              >
                {t("nav.contact")}
              </button>
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
                          (isActive
                            ? "bg-[#c9a24b]/20 text-gold-deep"
                            : transparent
                              ? "text-white/85"
                              : "text-ink/65")
                        }
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        {cat.label}
                      </button>
                    );
                  })
                : null}
            </nav>
          </div>
        ) : null}
      </header>

      {!hideSearch && !transparent && (
        <div className="border-t border-gold/20 bg-ivory/80">
          <div className="mx-auto w-full max-w-7xl px-4 py-2 sm:px-6 lg:px-10">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={t("search.title")}
              title={t("nav.search")}
              className="group mx-auto flex w-full max-w-xl items-center gap-2.5 rounded-full border border-gold/40 bg-white/70 px-4 py-2 text-start text-sm text-ink/55 transition-all duration-300 hover:border-gold/70 hover:bg-white hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep"
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

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}