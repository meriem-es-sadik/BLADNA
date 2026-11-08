import { createServer } from "vite";
import { cities } from "./src/data/cities.js";

const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

function pick(list, predicate) {
  return list.find(predicate) || null;
}

function report(label, photos) {
  const list = Array.isArray(photos) ? photos : photos ? [photos] : [];
  console.log(`\n=== ${label} (${list.length})`);
  for (const photo of list.slice(0, 4)) {
    console.log(`- ${photo.url}`);
    console.log(`  credit=${photo.credit} license=${photo.license} file=${photo.fileName || ""}`);
  }
  if (!list.length) console.log("- NO PHOTO (placeholder will be shown)");
}

try {
  const hotelsService = await server.ssrLoadModule("/src/services/hotelsService.js");
  const placesService = await server.ssrLoadModule("/src/services/placesService.js");
  const photoService = await server.ssrLoadModule("/src/services/hotelPhotosService.js");

  const bySlug = Object.fromEntries(cities.map((city) => [city.slug, city]));
  const casablanca = bySlug.casablanca;
  const rabat = bySlug.rabat;
  const marrakech = bySlug.marrakech;

  const casaHotels = hotelsService.getFallbackHotels(casablanca);
  const marrakechHotels = hotelsService.getFallbackHotels(marrakech);

  const hyatt = pick(casaHotels, (h) => /Hyatt Regency/i.test(h.name));
  const novotel = pick(casaHotels, (h) => /Novotel/i.test(h.name));
  const mamounia = pick(marrakechHotels, (h) => /Mamounia/i.test(h.name));

  report(`HOTEL PRIMARY ${novotel.name} (${novotel.city})`, await photoService.getPrimaryPhoto(novotel));
  report(`HOTEL GALLERY ${hyatt.name} (${hyatt.city})`, await photoService.getHotelPhotos(hyatt));
  report(`HOTEL GALLERY ${mamounia.name} (${mamounia.city})`, await photoService.getHotelPhotos(mamounia));

  const activities = [
    pick(placesService.getFallbackPlaces(casablanca, "activity"), (p) => /Hassan II Mosque/i.test(p.name)),
    pick(placesService.getFallbackPlaces(rabat, "activity"), (p) => /Kasbah of the Udayas/i.test(p.name)),
    pick(placesService.getFallbackPlaces(marrakech, "activity"), (p) => /Majorelle/i.test(p.name)),
  ].filter(Boolean);

  for (const place of activities) {
    report(`ACTIVITY ${place.name} (${place.city})`, await photoService.getPlacePhotos(place));
  }

  const restaurants = [
    pick(placesService.getFallbackPlaces(casablanca, "restaurant"), (p) => /La Veranda/i.test(p.name)),
    pick(placesService.getFallbackPlaces(casablanca, "restaurant"), (p) => /OLEA/i.test(p.name)),
  ].filter(Boolean);

  for (const place of restaurants) {
    report(`RESTAURANT ${place.name} (${place.city})`, await photoService.getPlacePhotos(place));
  }

  try {
    const liveRestaurants = await placesService.getPlaces(casablanca, "restaurant");
    const withImages = liveRestaurants
      .filter((record) => (record.images && record.images.length) || record.wikimediaCommons || record.wikidata)
      .slice(0, 3);
    console.log(`\nLive Casablanca restaurants with image metadata: ${withImages.length}`);
    for (const record of withImages) {
      const place = placesService.formatPlace(record, "restaurant", casablanca);
      report(`LIVE RESTAURANT ${place.name}`, await photoService.getPlacePhotos(place));
    }
  } catch (error) {
    console.log("\nLive restaurant fetch failed:", error.message);
  }
} finally {
  await server.close();
}
