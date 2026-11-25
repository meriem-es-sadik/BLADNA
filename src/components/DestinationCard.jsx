import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export default function DestinationCard({ city, to, onSelect, ariaLabel }) {
  const { name, image, alt, objectPosition = "50% 50%" } = city;
  const interactive = Boolean(to || onSelect);

  const content = (
    <>
      <span className="rounded-full border border-gold/45 bg-white/85 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-deep shadow-sm">
        {name}
      </span>

      <span
        className={
          "relative block w-full overflow-hidden rounded-[1.5rem] shadow-[0_14px_36px_-16px_rgba(63,42,18,0.45)]" +
          (interactive
            ? " transition-[box-shadow,transform] duration-500 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_24px_44px_-18px_rgba(63,42,18,0.5)]"
            : "")
        }
      >
        <img
          src={image}
          alt={alt}
          loading="lazy"
          decoding="async"
          style={{ objectPosition }}
          className={
            "aspect-[2/3] w-full object-cover md:aspect-auto md:h-[clamp(280px,50vh,460px)]" +
            (interactive
              ? " transition-transform duration-[1100ms] ease-out group-hover:scale-[1.07]"
              : "")
          }
        />
        <span
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#231505]/55 via-transparent to-black/10"
          aria-hidden="true"
        />
        {interactive ? (
          <span className="absolute bottom-3 end-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/45 bg-white/85 text-gold-deep shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5">
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
        ) : null}
      </span>
    </>
  );

  const className =
    (interactive ? "group " : "") +
    "flex w-full flex-col items-center gap-2.5 rounded-[1.9rem] p-2 text-center";

  if (to) {
    return (
      <Link
        to={to}
        onClick={onSelect}
        aria-label={ariaLabel}
        title={ariaLabel}
        className={
          className +
          " focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep"
        }
      >
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
