import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { LANGUAGES, translations } from "./translations";

const STORAGE_KEY = "bladna-lang";
const LanguageContext = createContext(null);

function readInitialLanguage() {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && translations[stored]) return stored;
  } catch {
    /* storage unavailable */
  }
  return "en";
}

function interpolate(value, vars) {
  if (!vars) return value;
  return Object.entries(vars).reduce(
    (result, [key, replacement]) => result.split(`{${key}}`).join(String(replacement)),
    value
  );
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readInitialLanguage);
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dir;
    document.title = translations[lang]?.["meta.title"] || translations.en["meta.title"];
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* storage unavailable */
    }
  }, [lang, dir]);

  const setLang = (next) => {
    if (translations[next]) setLangState(next);
  };

  const t = useMemo(() => {
    const dictionary = translations[lang] || translations.en;
    return (key, vars) => {
      const value = dictionary[key] ?? translations.en[key] ?? key;
      return interpolate(value, vars);
    };
  }, [lang]);

  const value = useMemo(
    () => ({ lang, setLang, t, dir, isRtl: dir === "rtl", languages: LANGUAGES }),
    [lang, t, dir]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useI18n must be used within a LanguageProvider");
  return context;
}
