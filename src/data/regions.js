export const regions = [
  {
    id: "tanger-tetouan-al-hoceima",
    name: {
      en: "Tanger-Tétouan-Al Hoceïma",
      fr: "Tanger-Tétouan-Al Hoceïma",
      ar: "طنجة-تطوان-الحسيمة",
    },
  },
  {
    id: "oriental",
    name: { en: "Oriental", fr: "L’Oriental", ar: "الشرق" },
  },
  {
    id: "fes-meknes",
    name: { en: "Fès-Meknès", fr: "Fès-Meknès", ar: "فاس-مكناس" },
  },
  {
    id: "rabat-sale-kenitra",
    name: {
      en: "Rabat-Salé-Kénitra",
      fr: "Rabat-Salé-Kénitra",
      ar: "الرباط-سلا-القنيطرة",
    },
  },
  {
    id: "beni-mellal-khenifra",
    name: {
      en: "Béni Mellal-Khénifra",
      fr: "Béni Mellal-Khénifra",
      ar: "بني ملال-خنيفرة",
    },
  },
  {
    id: "casablanca-settat",
    name: {
      en: "Casablanca-Settat",
      fr: "Casablanca-Settat",
      ar: "الدار البيضاء-سطات",
    },
  },
  {
    id: "marrakech-safi",
    name: { en: "Marrakech-Safi", fr: "Marrakech-Safi", ar: "مراكش-آسفي" },
  },
  {
    id: "draa-tafilalet",
    name: { en: "Drâa-Tafilalet", fr: "Drâa-Tafilalet", ar: "درعة-تافيلالت" },
  },
  {
    id: "souss-massa",
    name: { en: "Souss-Massa", fr: "Souss-Massa", ar: "سوس-ماسة" },
  },
  {
    id: "guelmim-oued-noun",
    name: {
      en: "Guelmim-Oued Noun",
      fr: "Guelmim-Oued Noun",
      ar: "كلميم-واد نون",
    },
  },
  {
    id: "laayoune-sakia-el-hamra",
    name: {
      en: "Laâyoune-Sakia El Hamra",
      fr: "Laâyoune-Sakia El Hamra",
      ar: "العيون-الساقية الحمراء",
    },
  },
  {
    id: "dakhla-oued-ed-dahab",
    name: {
      en: "Dakhla-Oued Ed-Dahab",
      fr: "Dakhla-Oued Ed-Dahab",
      ar: "الداخلة-وادي الذهب",
    },
  },
];

export function regionName(region, lang = "en") {
  if (!region) return "";
  return region.name?.[lang] || region.name?.en || "";
}

export function getRegion(regionId) {
  return regions.find((region) => region.id === regionId) || null;
}
