import { regions } from "./regions";

export const cities = [
  {
    name: "Tangier",
    slug: "tangier",
    region: "tanger-tetouan-al-hoceima",
    coords: [35.7595, -5.834],
    aliases: ["Tanger", "Tanja"],
    featured: true,
  },
  {
    name: "Chefchaouen",
    slug: "chefchaouen",
    region: "tanger-tetouan-al-hoceima",
    coords: [35.1688, -5.2636],
    aliases: ["Chaouen", "Chefchaoun"],
    featured: true,
  },
  {
    name: "Oujda",
    slug: "oujda",
    region: "oriental",
    coords: [34.6814, -1.9086],
    aliases: ["Oujda-Angad"],
  },
  {
    name: "Fes",
    slug: "fes",
    region: "fes-meknes",
    coords: [34.0331, -5.0003],
    aliases: ["Fez", "Fès"],
  },
  {
    name: "Meknes",
    slug: "meknes",
    region: "fes-meknes",
    coords: [33.8935, -5.5473],
    aliases: ["Meknès"],
  },
  {
    name: "Ifrane",
    slug: "ifrane",
    region: "fes-meknes",
    coords: [33.5228, -5.1106],
    aliases: ["Ifran"],
    featured: true,
  },
  {
    name: "Rabat",
    slug: "rabat",
    region: "rabat-sale-kenitra",
    coords: [34.0209, -6.8416],
    aliases: ["Rabat-Salé"],
    featured: true,
  },
  {
    name: "Béni Mellal",
    slug: "beni-mellal",
    region: "beni-mellal-khenifra",
    coords: [32.3373, -6.3498],
    aliases: ["Beni Mellal", "Bni Mellal"],
  },
  {
    name: "Casablanca",
    slug: "casablanca",
    region: "casablanca-settat",
    coords: [33.5731, -7.5898],
    aliases: ["Casa", "Dar Beida", "Ad-Dar al-Bayda"],
    featured: true,
  },
  {
    name: "Marrakech",
    slug: "marrakech",
    region: "marrakech-safi",
    coords: [31.6295, -7.9811],
    aliases: ["Marrakesh", "Marrakush"],
  },
  {
    name: "Essaouira",
    slug: "essaouira",
    region: "marrakech-safi",
    coords: [31.5085, -9.7595],
    aliases: ["Mogador"],
  },
  {
    name: "Ouarzazate",
    slug: "ouarzazate",
    region: "draa-tafilalet",
    coords: [30.9335, -6.937],
    aliases: ["Warzazat"],
  },
  {
    name: "Agadir",
    slug: "agadir",
    region: "souss-massa",
    coords: [30.4278, -9.5981],
    aliases: ["Agadir-Ida Ou Tanane"],
  },
  {
    name: "Guelmim",
    slug: "guelmim",
    region: "guelmim-oued-noun",
    coords: [28.987, -10.0574],
    aliases: ["Guelmime", "Goulimine"],
  },
  {
    name: "Laâyoune",
    slug: "laayoune",
    region: "laayoune-sakia-el-hamra",
    coords: [27.1536, -13.2033],
    aliases: ["Laayoune", "El Aaiún", "El Aaiun"],
  },
  {
    name: "Dakhla",
    slug: "dakhla",
    region: "dakhla-oued-ed-dahab",
    coords: [23.6848, -15.957],
    aliases: ["Dajla", "Villa Cisneros"],
  },
];

export const citiesByRegion = regions
  .map((region) => ({
    ...region,
    cities: cities.filter((city) => city.region === region.id),
  }))
  .filter((region) => region.cities.length > 0);

export function getCity(slug) {
  return cities.find((city) => city.slug === slug) || null;
}

export function getCityRegion(city) {
  return regions.find((region) => region.id === city?.region) || null;
}
