import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ArrowLeft, BedDouble, Compass, Menu, Utensils, X } from "lucide-react";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/destinations", label: "Destinations" },
  { to: "/cities", label: "Cities" },
];

const CATEGORIES = [
  { id: "hotels", label: "Hotels", icon: BedDouble },
  { id: "restaurants", label: "Restaurants", icon: Utensils },
  { id: "activities", label: "Activities", icon: Compass },
];

function linkClass(isActive) {
  return (
    "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep sm:text-[13px] sm:tracking-[0.14em] " +
    (isActive
      ? "bg-[#c9a24b]/15 text-gold-deep shadow-[inset_0_0_0_1px_rgba(201,162,75,0.7)]"
      : "text-ink/65 hover:bg-white/70 hover:text-ink")
  );
}

export default function SiteNav({
  backTo,
  backLabel,
  category,
  onCategoryChange,
}) {
  const [open, setOpen] = useState(false);
  const hasCategories = typeof onCategoryChange === "function";

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-gold/30 bg-ivory/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-10">
        {backTo ? (
          <Link
            to={backTo}
            aria-label={backLabel || "Go back"}
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gold/40 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-ink/70 transition-all duration-300 hover:-translate-x-0.5 hover:border-gold/70 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep sm:gap-2 sm:px-4 sm:text-xs"
          >
            <ArrowLeft
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            <span className="hidden sm:inline">{backLabel || "Back"}</span>
          </Link>
        ) : null}

        <Link
          to="/"
          aria-label="Bladna — home"
          className="font-display text-sm font-semibold uppercase tracking-[0.34em] text-gold-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep sm:text-base"
        >
          Bladna
        </Link>

        <nav
          aria-label="Primary"
          className="ml-auto hidden items-center gap-1 md:flex"
        >
          {LINKS.map((link) => (
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
            aria-label="Categories"
            className="ml-2 hidden items-center gap-1 border-l border-gold/30 pl-3 lg:flex"
          >
            {CATEGORIES.map((cat) => {
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
          className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 bg-white/70 text-gold-deep transition hover:border-gold/70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep md:hidden"
          aria-expanded={open}
          aria-controls="site-nav-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>

      {open ? (
        <div
          id="site-nav-menu"
          className="border-t border-gold/25 bg-ivory/98 px-4 py-3 md:hidden"
        >
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {LINKS.map((link) => (
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
              ? CATEGORIES.map((cat) => {
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
                        "inline-flex w-full items-center gap-2 rounded-full px-3 py-1.5 text-left text-xs font-semibold uppercase tracking-[0.16em] transition-colors " +
                        (isActive
                          ? "bg-[#c9a24b]/15 text-gold-deep"
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
  );
}
