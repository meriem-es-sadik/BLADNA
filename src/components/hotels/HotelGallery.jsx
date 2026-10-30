import { useEffect, useRef, useState } from "react";

const PLACEHOLDER = "/img/hotel-placeholder.svg";

function Chevron({ direction }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {direction === "left" ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  );
}

export default function HotelGallery({ images, name }) {
  const list = Array.isArray(images) ? images : [];
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState(() => new Set());
  const [lightbox, setLightbox] = useState(false);
  const touchStart = useRef(null);
  const closeRef = useRef(null);
  const returnFocus = useRef(null);

  useEffect(() => {
    setActive(0);
    setFailed(new Set());
    setLightbox(false);
  }, [name]);

  useEffect(() => {
    setActive((index) => Math.min(index, Math.max(0, list.length - 1)));
  }, [list.length]);

  const current = list[active] || null;
  const showingPlaceholder = !current || failed.has(active);
  const hasMultiple = list.length > 1;

  const nextAvailable = (direction) => {
    if (!list.length) return active;
    const nextFailed = new Set(failed);
    nextFailed.add(active);
    for (let step = 1; step <= list.length; step += 1) {
      const index = (active + direction * step + list.length) % list.length;
      if (!nextFailed.has(index)) return index;
    }
    return active;
  };

  const move = (direction) => {
    if (!hasMultiple) return;
    setActive(nextAvailable(direction));
  };

  const markFailed = (index) => {
    const nextFailed = new Set(failed);
    nextFailed.add(index);
    setFailed(nextFailed);
    if (index === active && hasMultiple) {
      for (let step = 1; step <= list.length; step += 1) {
        const candidate = (index + step) % list.length;
        if (!nextFailed.has(candidate)) {
          setActive(candidate);
          break;
        }
      }
    }
  };

  const openLightbox = () => {
    if (!current || showingPlaceholder) return;
    returnFocus.current = document.activeElement;
    setLightbox(true);
  };

  useEffect(() => {
    if (!lightbox) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => closeRef.current?.focus());
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      if (returnFocus.current instanceof HTMLElement) returnFocus.current.focus();
    };
  }, [lightbox]);

  useEffect(() => {
    if (!lightbox) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setLightbox(false);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        move(1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightbox, active, failed, list.length]);

  const onTouchStart = (event) => {
    touchStart.current = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event) => {
    if (touchStart.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStart.current;
    const delta = endX - touchStart.current;
    touchStart.current = null;
    if (Math.abs(delta) < 45) return;
    move(delta > 0 ? -1 : 1);
  };

  if (!list.length) {
    return (
      <div className="relative overflow-hidden">
        <img
          src={PLACEHOLDER}
          alt=""
          loading="lazy"
          decoding="async"
          className="aspect-[16/9] w-full object-cover sm:aspect-[21/9]"
        />
        <span className="absolute bottom-3 right-3 rounded-full border border-gold/30 bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/50 backdrop-blur-sm">
          Illustration — no verified photo
        </span>
      </div>
    );
  }

  const credit = current && !showingPlaceholder ? current : null;

  return (
    <div>
      <div
        className="relative bg-[#efe4ce]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <button
          type="button"
          onClick={openLightbox}
          className="block w-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-gold-deep"
          aria-label={showingPlaceholder ? undefined : `Open photo ${active + 1} of ${list.length}`}
        >
          <img
            src={showingPlaceholder ? PLACEHOLDER : current.url}
            alt={
              showingPlaceholder
                ? ""
                : `${name} — photo ${active + 1} of ${list.length}`
            }
            loading="lazy"
            decoding="async"
            onError={() => {
              if (!showingPlaceholder) markFailed(active);
            }}
            className="aspect-[16/9] w-full object-cover sm:aspect-[21/9]"
          />
        </button>

        {showingPlaceholder && (
          <span className="absolute bottom-3 right-3 rounded-full border border-gold/30 bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/50 backdrop-blur-sm">
            Illustration — no verified photo
          </span>
        )}

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/50 bg-[#1b140c]/55 p-2 text-white backdrop-blur-sm transition hover:bg-[#1b140c]/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-3"
            >
              <Chevron direction="left" />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/50 bg-[#1b140c]/55 p-2 text-white backdrop-blur-sm transition hover:bg-[#1b140c]/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-3"
            >
              <Chevron direction="right" />
            </button>
            <span className="absolute right-3 top-3 rounded-full border border-white/40 bg-[#1b140c]/55 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
              {active + 1} / {list.length}
            </span>
          </>
        )}

        {credit && (
          <a
            href={credit.sourceUrl || credit.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            title={`Photo: ${credit.credit}${credit.license ? ` (${credit.license})` : ""}`}
            className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full border border-gold/30 bg-white/85 px-2.5 py-1 text-[10px] font-semibold text-ink/60 backdrop-blur-sm hover:text-gold-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
          >
            Photo: {credit.credit}
            {credit.license ? ` · ${credit.license}` : ""}
          </a>
        )}
      </div>

      {hasMultiple && (
        <div className="flex gap-2 overflow-x-auto border-t border-gold/20 bg-[#f6ecd8]/60 p-3">
          {list.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show photo ${index + 1}`}
              aria-current={index === active}
              className={
                "h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep " +
                (index === active
                  ? "border-gold-deep"
                  : "border-transparent opacity-70 hover:opacity-100")
              }
            >
              <img
                src={failed.has(index) ? PLACEHOLDER : image.url}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {list.some((image) => image.source === "google") && (
        <p className="border-b border-gold/20 bg-[#f6ecd8]/60 px-4 py-2 text-[10px] leading-relaxed text-ink/55 sm:px-6">
          Some photos via{" "}
          <a
            href="https://www.google.com/maps"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gold-deep underline-offset-2 hover:underline"
          >
            Google
          </a>
          .
        </p>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-[#120d08]/95 p-4 text-white sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} photo gallery`}
        >
          <div className="flex items-center justify-between gap-4">
            <p className="truncate font-display text-sm text-white/80 sm:text-base">{name}</p>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/60">
                {active + 1} / {list.length}
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setLightbox(false)}
                aria-label="Close photo gallery"
                className="rounded-full border border-white/40 p-2 text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center py-4"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <img
              src={showingPlaceholder ? PLACEHOLDER : current.url}
              alt={showingPlaceholder ? "" : `${name} — photo ${active + 1} of ${list.length}`}
              className="max-h-full max-w-full object-contain"
            />
            {hasMultiple && (
              <>
                <button
                  type="button"
                  onClick={() => move(-1)}
                  aria-label="Previous photo"
                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-black/35 p-3 text-white backdrop-blur-sm transition hover:bg-black/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <Chevron direction="left" />
                </button>
                <button
                  type="button"
                  onClick={() => move(1)}
                  aria-label="Next photo"
                  className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-black/35 p-3 text-white backdrop-blur-sm transition hover:bg-black/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <Chevron direction="right" />
                </button>
              </>
            )}
          </div>

          {credit && (
            <p className="shrink-0 text-center text-[11px] leading-relaxed text-white/60">
              Photo:{" "}
              <a
                href={credit.sourceUrl || credit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-white"
              >
                {credit.credit}
              </a>
              {credit.license ? ` · ${credit.license}` : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
