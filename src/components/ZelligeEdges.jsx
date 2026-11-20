export default function ZelligeEdges() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-clip select-none">
      <img
        src="/img/zliij.png"
        alt=""
        loading="eager"
        decoding="async"
        className="absolute -start-28 -top-24 w-[220px] opacity-35 mix-blend-multiply sm:-start-36 sm:-top-28 sm:w-[300px] lg:w-[360px]"
        style={{
          maskImage: "radial-gradient(circle at 22% 22%, black 28%, transparent 58%)",
          WebkitMaskImage: "radial-gradient(circle at 22% 22%, black 28%, transparent 58%)",
        }}
      />
      <img
        src="/img/zliij.png"
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute -end-24 top-[18%] hidden w-[190px] opacity-28 mix-blend-multiply md:block lg:w-[250px]"
        style={{
          maskImage: "radial-gradient(circle at 78% 50%, black 24%, transparent 56%)",
          WebkitMaskImage: "radial-gradient(circle at 78% 50%, black 24%, transparent 56%)",
        }}
      />
      <img
        src="/img/zliij.png"
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute -start-20 bottom-[22%] hidden w-[170px] opacity-22 mix-blend-multiply lg:block"
        style={{
          maskImage: "radial-gradient(circle at 30% 60%, black 24%, transparent 56%)",
          WebkitMaskImage: "radial-gradient(circle at 30% 60%, black 24%, transparent 56%)",
        }}
      />
      <img
        src="/img/zliij.png"
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute -bottom-24 -end-28 w-[220px] opacity-30 mix-blend-multiply sm:-bottom-28 sm:-end-36 sm:w-[300px] lg:w-[360px]"
        style={{
          maskImage: "radial-gradient(circle at 72% 72%, black 28%, transparent 58%)",
          WebkitMaskImage: "radial-gradient(circle at 72% 72%, black 28%, transparent 58%)",
        }}
      />
      <div className="absolute inset-y-0 start-0 hidden w-px bg-linear-to-b from-transparent via-gold/20 to-transparent sm:block" />
      <div className="absolute inset-y-0 end-0 hidden w-px bg-linear-to-b from-transparent via-gold/20 to-transparent sm:block" />
    </div>
  );
}
