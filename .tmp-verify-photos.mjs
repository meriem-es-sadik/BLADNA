import { existsSync } from "node:fs";
import { createServer } from "vite";

const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

function fileOf(photo) {
  return photo.fileName || "";
}

function check(label, condition, detail = "") {
  console.log(`${condition ? "PASS" : "FAIL"} ${label}${detail ? ` — ${detail}` : ""}`);
}

try {
  const photos = await server.ssrLoadModule("/src/services/hotelPhotosService.js");
  const hotels = await server.ssrLoadModule("/src/services/hotelsService.js");

  const commaSource =
    "https://commons.wikimedia.org/wiki/File:Twin_Center,_Boulevard_Mohamed_Zerktouni,_Casablanca.JPG";
  const commaImage = hotels.normalizeImage({
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/62/Twin_Center%2C_Boulevard_Mohamed_Zerktouni%2C_Casablanca.JPG/1920px-Twin_Center%2C_Boulevard_Mohamed_Zerktouni%2C_Casablanca.JPG",
    sourceUrl: commaSource,
    source: "wikimedia",
  });
  check(
    "source URL with commas is preserved",
    commaImage?.sourceUrl === commaSource,
    commaImage?.sourceUrl || "none"
  );

  const semicolonSource =
    "https://commons.wikimedia.org/wiki/File:Twin_Center;_Test.jpg";
  const semicolonImage = hotels.normalizeImage({
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/62/Twin_Center%3B_Test.jpg/1920px-Twin_Center%3B_Test.jpg",
    sourceUrl: semicolonSource,
    source: "wikimedia",
  });
  check(
    "source URL with semicolons is preserved",
    semicolonImage?.sourceUrl === semicolonSource,
    semicolonImage?.sourceUrl || "none"
  );

  const missing = {
    id: "missing-test",
    kind: "activity",
    name: "Nonexistent BLADNA Test 98765",
    city: "",
    wikimediaCommons: "File:BLADNA missing test 98765.jpg",
  };
  const missingPhotos = await photos.getPlacePhotos(missing);
  check(
    "missing Commons file falls back to an illustrative photo",
    missingPhotos.length === 1 && missingPhotos[0].isIllustrative === true,
    `${missingPhotos.length} photos, illustrative=${missingPhotos[0]?.isIllustrative}`
  );

  const twin = {
    id: "twin-center-test",
    kind: "activity",
    name: "Twin Center",
    city: "Casablanca",
    wikimediaCommons:
      "File:Twin Center, Boulevard Mohamed Zerktouni, Casablanca.JPG",
    wikidata: "Q2743636",
    images: [
      {
        url: "https://commons.wikimedia.org/wiki/Special:FilePath/Twin%20Center%2C%20Boulevard%20Mohamed%20Zerktouni%2C%20Casablanca.JPG?width=1600",
        sourceUrl:
          "https://commons.wikimedia.org/wiki/File:Twin%20Center%2C%20Boulevard%20Mohamed%20Zerktouni%2C%20Casablanca.JPG",
        fileName: "Twin Center, Boulevard Mohamed Zerktouni, Casablanca.JPG",
        source: "wikimedia",
        credit: "Wikimedia Commons",
        license: "See file page",
      },
    ],
  };
  const twinPhotos = await photos.getPlacePhotos(twin);
  const twinFiles = twinPhotos.map(fileOf).filter(Boolean);
  const uniqueTwinFiles = new Set(twinFiles.map((name) => name.toLowerCase()));
  check(
    "same Commons file is not inserted twice",
    uniqueTwinFiles.size === twinFiles.length,
    twinFiles.join(" | ")
  );
  check(
    "Twin Center photos are relevant",
    twinPhotos.every((photo) => /twin|center/i.test(`${photo.fileName} ${photo.sourceUrl}`)),
    twinPhotos.map(fileOf).join(" | ")
  );

  const again = await photos.getPlacePhotos(twin);
  check("repeat call reuses cached result", again === twinPhotos);

  const primary = await photos.getPrimaryPhoto({
    id: "primary-missing",
    kind: "activity",
    name: "Nonexistent BLADNA Test 98765",
    city: "",
    wikimediaCommons: "File:BLADNA missing test 98765.jpg",
  });
  check(
    "missing primary returns an illustrative photo",
    primary?.isIllustrative === true,
    primary?.url || "none"
  );

  const hotelFallbacks = Array.from({ length: 12 }, (_, index) =>
    photos.getFallbackPhoto({ id: `hotel-${index}`, kind: "hotel", city: "Fes", name: `Hotel ${index}` })
  );
  check(
    "hotel fallback assets are local and exist",
    hotelFallbacks.every((photo) => photo.url.startsWith("/") && existsSync(`public${photo.url}`)),
    hotelFallbacks[0]?.url || "none"
  );
  check(
    "hotel fallbacks rotate between multiple images",
    new Set(hotelFallbacks.map((photo) => photo.url)).size > 1,
    `${new Set(hotelFallbacks.map((photo) => photo.url)).size} unique`
  );

  const restaurantFallbacks = Array.from({ length: 12 }, (_, index) =>
    photos.getFallbackPhoto({
      id: `restaurant-${index}`,
      kind: "restaurant",
      city: "Casablanca",
      name: `Restaurant ${index}`,
    })
  );
  check(
    "restaurant fallback assets are local and exist",
    restaurantFallbacks.every((photo) => photo.url.startsWith("/") && existsSync(`public${photo.url}`)),
    restaurantFallbacks[0]?.url || "none"
  );
  check(
    "restaurant fallbacks rotate between multiple images",
    new Set(restaurantFallbacks.map((photo) => photo.url)).size > 1,
    `${new Set(restaurantFallbacks.map((photo) => photo.url)).size} unique`
  );

  const activityFallback = photos.getFallbackPhoto({
    id: "activity-casa",
    kind: "activity",
    city: "Casablanca",
    name: "Activity",
  });
  check(
    "activity fallback uses an existing local asset",
    activityFallback.url.startsWith("/") && existsSync(`public${activityFallback.url}`),
    activityFallback.url
  );
  check(
    "illustrative photos are clearly marked",
    hotelFallbacks.every((photo) => photo.isIllustrative === true && photo.source === "illustration"),
    "all marked"
  );

  const errorEntity = {
    id: "api-error-test",
    kind: "activity",
    name: "Twin Center API Error",
    city: "",
    images: [
      {
        url: "https://commons.wikimedia.org/wiki/Special:FilePath/Twin%20Center%2C%20Boulevard%20Mohamed%20Zerktouni%2C%20Casablanca.JPG?width=1600",
        sourceUrl:
          "https://commons.wikimedia.org/wiki/File:Twin%20Center%2C%20Boulevard%20Mohamed%20Zerktouni%2C%20Casablanca.JPG",
        fileName: "Twin Center, Boulevard Mohamed Zerktouni, Casablanca.JPG",
        source: "wikimedia",
        credit: "Wikimedia Commons",
        license: "See file page",
      },
    ],
  };
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ error: { code: "ratelimited", info: "test" } }),
  });
  let errorPhotos = [];
  try {
    errorPhotos = await photos.getPlacePhotos(errorEntity);
  } finally {
    globalThis.fetch = realFetch;
  }
  check(
    "API error keeps existing image instead of dropping it",
    errorPhotos.length === 1,
    `${errorPhotos.length} photos`
  );

  console.log("\nTwin Center photos:");
  for (const photo of twinPhotos.slice(0, 6)) {
    console.log(`- ${photo.url}`);
    console.log(`  file=${photo.fileName} credit=${photo.credit} license=${photo.license}`);
  }
} finally {
  await server.close();
}
