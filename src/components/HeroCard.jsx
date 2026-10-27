import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function HeroCard() {
  return (
    <section
      style={{ animationDelay: "400ms" }}
      className="animate-fade-up flex w-full flex-col items-center rounded-[1.75rem] border border-[rgba(240,215,165,0.25)] bg-[rgba(230,205,155,0.15)] px-6 py-8 text-center shadow-[0_18px_50px_-18px_rgba(15,10,4,0.3),inset_0_1px_0_rgba(242,216,166,0.22),inset_0_-28px_48px_-24px_rgba(211,162,75,0.16)] backdrop-blur-[6px] sm:px-8 sm:py-8"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-ivory/90 [text-shadow:0_1px_6px_rgba(40,26,8,0.5)] sm:text-xs">
        Welcome to Morocco
      </p>

      <h1 className="mt-4 font-display text-[2rem] font-medium leading-[1.2] text-ivory drop-shadow-[0_2px_10px_rgba(40,26,8,0.55)] sm:text-4xl lg:text-[2.55rem]">
        Your Journey{" "}
        <br className="hidden md:block" aria-hidden="true" />
        Through Morocco{" "}
        <br className="hidden md:block" aria-hidden="true" />
        <span className="italic">Begins Here</span>
      </h1>

      <p className="mt-4 max-w-[26rem] text-sm leading-relaxed text-ivory/90 [text-shadow:0_1px_6px_rgba(40,26,8,0.45)] sm:mt-5 sm:text-[15px]">
        Discover Morocco&rsquo;s breathtaking landscapes, rich traditions, vibrant
        cities, and unforgettable adventures.
      </p>

      <Link
        to="/destinations"
        className="group mt-7 inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-sm font-semibold tracking-wide text-morocco-deep shadow-lg shadow-black/25 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow-xl sm:mt-8 active:translate-y-0 active:scale-100"
      >
        Get Started
        <ArrowRight
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </Link>
    </section>
  );
}
