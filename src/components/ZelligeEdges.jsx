const CORNERS = [
  {
    src: "/img/zliij.png",
    position: "-start-24 -top-20 sm:-start-32 sm:-top-28",
    size: "w-[260px] sm:w-[360px] lg:w-[420px]",
    opacity: "opacity-60",
    blend: "mix-blend-multiply",
    mask: "radial-gradient(circle at 24% 24%, black 38%, transparent 68%)",
  },
  {
    src: "/img/zliij-removebg-preview.png",
    position: "-end-20 top-[16%]",
    size: "w-[200px] sm:w-[280px] lg:w-[320px]",
    opacity: "opacity-55",
    blend: "",
    mask: "radial-gradient(circle at 78% 45%, black 36%, transparent 66%)",
  },
  {
    src: "/img/zliij-removebg-preview.png",
    position: "-start-20 bottom-[20%]",
    size: "w-[190px] sm:w-[250px]",
    opacity: "opacity-50",
    blend: "",
    mask: "radial-gradient(circle at 28% 62%, black 36%, transparent 66%)",
  },
  {
    src: "/img/zliij.png",
    position: "-bottom-20 -end-24 sm:-bottom-28 sm:-end-32",
    size: "w-[260px] sm:w-[360px] lg:w-[420px]",
    opacity: "opacity-60",
    blend: "mix-blend-multiply",
    mask: "radial-gradient(circle at 72% 74%, black 38%, transparent 68%)",
  },
];

export default function ZelligeEdges() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-multiply"
        style={{
          backgroundImage: 'url("/img/zliij.png")',
          backgroundRepeat: "repeat",
          backgroundSize: "240px 240px",
          maskImage: "radial-gradient(ellipse at center, transparent 32%, black 100%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, transparent 32%, black 100%)",
        }}
      />

      <div
        className="absolute inset-y-0 start-0 hidden w-14 opacity-45 mix-blend-multiply sm:block lg:w-20"
        style={{
          backgroundImage: 'url("/img/zliij.png")',
          backgroundRepeat: "repeat-y",
          backgroundSize: "auto 190px",
          backgroundPosition: "left center",
          maskImage: "linear-gradient(to right, black, transparent)",
          WebkitMaskImage: "linear-gradient(to right, black, transparent)",
        }}
      />
      <div
        className="absolute inset-y-0 end-0 hidden w-14 opacity-45 mix-blend-multiply sm:block lg:w-20"
        style={{
          backgroundImage: 'url("/img/zliij.png")',
          backgroundRepeat: "repeat-y",
          backgroundSize: "auto 190px",
          backgroundPosition: "right center",
          maskImage: "linear-gradient(to left, black, transparent)",
          WebkitMaskImage: "linear-gradient(to left, black, transparent)",
        }}
      />

      {CORNERS.map((corner, index) => (
        <img
          key={index}
          src={corner.src}
          alt=""
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
          className={`absolute ${corner.position} ${corner.size} ${corner.opacity} ${corner.blend}`}
          style={{
            maskImage: corner.mask,
            WebkitMaskImage: corner.mask,
          }}
        />
      ))}

      <div className="absolute inset-y-0 start-0 hidden w-px bg-linear-to-b from-transparent via-gold/45 to-transparent sm:block" />
      <div className="absolute inset-y-0 end-0 hidden w-px bg-linear-to-b from-transparent via-gold/45 to-transparent sm:block" />
    </div>
  );
}

export function ZelligeDivider({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative z-10 flex h-10 w-full items-center justify-center overflow-hidden ${className}`}
    >
      <div className="absolute inset-x-0 top-1/2 h-px bg-linear-to-r from-transparent via-gold/50 to-transparent" />
      <div
        className="absolute inset-x-0 top-1/2 h-8 -translate-y-1/2 opacity-70"
        style={{
          backgroundImage: 'url("/img/zliij-removebg-preview.png")',
          backgroundRepeat: "repeat-x",
          backgroundSize: "auto 100%",
          backgroundPosition: "center",
          maskImage: "linear-gradient(to right, transparent, black 18%, black 82%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 18%, black 82%, transparent)",
        }}
      />
    </div>
  );
}
