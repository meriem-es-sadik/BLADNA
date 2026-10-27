export default function ZelligeEdges() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 select-none">
      <img
        src="/img/zliij.png"
        alt=""
        loading="eager"
        className="absolute -left-44 -top-44 w-[380px] opacity-90 mix-blend-multiply sm:-left-52 sm:-top-52 sm:w-[470px]"
        style={{
          maskImage: "radial-gradient(circle at 25% 25%, black 28%, transparent 55%)",
          WebkitMaskImage: "radial-gradient(circle at 25% 25%, black 28%, transparent 55%)",
        }}
      />
      <img
        src="/img/zliij.png"
        alt=""
        loading="lazy"
        className="absolute -right-44 top-[12%] hidden w-[330px] opacity-85 mix-blend-multiply sm:block"
        style={{
          maskImage: "radial-gradient(circle at 80% 50%, black 26%, transparent 52%)",
          WebkitMaskImage: "radial-gradient(circle at 80% 50%, black 26%, transparent 52%)",
        }}
      />
      <img
        src="/img/zliij.png"
        alt=""
        loading="lazy"
        className="absolute -bottom-44 -right-48 w-[380px] opacity-80 mix-blend-multiply sm:-bottom-52 sm:-right-52 sm:w-[460px]"
        style={{
          maskImage: "radial-gradient(circle at 70% 70%, black 28%, transparent 55%)",
          WebkitMaskImage: "radial-gradient(circle at 70% 70%, black 28%, transparent 55%)",
        }}
      />
    </div>
  );
}
