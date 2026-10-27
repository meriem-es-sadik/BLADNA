export default function HotelDetails({ hotel, cityName, onClose }) {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${hotel.lat},${hotel.lon}`;

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onClose}
        className="group inline-flex items-center gap-2 rounded-full border border-gold/35 bg-white/60 px-4 py-2 text-xs font-semibold text-ink/70 transition-all duration-300 hover:-translate-x-0.5 hover:border-gold/70 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep sm:text-sm"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        Back to Hotels in {cityName}
      </button>

      <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-gold/30 bg-[#fbf6ea] shadow-[0_22px_50px_-24px_rgba(63,42,18,0.45)]">
        <img
          src="/img/hotel-placeholder.svg"
          alt={hotel.name}
          loading="lazy"
          decoding="async"
          className="aspect-[16/9] w-full object-cover sm:aspect-[21/9]"
        />

        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                {hotel.name}
              </h2>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-gold-deep">
                {hotel.typeLabel}
                {hotel.stars ? ` · ${hotel.stars}-star` : ""} · {hotel.city}
              </p>
            </div>
            {hotel.rating !== null && (
              <span className="rounded-full border border-[#c9a24b]/60 bg-[#c9a24b]/15 px-3.5 py-1.5 text-sm font-bold text-gold-deep">
                {hotel.rating.toFixed(1)} / 5
              </span>
            )}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-ink/70">{hotel.description}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-gold/25 bg-white/60 p-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-deep">Location</h3>
              <p className="mt-2 flex items-start gap-2 text-sm text-ink/70">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-4 w-4 shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>{hotel.address || `${hotel.city}, Morocco`}</span>
              </p>
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-gold-deep underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
              >
                Open in Google Maps
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
              </a>
            </div>

            <div className="rounded-2xl border border-gold/25 bg-white/60 p-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-deep">Amenities</h3>
              {hotel.amenities.length ? (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {hotel.amenities.map((a) => (
                    <li key={a} className="rounded-full border border-gold/25 bg-[#f6ecd8] px-2.5 py-1 text-[11px] font-semibold text-ink/65">
                      {a}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-ink/55">No verified amenities listed.</p>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2.5">
            {hotel.website && (
              <a
                href={hotel.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-5 py-2.5 text-xs font-semibold text-gold-deep transition-all duration-300 hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep sm:text-sm"
              >
                Official website
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
              </a>
            )}
            {hotel.phone && (
              <a
                href={`tel:${hotel.phone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-5 py-2.5 text-xs font-semibold text-gold-deep transition-all duration-300 hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep sm:text-sm"
              >
                {hotel.phone}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
