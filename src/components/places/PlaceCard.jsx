import { Compass, MapPin, Utensils } from "lucide-react";

export default function PlaceCard({ place, onDetails }) {
  const Icon = place.kind === "restaurant" ? Utensils : Compass;
  const open = () => onDetails(place);

  return (
    <article
      onClick={open}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-[1.25rem] border border-gold/30 bg-[#fbf6ea] shadow-[0_12px_30px_-18px_rgba(63,42,18,0.4)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-gold/60 hover:shadow-[0_20px_40px_-18px_rgba(63,42,18,0.45)]"
    >
      <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-[#efe3c8]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/img/zliij.png')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-linear-to-br from-white/35 via-transparent to-[#b45f3c]/10" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-gold/45 bg-white/60 text-gold-deep shadow-sm backdrop-blur-sm">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
        <span className="absolute left-3 top-3 rounded-full border border-gold/35 bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-deep backdrop-blur-sm">
          Verified place
        </span>
        <span className="absolute bottom-2 right-2 rounded-full border border-gold/30 bg-white/75 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/45 backdrop-blur-sm">
          Photo unavailable
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 text-left sm:p-5">
        <h3 className="font-display text-lg font-semibold leading-snug text-ink">{place.name}</h3>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-deep">
          {place.typeLabel}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">{place.description}</p>
        <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-ink/55">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="line-clamp-2">{place.location}</span>
        </p>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            open();
          }}
          className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-gold/50 px-4 py-1.5 text-xs font-semibold text-gold-deep transition-all duration-300 hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
        >
          View Details
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </div>
    </article>
  );
}
