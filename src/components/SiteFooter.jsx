import { Instagram } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-gold/25 pt-5">
      <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-[0.28em] text-gold-deep">
            Bladna
          </p>
          <p className="mt-1 text-xs text-ink/50">Discover Morocco, one city at a time.</p>
        </div>
        <a
          href="https://www.instagram.com/bladna01/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow Bladna on Instagram"
          className="group inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/60 px-4 py-2 text-xs font-semibold text-ink/65 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/75 hover:text-gold-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep"
        >
          <Instagram className="h-4 w-4" aria-hidden="true" />
          Follow @bladna01
        </a>
      </div>
      <p className="mt-4 text-center text-[10px] leading-relaxed text-ink/35 sm:text-left">
        Place data © OpenStreetMap contributors, ODbL 1.0. City photography via Wikimedia Commons
        with credits shown on each image.
      </p>
    </footer>
  );
}
