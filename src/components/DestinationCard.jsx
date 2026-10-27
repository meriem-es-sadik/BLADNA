export default function DestinationCard({ city }) {
  const { name, image, alt, objectPosition = "50% 50%" } = city;

  return (
    <div className="group flex w-full flex-col items-center gap-2.5 rounded-[1.9rem] p-2 text-center">
      <span className="rounded-full border border-gold/45 bg-white/85 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-deep shadow-sm">
        {name}
      </span>

      <span className="relative block w-full overflow-hidden rounded-[1.5rem] shadow-[0_14px_36px_-16px_rgba(63,42,18,0.45)] transition-[box-shadow,transform] duration-500 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_24px_44px_-18px_rgba(63,42,18,0.5)]">
        <img
          src={image}
          alt={alt}
          loading="lazy"
          decoding="async"
          style={{ objectPosition }}
          className="aspect-[2/3] w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.07] md:aspect-auto md:h-[clamp(280px,50vh,460px)]"
        />
        <span
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#231505]/55 via-transparent to-black/10"
          aria-hidden="true"
        />
      </span>
    </div>
  );
}
