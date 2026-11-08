import { createServer } from "vite";

const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

const sample = (list, size = 3) => list.slice(0, size);

try {
  const hotelsService = await server.ssrLoadModule("/src/services/hotelsService.js");
  const placesService = await server.ssrLoadModule("/src/services/placesService.js");
  const photoService = await server.ssrLoadModule("/src/services/hotelPhotosService.js");
  const { cities } = await server.ssrLoadModule("/src/data/cities.js");

  for (const slug of ["casablanca", "chefchaouen"]) {
    const city = cities.find((item) => item.slug === slug);
    if (!city) continue;
    console.log(`\n### ${city.name}`);

    const groups = [
      ["hotels", sample(hotelsService.getFallbackHotels(city))],
      ["restaurants", sample(placesService.getFallbackPlaces(city, "restaurant"))],
      ["activities", sample(placesService.getFallbackPlaces(city, "activity"))],
    ];

    for (const [label, list] of groups) {
      let exact = 0;
      let illustrative = 0;
      let missing = 0;
      console.log(`- ${label}: ${list.length} sampled`);
      for (const entity of list) {
        const photo = await photoService.getPrimaryPhoto(entity);
        if (!photo) {
          missing += 1;
          console.log(`  MISSING ${entity.name}`);
          continue;
        }
        if (photo.isIllustrative) {
          illustrative += 1;
          console.log(`  illustrative ${entity.name} -> ${photo.url}`);
        } else {
          exact += 1;
          console.log(`  genuine ${entity.name} -> ${photo.url}`);
        }
      }
      console.log(`  total exact=${exact} illustrative=${illustrative} missing=${missing}`);
    }
  }
} finally {
  await server.close();
}
