const cityNames = {
  tangier: { en: "Tangier", fr: "Tanger", ar: "طنجة" },
  chefchaouen: { en: "Chefchaouen", fr: "Chefchaouen", ar: "شفشاون" },
  oujda: { en: "Oujda", fr: "Oujda", ar: "وجدة" },
  fes: { en: "Fes", fr: "Fès", ar: "فاس" },
  meknes: { en: "Meknes", fr: "Meknès", ar: "مكناس" },
  ifrane: { en: "Ifrane", fr: "Ifrane", ar: "إفران" },
  rabat: { en: "Rabat", fr: "Rabat", ar: "الرباط" },
  "beni-mellal": { en: "Beni Mellal", fr: "Beni Mellal", ar: "بني ملال" },
  casablanca: { en: "Casablanca", fr: "Casablanca", ar: "الدار البيضاء" },
  marrakech: { en: "Marrakech", fr: "Marrakech", ar: "مراكش" },
  essaouira: { en: "Essaouira", fr: "Essaouira", ar: "الصويرة" },
  ouarzazate: { en: "Ouarzazate", fr: "Ouarzazate", ar: "ورزازات" },
  agadir: { en: "Agadir", fr: "Agadir", ar: "أكادير" },
  guelmim: { en: "Guelmim", fr: "Guelmim", ar: "كلميم" },
  laayoune: { en: "Laâyoune", fr: "Laâyoune", ar: "العيون" },
  dakhla: { en: "Dakhla", fr: "Dakhla", ar: "الداخلة" },
};

export function getCityName(cityOrSlug, lang = "en") {
  const slug = typeof cityOrSlug === "string" ? cityOrSlug : cityOrSlug?.slug;
  const fallback = typeof cityOrSlug === "string" ? "" : cityOrSlug?.name || "";
  const names = cityNames[slug];
  return names?.[lang] || names?.en || fallback;
}

export function getCityKicker(slug, lang = "en") {
  const name = getCityName(slug, lang);
  if (!name) return "";
  if (lang === "ar") return `اكتشف ${name}`;
  if (lang === "fr") return `Découvrir ${name}`;
  return `Discover ${name}`;
}