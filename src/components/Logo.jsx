import ZelligeOrnament from "./ZelligeOrnament";

export default function Logo() {
  return (
    <header
      style={{ animationDelay: "120ms" }}
      className="animate-rise absolute inset-x-0 top-0 z-30 flex justify-center px-6 pt-7 sm:pt-9"
    >
      <div className="flex flex-col items-center gap-3 sm:gap-4">
        <span className="bg-linear-to-b from-[#f9f4e7] via-[#f2e6cd] to-[#d5ad63] bg-clip-text font-display text-[2.85rem] font-semibold uppercase leading-none tracking-[0.26em] [text-indent:0.26em] text-transparent drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)] sm:text-6xl lg:text-[5.2rem] xl:text-[6.1rem]">
          Bladna
        </span>
        <ZelligeOrnament className="h-5 w-60 drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)] sm:h-6 sm:w-80 lg:h-7 lg:w-[26rem]" />
      </div>
    </header>
  );
}
