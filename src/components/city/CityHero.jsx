import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

const AUTO_MS = 4800;
const RESUME_DELAY_MS = 8000;

export default function CityHero({ guide, city }) {
  const images = guide?.images?.length ? guide.images : [];
  const [index, setIndex] = useState(0);
  const [previous, setPrevious] = useState(null);
  const [manualPaused, setManualPaused] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [ready, setReady] = useState(() => new Set([0]));
  const [failed, setFailed] = useState(() => new Set());
  const pauseUntil = useRef(0);
  const touch = useRef(null);

  const total = images.length;
  const canSlide = total > 1;
  const active = images[index];

  useEffect(() => {
    setIndex(0);
    setPrevious(null);
    setManualPaused(false);
    setHoverPaused(false);
    setReady(new Set([0]));
    setFailed(new Set());
    pauseUntil.current = 0;
  }, [guide?.slug]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (!canSlide || manualPaused || hoverPaused || reducedMotion) return undefined;
    const timer = window.setInterval(() => {
      if (Date.now() < pauseUntil.current) return;
      setPrevious(index);
      setIndex((current) => (current + 1) % total);
    }, AUTO_MS);
    return () => window.clearInterval(timer);
  }, [canSlide, manualPaused, hoverPaused, reducedMotion, total, index]);

  useEffect(() => {
    if (!canSlide) return;
    const next = (index + 1) % total;
    setReady((current) => {
      if (current.has(next)) return current;
      const copy = new Set(current);
      copy.add(next);
      return copy;
    });
    const preload = new window.Image();
    preload.src = images[next].src;
  }, [canSlide, images, index, total]);

  if (!city) return null;

  const goTo = (nextIndex, manual = true) => {
    if (!canSlide || nextIndex === index) return;
    if (manual) pauseUntil.current = Date.now() + RESUME_DELAY_MS;
    setPrevious(index);
    setIndex((nextIndex + total) % total);
  };

  const move = (direction) => goTo(index + direction);

  const onTouchStart = (event) => {
    if (!canSlide) return;
    touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  };

  const onTouchEnd = (event) => {
    if (!canSlide || !touch.current) return;
    const deltaX = event.changedTouches[0].clientX - touch.current.x;
    const deltaY = event.changedTouches[0].clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(deltaX) < 45 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;
    move(deltaX < 0 ? 1 : -1);
  };

  const onKeyDown = (event) => {
    if (!canSlide) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
  };

  return (
    <section
      aria-labelledby="city-hero-title"
      className="relative mt-5 overflow-hidden rounded-[1.75rem] border border-gold/35 bg-ink shadow-[0_24px_60px_-30px_rgba(63,42,18,0.7)]"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onFocusCapture={() => setHoverPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHoverPaused(false);
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onKeyDown={onKeyDown}
    >
      <div className="relative h-[24rem] sm:h-[28rem] lg:h-[31rem]">
        {images.map((image, imageIndex) => {
          const isActive = imageIndex === index;
          const isLeaving = imageIndex === previous && !isActive;
          if (!isActive && !isLeaving) return null;
          if (failed.has(imageIndex)) return null;
          return (
            <img
              key={image.src}
              src={isActive || ready.has(imageIndex) ? image.src : undefined}
              alt={isActive ? image.alt : ""}
              aria-hidden={!isActive}
              loading={isActive ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={isActive ? "high" : "auto"}
              draggable={false}
              onError={() => {
                const nextFailed = new Set(failed).add(imageIndex);
                setFailed(nextFailed);
                if (isActive) {
                  const next = images.findIndex(
                    (_, candidate) => candidate !== imageIndex && !nextFailed.has(candidate)
                  );
                  if (next !== -1) {
                    setPrevious(null);
                    setIndex(next);
                  }
                }
              }}
              className={
                "city-hero-image absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-out motion-reduce:transition-none " +
                (isActive ? "opacity-100" : "opacity-0")
              }
            />
          );
        })}

        <div className="absolute inset-0 bg-linear-to-t from-[#1b1208]/92 via-[#1b1208]/45 to-[#1b1208]/10" />
        <div className="absolute inset-0 bg-linear-to-r from-[#1b1208]/65 via-transparent to-transparent" />

        <div className="relative flex h-full flex-col justify-between p-5 sm:p-7 lg:p-9">
          <div className="flex items-start justify-between gap-4">
            <span className="inline-flex max-w-[70%] items-center gap-2 rounded-full border border-white/25 bg-[#1b1208]/35 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f4dfb0] backdrop-blur-md sm:text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
              Bladna city guide · {guide?.kicker || "Morocco"}
            </span>

            <div className="flex flex-col items-end gap-2">
              {canSlide && (
                <button
                  type="button"
                  onClick={() => {
                    setHoverPaused(false);
                    setManualPaused((current) => !current);
                  }}
                  aria-label={manualPaused ? "Resume automatic slideshow" : "Pause automatic slideshow"}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-[#1b1208]/40 text-white backdrop-blur-md transition hover:border-gold/80 hover:text-[#f4dfb0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  {manualPaused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
                </button>
              )}
              {active?.credit && !failed.has(index) && (
                <a
                  href={active.sourceUrl || active.licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Photo: ${active.credit} (${active.license})`}
                  className="max-w-[9rem] truncate rounded-full border border-white/20 bg-[#1b1208]/35 px-2.5 py-1 text-[10px] text-white/75 backdrop-blur-md transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:max-w-[16rem]"
                >
                  Photo: {active.credit} · {active.license}
                </a>
              )}
            </div>
          </div>

          <div className="max-w-2xl pb-7 sm:pb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f4dfb0]/90">
              {guide?.tagline || "A city worth discovering"}
            </p>
            <h1
              id="city-hero-title"
              className="mt-2 font-display text-4xl font-medium leading-[1.02] text-white sm:text-5xl lg:text-6xl"
            >
              {guide?.title || city.name}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-[15px]">
              {guide?.description || "Explore the best places and experiences in your destination."}
            </p>
          </div>
        </div>

        {canSlide && (
          <>
            <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3 sm:px-4">
              <button
                type="button"
                onClick={() => move(-1)}
                aria-label="Previous city photo"
                className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-[#1b1208]/40 text-white backdrop-blur-md transition hover:border-gold/80 hover:bg-[#1b1208]/65 hover:text-[#f4dfb0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                aria-label="Next city photo"
                className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-[#1b1208]/40 text-white backdrop-blur-md transition hover:border-gold/80 hover:bg-[#1b1208]/65 hover:text-[#f4dfb0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-[#1b1208]/35 px-3 py-1.5 backdrop-blur-md">
              {images.map((image, imageIndex) => (
                <button
                  key={image.src}
                  type="button"
                  onClick={() => goTo(imageIndex)}
                  aria-label={`Show city photo ${imageIndex + 1} of ${total}`}
                  aria-current={imageIndex === index}
                  className={
                    "h-1.5 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold " +
                    (imageIndex === index ? "w-6 bg-[#f4dfb0]" : "w-1.5 bg-white/45 hover:bg-white/75")
                  }
                />
              ))}
            </div>
          </>
        )}

        <span className="sr-only" aria-live="polite">
          Photo {index + 1} of {total}: {active?.alt || city.name}
        </span>
      </div>
    </section>
  );
}
