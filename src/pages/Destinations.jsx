import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import DestinationCard from "../components/DestinationCard";
import SiteFooter from "../components/SiteFooter";
import SiteNav from "../components/SiteNav";
import { destinations } from "../data/destinations";

export default function Destinations() {
  const navigate = useNavigate();

  return (
    <div className="page-anim relative flex min-h-dvh flex-col overflow-x-hidden bg-ivory font-sans text-ink antialiased">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 select-none">
        <img
          src="/img/zliij.png"
          alt=""
          loading="eager"
          className="absolute -left-40 -top-40 w-[380px] opacity-90 mix-blend-multiply sm:-left-48 sm:-top-48 sm:w-[480px]"
          style={{
            maskImage: "radial-gradient(circle at 25% 25%, black 28%, transparent 55%)",
            WebkitMaskImage: "radial-gradient(circle at 25% 25%, black 28%, transparent 55%)",
          }}
        />
        <img
          src="/img/zliij.png"
          alt=""
          loading="lazy"
          className="absolute -right-40 top-[14%] hidden w-[330px] opacity-85 mix-blend-multiply sm:block"
          style={{
            maskImage: "radial-gradient(circle at 80% 50%, black 26%, transparent 52%)",
            WebkitMaskImage: "radial-gradient(circle at 80% 50%, black 26%, transparent 52%)",
          }}
        />
        <img
          src="/img/zliij.png"
          alt=""
          loading="lazy"
          className="absolute -bottom-32 -left-28 w-[280px] opacity-85 mix-blend-multiply sm:w-[330px]"
          style={{
            maskImage: "radial-gradient(circle at 30% 70%, black 28%, transparent 55%)",
            WebkitMaskImage: "radial-gradient(circle at 30% 70%, black 28%, transparent 55%)",
          }}
        />
        <img
          src="/img/zliij.png"
          alt=""
          loading="lazy"
          className="absolute -bottom-48 -right-44 w-[380px] opacity-80 mix-blend-multiply sm:-bottom-56 sm:-right-52 sm:w-[460px]"
          style={{
            maskImage: "radial-gradient(circle at 70% 70%, black 28%, transparent 55%)",
            WebkitMaskImage: "radial-gradient(circle at 70% 70%, black 28%, transparent 55%)",
          }}
        />
      </div>

      <SiteNav />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-10">
        <section className="flex shrink-0 flex-col items-center text-center">
          <h1 className="mt-2 max-w-2xl font-display text-3xl font-medium leading-tight text-ink sm:text-4xl lg:text-[2.5rem] lg:leading-[1.15]">
            Find Your <span className="italic text-terra">Perfect Destination</span>
          </h1>
          <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-ink/70 sm:text-[15px]">
            We&rsquo;re here to help you discover the perfect place for your
            next Moroccan adventure.
          </p>
        </section>

        <section
          aria-label="Choose a destination"
          className="mt-6 flex min-h-0 flex-1 items-center justify-center"
        >
          <ul className="relative -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-2 sm:gap-5 sm:px-2 md:px-2 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0 xl:gap-7">
            {destinations.map((city, index) => (
              <li
                key={city.id}
                style={{ animationDelay: `${80 * index}ms` }}
                className="animate-fade-up w-[74%] shrink-0 snap-center sm:w-[46%] md:w-[38%] lg:w-auto lg:shrink"
              >
                <DestinationCard city={city} />
              </li>
            ))}
          </ul>
        </section>

        <section className="shrink-0 pt-2 pb-2 text-center">
          <button
            type="button"
            onClick={() => navigate("/cities")}
            className="group inline-flex items-center gap-3 rounded-full bg-linear-to-r from-[#d9b466] via-[#c9a24b] to-[#b3863d] px-8 py-4 text-sm font-semibold tracking-wide text-[#3d270e] shadow-[0_18px_40px_-14px_rgba(154,115,39,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_22px_46px_-14px_rgba(154,115,39,0.65)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep active:translate-y-0 active:scale-100"
          >
            Choose Your Destination
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </button>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}
