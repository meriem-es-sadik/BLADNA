import { cityGuides } from "./cityGuides";

const shared = {
  source: "illustration",
  isIllustrative: true,
};

export const categoryFallbackPhotos = {
  hotel: [
    {
      ...shared,
      url: "/img/fallbacks/hotel-riad-1.jpg",
      credit: "Dahbi fatima zahrae",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Traditional_Moroccan_Riad_Courtyard_with_Pool_in_Fez,_Morocco.jpg",
    },
    {
      ...shared,
      url: "/img/fallbacks/hotel-riad-2.jpg",
      credit: "Dahbi fatima zahrae",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Traditional_Moroccan_Riad_Courtyard_with_Ornate_Architecture_in_Fez.jpg",
    },
    {
      ...shared,
      url: "/img/fallbacks/hotel-riad-3.jpg",
      credit: "Arnaud 25",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Riad_Maroc_031.JPG",
    },
  ],
  restaurant: [
    {
      ...shared,
      url: "/img/fallbacks/restaurant-tagine-1.jpg",
      credit: "Khammal92",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Moroccan_tagine.jpg",
    },
    {
      ...shared,
      url: "/img/fallbacks/restaurant-tagine-2.jpg",
      credit: "Ridouan Red",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Moroccan_TAGINE.JPG",
    },
    {
      ...shared,
      url: "/img/fallbacks/restaurant-tagine-3.jpg",
      credit: "Kim sosita",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Moroccan_meal_tagine.jpg",
    },
  ],
  activity: [
    {
      ...shared,
      url: "/img/fallbacks/activity-medina-1.jpg",
      credit: "Adam Jones",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Street_Scene_-_Medina_(Old_City)_-_Meknes,_Morocco_(4666866135).jpg",
    },
    {
      ...shared,
      url: "/img/fallbacks/activity-souk-1.jpg",
      credit: "Petar Milošević",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Oriental_hanging_lanterns._Souk_Haddadine,_Marrakech_Medina,_Morocco.jpg",
    },
    {
      ...shared,
      url: "/img/fallbacks/activity-landscape-1.jpg",
      credit: "Thomas Fuhrmann",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Erg_Chebbi_in_the_evening_light.jpg",
    },
  ],
};

export const cityFallbackPhotos = Object.fromEntries(
  Object.entries(cityGuides).map(([slug, guide]) => [
    slug,
    (guide.images || []).map((image) => ({
      ...shared,
      url: image.src,
      credit: image.credit || null,
      license: image.license || null,
      licenseUrl: image.licenseUrl || null,
      sourceUrl: image.sourceUrl || null,
    })),
  ])
);
