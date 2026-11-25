import { Link } from "react-router-dom";
import { BedDouble, Compass, Landmark, Utensils } from "lucide-react";
import { useI18n } from "../i18n/LanguageContext";

const CATEGORIES = [
  { id: "hotels", labelKey: "nav.hotels", icon: BedDouble },
  { id: "restaurants", labelKey: "nav.restaurants", icon: Utensils },
  { id: "activities", labelKey: "nav.activities", icon: Compass },
  { id: "attractions", labelKey: "nav.attractions", icon: Landmark },
];

export default function CityCategoryNav({ citySlug, active }) {
  const { t } = useI18n();

  return (
    <nav
      aria-label={t("nav.categories")}
      className="sticky top-[4.25rem] z-40 mx-auto mt-[4.25rem] w-full max-w-7xl px-4 sm:px-6 lg:px-10"
    >
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-[1.25rem] border border-gold/35 bg-ivory/95 p-2 shadow-[0_14px_36px_-24px_rgba(63,42,18,0.45)] ring-1 ring-gold/10 backdrop-blur-md">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isActive = active === category.id;
          return (
            <Link
              key={category.id}
              to={`/cities/${citySlug}/${category.id}`}
              aria-current={isActive ? "page" : undefined}
              className={
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep sm:text-sm " +
                (isActive
                  ? "bg-[#c9a24b]/20 text-gold-deep shadow-[inset_0_0_0_1px_rgba(201,162,75,0.7)]"
                  : "text-ink/60 hover:bg-white hover:text-ink")
              }
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {t(category.labelKey)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
