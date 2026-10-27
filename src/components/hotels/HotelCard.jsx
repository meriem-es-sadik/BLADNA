export default function HotelCard({ hotel, cityName, onDetails }) {
  return (
    <article
      onClick={() => onDetails(hotel)}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-[1.25rem] border border-gold/30 bg-[#fbf6ea] shadow-[0_12px_30px_-18px_rgba(63,42,18,0.4)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-gold/60 hover:shadow-[0_20px_40px_-18px_rgba(63,42,18,0.45)]"
    >
      <div className="relative overflow-hidden">
        <img
          src="/img/hotel-placeholder.svg"
          alt={hotel.name}
          loading="lazy"
          decoding="async"
          className="aspect-[16/10] w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
        />
      </div>

      <div className="flex flex-1 flex-col p-4 text-left sm:p-5">
        <h3 className="font-display text-lg font-semibold leading-snug text-ink">
          {hotel.name}
        </h3>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-deep">
          {hotel.typeLabel}
          {hotel.stars ? ` · ${hotel.stars}-star` : ""}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">{hotel.description}</p>
        <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-ink/55">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-3.5 w-3.5 shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>{hotel.address || cityName}</span>
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDetails(hotel);
          }}
          className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-gold/50 px-4 py-1.5 text-xs font-semibold text-gold-deep transition-all duration-300 hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
        >
          View Details
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </div>
    </article>
  );
}
