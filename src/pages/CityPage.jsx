import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BedDouble, Compass, Utensils } from "lucide-react";
import ZelligeEdges from "../components/ZelligeEdges";
import HotelsSection from "../components/hotels/HotelsSection";
import { cities } from "../data/cities";

const CATEGORIES = [
  {
    id: "hotels",
    label: "Hotels",
    icon: BedDouble,
    blurb: "A curated collection of stays will appear here soon.",
  },
  {
    id: "restaurants",
    label: "Restaurants",
    icon: Utensils,
    blurb: "Fine Moroccan dining will appear here soon.",
  },
  {
    id: "activities",
    label: "Activities",
    icon: Compass,
    blurb: "Unforgettable experiences will appear here soon.",
  },
];

export default function CityPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState("hotels");
  const city = cities.find((c) => c.slug === slug);

  if (!city) {
    return <Navigate to="/cities" replace />;
  }

  const active = CATEGORIES.find((c) => c.id === category);
  const ActiveIcon = active.icon;

  return (
    <div className="page-anim relative flex min-h-dvh flex-col overflow-clip bg-ivory font-sans text-ink antialiased">
      <ZelligeEdges />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-6 pt-4 sm:px-6 lg:px-10">
        <header className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center">
          <button
            type="button"
            onClick={() => navigate("/cities")}
            className="group inline-flex items-center gap-2 justify-self-start rounded-full border border-gold/35 bg-white/60 px-4 py-2 text-xs font-semibold text-ink/70 transition-all duration-300 hover:-translate-x-0.5 hover:border-gold/70 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep sm:px-5 sm:text-sm"
          >
            <ArrowLeft
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            Back to Cities
          </button>
          <Link
            to="/"
            aria-label="Bladna — back to home"
            className="justify-self-center rounded-full font-display text-sm font-semibold uppercase tracking-[0.34em] text-gold-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep sm:text-base"
          >
            Bladna
          </Link>
          <div />
        </header>

        <section className="flex shrink-0 flex-col items-center text-center">
          <h1 className="mt-4 font-display text-3xl font-medium leading-tight text-ink sm:text-4xl lg:text-[2.5rem] lg:leading-[1.15]">
            Discover <span className="italic text-terra">{city.name}</span>
          </h1>
          <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-ink/70 sm:text-[15px]">
            Explore the best places and experiences in your destination.
          </p>
        </section>

        <nav
          aria-label="Categories"
          className="mt-6 flex shrink-0 justify-center"
        >
          <div className="inline-flex items-center gap-1 rounded-full border border-gold/35 bg-white/60 p-1.5 shadow-[0_14px_34px_-18px_rgba(63,42,18,0.4)] backdrop-blur-md sm:gap-1.5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = cat.id === category;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  aria-pressed={isActive}
                  className={
                    "flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300 sm:px-7 " +
                    (isActive
                      ? "bg-[#c9a24b]/15 text-gold-deep shadow-[inset_0_0_0_1px_rgba(201,162,75,0.7)]"
                      : "text-ink/55 hover:bg-white/80 hover:text-ink")
                  }
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </nav>

        <section
          key={active.id}
          className="animate-fade-in flex flex-1 items-center justify-center"
        >
          {category === "hotels" ? (
            <HotelsSection city={city} />
          ) : (
            <div className="w-full rounded-[1.5rem] border border-gold/30 bg-white/60 px-6 py-10 text-center shadow-[0_18px_40px_-24px_rgba(63,42,18,0.4)] backdrop-blur-sm sm:py-12">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#c9a24b]/15 text-gold-deep">
                <ActiveIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="font-display text-2xl font-medium text-ink sm:text-[1.75rem]">
                {active.label} in <span className="italic text-terra">{city.name}</span>
              </h2>
              <p className="mt-2 text-sm text-ink/60">{active.blurb}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
