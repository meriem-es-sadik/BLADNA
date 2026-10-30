import { ArrowLeft, Clock, Compass, ExternalLink, MapPin, Phone, Utensils } from "lucide-react";

export default function PlaceDetails({ place, onClose }) {
  const Icon = place.kind === "restaurant" ? Utensils : Compass;
  const noun = place.kind === "restaurant" ? "Restaurants" : "Activities";

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onClose}
        className="group inline-flex items-center gap-2 rounded-full border border-gold/35 bg-white/60 px-4 py-2 text-xs font-semibold text-ink/70 transition-all duration-300 hover:-translate-x-0.5 hover:border-gold/70 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep sm:text-sm"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden="true" />
        Back to {noun} in {place.city}
      </button>

      <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-gold/30 bg-[#fbf6ea] shadow-[0_22px_50px_-24px_rgba(63,42,18,0.45)]">
        <div className="relative flex min-h-44 items-center justify-center overflow-hidden bg-[#efe3c8] px-6 py-8 text-center">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: "url('/img/zliij.png')" }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-linear-to-br from-white/30 via-transparent to-[#b45f3c]/15" />
          <div className="relative">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/45 bg-white/65 text-gold-deep shadow-sm backdrop-blur-sm">
              <Icon className="h-7 w-7" aria-hidden="true" />
            </div>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-deep">
              {place.typeLabel} · Verified on OpenStreetMap
            </p>
            <p className="mt-1 text-xs text-ink/45">A verified photo is not available for this place.</p>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{place.name}</h2>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-gold-deep">
                {place.typeLabel} · {place.city}
              </p>
            </div>
            <span className="rounded-full border border-[#c9a24b]/60 bg-[#c9a24b]/15 px-3.5 py-1.5 text-xs font-bold text-gold-deep">
              Verified place
            </span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-ink/70">{place.description}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-gold/25 bg-white/60 p-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-deep">Location</h3>
              <p className="mt-2 flex items-start gap-2 text-sm text-ink/70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{place.address || place.area || place.city}</span>
              </p>
              <a
                href={place.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-gold-deep underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
              >
                Open in Google Maps
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </div>

            <div className="rounded-2xl border border-gold/25 bg-white/60 p-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
                {place.kind === "restaurant" ? "Dining details" : "Visitor details"}
              </h3>
              <ul className="mt-2 space-y-2 text-sm text-ink/65">
                <li className="flex items-start gap-2">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{place.typeLabel}</span>
                </li>
                {place.cuisine && (
                  <li className="flex items-start gap-2">
                    <Utensils className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Cuisine: {place.cuisine}</span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{place.openingHours || "Opening hours not verified."}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2.5">
            {place.website && (
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-5 py-2.5 text-xs font-semibold text-gold-deep transition-all duration-300 hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep sm:text-sm"
              >
                Website
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
            {place.phone && (
              <a
                href={`tel:${String(place.phone).replace(/[^+\d]/g, "")}`}
                className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-5 py-2.5 text-xs font-semibold text-gold-deep transition-all duration-300 hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep sm:text-sm"
              >
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                {place.phone}
              </a>
            )}
            {place.sourceUrl && (
              <a
                href={place.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-5 py-2.5 text-xs font-semibold text-gold-deep transition-all duration-300 hover:bg-[#c9a24b] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep sm:text-sm"
              >
                View source
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
          </div>

          <p className="mt-4 text-[11px] leading-relaxed text-ink/45">
            Data © OpenStreetMap contributors, available under the ODbL 1.0 license
            {place.verifiedAt ? ` · verified ${place.verifiedAt}` : ""}. No prices, ratings or availability
            are shown.
          </p>
        </div>
      </div>
    </div>
  );
}
