import { HERO_IMAGE } from "../data/images";

export default function Background() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <img
        src={HERO_IMAGE}
        alt=""
        fetchPriority="high"
        decoding="async"
        className="animate-bg-zoom h-[104%] w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-black/30" />
      <div className="absolute inset-0 bg-linear-to-r from-black/25 via-black/5 to-black/45" />
    </div>
  );
}
