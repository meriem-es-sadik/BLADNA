import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { cities } from "../data/cities";

const CITY_STORAGE_KEY = "bladna-selected-city";

export default function Cities() {
  const navigate = useNavigate();

  const selectCity = (city) => {
    sessionStorage.setItem(
      CITY_STORAGE_KEY,
      JSON.stringify({ name: city.name, slug: city.slug })
    );
    navigate(`/cities/${city.slug}`);
  };

  return (
    <div className="page-anim relative flex min-h-dvh flex-col overflow-clip bg-ivory font-sans text-ink antialiased">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 select-none">
        <img
          src="/img/zliij.png"
          alt=""
          loading="eager"
          className="absolute -left-44 -top-44 w-[380px] opacity-90 mix-blend-multiply sm:-left-52 sm:-top-52 sm:w-[470px]"
          style={{
            maskImage: "radial-gradient(circle at 25% 25%, black 28%, transparent 55%)",
            WebkitMaskImage: "radial-gradient(circle at 25% 25%, black 28%, transparent 55%)",
          }}
        />
        <img
          src="/img/zliij.png"
          alt=""
          loading="lazy"
          className="absolute -right-44 top-[12%] hidden w-[330px] opacity-85 mix-blend-multiply sm:block"
          style={{
            maskImage: "radial-gradient(circle at 80% 50%, black 26%, transparent 52%)",
            WebkitMaskImage: "radial-gradient(circle at 80% 50%, black 26%, transparent 52%)",
          }}
        />
        <img
          src="/img/zliij.png"
          alt=""
          loading="lazy"
          className="absolute -bottom-44 -right-48 w-[380px] opacity-80 mix-blend-multiply sm:-bottom-52 sm:-right-52 sm:w-[460px]"
          style={{
            maskImage: "radial-gradient(circle at 70% 70%, black 28%, transparent 55%)",
            WebkitMaskImage: "radial-gradient(circle at 70% 70%, black 28%, transparent 55%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-6 pt-4 sm:px-6 lg:px-10">
        <header className="flex shrink-0 justify-center">
          <Link
            to="/"
            aria-label="Bladna — back to home"
            className="rounded-full font-display text-sm font-semibold uppercase tracking-[0.34em] text-gold-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep sm:text-base"
          >
            Bladna
          </Link>
        </header>

        <section className="flex shrink-0 flex-col items-center text-center">
          <h1 className="mt-3 max-w-2xl font-display text-3xl font-medium leading-tight text-ink sm:text-4xl lg:text-[2.5rem] lg:leading-[1.15]">
            Where Would You <span className="italic text-terra">Like to Go?</span>
          </h1>
          <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-ink/70 sm:text-[15px]">
            Choose a Moroccan city to begin your journey.
          </p>
        </section>

        <section aria-label="Moroccan cities" className="flex flex-1 items-center justify-center">
          <ul className="grid w-full grid-cols-1 gap-4 py-6 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((city) => (
              <li key={city.slug}>
                <button
                  type="button"
                  onClick={() => selectCity(city)}
                  aria-label={"Select " + city.name + " as your destination"}
                  className="group flex h-[72px] w-full items-center justify-between rounded-[1.25rem] border border-gold/40 bg-[#fbf6ea] px-6 text-left shadow-[0_10px_28px_-16px_rgba(63,42,18,0.4)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold/80 hover:bg-[#f6ecd8] hover:shadow-[0_16px_34px_-16px_rgba(63,42,18,0.45)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep active:translate-y-0"
                >
                  <span className="font-display text-lg font-semibold text-ink">
                    {city.name}
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-gold-deep transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
