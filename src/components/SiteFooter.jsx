import { Instagram } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="relative z-20 mt-auto shrink-0 bg-[#111111] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-10">
        <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-[0.28em] text-[#d3a24b]">
              Bladna
            </p>
            <p className="mt-1 text-xs text-white/75">Discover Morocco, one city at a time.</p>
          </div>
          <a
            href="https://www.instagram.com/bladna01/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow Bladna on Instagram"
            className="group inline-flex items-center gap-2 rounded-full border border-[#d3a24b]/55 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d3a24b] hover:text-[#d3a24b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d3a24b]"
          >
            <Instagram className="h-4 w-4 text-[#d3a24b]" aria-hidden="true" />
            Follow @bladna01
          </a>
        </div>
        <p className="text-center text-[10px] leading-relaxed text-white/50 sm:text-left">
          Place data © OpenStreetMap contributors, ODbL 1.0. City photography via Wikimedia Commons
          with credits shown on each image.
        </p>
      </div>
    </footer>
  );
}
