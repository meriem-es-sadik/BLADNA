import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useI18n } from "../i18n/LanguageContext";

export default function LanguageSwitcher({ className = "" }) {
  const { lang, setLang, languages, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const optionRefs = useRef([]);
  const listboxId = useId();

  const selectedIndex = Math.max(
    0,
    languages.findIndex((language) => language.code === lang)
  );
  const current = languages[selectedIndex] || languages[0];

  const focusOption = (index) => {
    const next = (index + languages.length) % languages.length;
    setActiveIndex(next);
    optionRefs.current[next]?.focus();
  };

  const close = (restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  };

  const choose = (language) => {
    setLang(language.code);
    close();
  };

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const frame = window.requestAnimationFrame(() => {
      optionRefs.current[selectedIndex]?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, selectedIndex]);

  const onButtonKeyDown = (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setActiveIndex(selectedIndex);
        setOpen(true);
      } else {
        focusOption(activeIndex + (event.key === "ArrowDown" ? 1 : -1));
      }
    }
  };

  const onOptionKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusOption(activeIndex + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusOption(activeIndex - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusOption(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusOption(languages.length - 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative inline-flex ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setActiveIndex(selectedIndex);
          setOpen((value) => !value);
        }}
        onKeyDown={onButtonKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-label={`${t("nav.selectLanguage")}: ${current.label}`}
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-gold/40 bg-white/70 px-2.5 text-gold-deep transition hover:border-gold/70 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep sm:gap-2 sm:px-3"
      >
        <Globe className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span
          dir="auto"
          className="hidden max-w-24 truncate text-[11px] font-semibold tracking-[0.04em] text-ink/70 sm:inline"
        >
          {current.label}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/70 sm:hidden">
          {current.short}
        </span>
        <ChevronDown
          className={
            "h-3.5 w-3.5 shrink-0 text-ink/45 transition-transform duration-200 " +
            (open ? "rotate-180" : "")
          }
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div className="absolute end-0 top-[calc(100%+0.5rem)] z-50 w-56 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-gold/40 bg-ivory/98 p-1.5 shadow-[0_24px_60px_-18px_rgba(15,10,4,0.5)] backdrop-blur-md">
          <p className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-deep">
            {t("nav.language")}
          </p>
          <ul
            id={listboxId}
            role="listbox"
            aria-label={t("nav.selectLanguage")}
            className="flex flex-col gap-0.5"
          >
            {languages.map((language, index) => {
              const isSelected = language.code === lang;
              return (
                <li key={language.code} role="presentation">
                  <button
                    ref={(node) => {
                      optionRefs.current[index] = node;
                    }}
                    type="button"
                    role="option"
                    aria-label={language.label}
                    aria-selected={isSelected}
                    tabIndex={-1}
                    onClick={() => choose(language)}
                    onMouseEnter={() => setActiveIndex(index)}
                    onKeyDown={onOptionKeyDown}
                    className={
                      "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep " +
                      (isSelected
                        ? "bg-[#c9a24b]/18 text-gold-deep shadow-[inset_0_0_0_1px_rgba(201,162,75,0.55)]"
                        : "text-ink/75 hover:bg-white/80 hover:text-ink")
                    }
                  >
                    <span
                      className={
                        "flex h-7 w-8 shrink-0 items-center justify-center rounded-lg border text-[10px] font-bold tracking-[0.08em] " +
                        (isSelected
                          ? "border-gold/60 bg-white/80 text-gold-deep"
                          : "border-gold/30 bg-white/60 text-ink/55")
                      }
                      aria-hidden="true"
                    >
                      {language.short}
                    </span>
                    <span
                      dir="auto"
                      className="min-w-0 flex-1 truncate text-sm font-semibold"
                    >
                      {language.label}
                    </span>
                    {isSelected ? (
                      <Check
                        className="h-4 w-4 shrink-0 text-gold-deep"
                        aria-hidden="true"
                      />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
