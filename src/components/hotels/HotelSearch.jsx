export default function HotelSearch({ value, onChange }) {
  return (
    <label className="relative block w-full sm:max-w-xs">
      <span className="sr-only">Search hotels by name</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search hotels by name…"
        className="w-full rounded-full border border-gold/35 bg-white/70 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink/40 focus:border-gold/80 focus:outline-none focus:ring-2 focus:ring-[#c9a24b]/30"
      />
    </label>
  );
}
