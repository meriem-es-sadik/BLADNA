import { activitiesFallbackByCity } from "../data/activitiesFallback";
import { restaurantsFallbackByCity } from "../data/restaurantsFallback";

const CACHE_MS = 5 * 60 * 1000;
const cache = new Map();
const inflight = new Map();

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const CUISINE_LABELS = {
  moroccan: "Moroccan",
  italian: "Italian",
  french: "French",
  spanish: "Spanish",
  mediterranean: "Mediterranean",
  seafood: "Seafood",
  pizza: "Pizza",
  burger: "Burger",
  asian: "Asian",
  chinese: "Chinese",
  indian: "Indian",
  japanese: "Japanese",
  sushi: "Sushi",
  vietnamese: "Vietnamese",
  turkish: "Turkish",
  lebanese: "Lebanese",
  international: "International",
  regional: "Regional Moroccan",
  african: "African",
  cafe: "Café",
};

const ACTIVITY_LABELS = {
  museum: "Museum",
  attraction: "Attraction",
  gallery: "Gallery",
  viewpoint: "Viewpoint",
  zoo: "Zoo",
  theme_park: "Theme park",
  castle: "Historic castle",
  fort: "Historic fort",
  monument: "Monument",
  memorial: "Memorial",
  archaeological_site: "Archaeological site",
  ruins: "Historic ruins",
  yes: "Historic site",
  building: "Historic building",
  place_of_worship: "Religious site",
  park: "Park",
  garden: "Garden",
  nature_reserve: "Nature reserve",
  beach: "Beach",
  spring: "Natural spring",
  cape: "Scenic cape",
  peak: "Mountain peak",
  theatre: "Theatre",
  arts_centre: "Arts centre",
  marina: "Marina",
  university: "Landmark",
  artwork: "Public artwork",
  monument_site: "Monument",
  city_gate: "Historic gate",
  tower: "Landmark",
  garden_site: "Garden",
};

function humanize(value) {
  const cleaned = String(value || "")
    .split(";")[0]
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "";
  return cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function cuisineLabel(cuisine) {
  if (!cuisine) return "Restaurant";
  const first = String(cuisine).split(";")[0].trim().toLowerCase();
  const label = CUISINE_LABELS[first] || humanize(first);
  return label ? `${label} restaurant` : "Restaurant";
}

function activityLabel(record) {
  const values = [record.type, record.tourism, record.historic, record.leisure, record.natural];
  for (const value of values) {
    if (!value) continue;
    const key = String(value).toLowerCase();
    if (ACTIVITY_LABELS[key]) return ACTIVITY_LABELS[key];
  }
  return record.type ? humanize(record.type) : "Place of interest";
}

export function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function buildAddress(tags) {
  const street = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ");
  return tags["addr:full"] || street || null;
}

function buildArea(tags) {
  return (
    tags["addr:neighbourhood"] ||
    tags["addr:suburb"] ||
    tags["addr:district"] ||
    tags["addr:city"] ||
    tags["addr:town"] ||
    null
  );
}

function normalizeWebsite(value) {
  if (!value) return null;
  const website = String(value).trim();
  if (!website) return null;
  if (/^https?:\/\//i.test(website)) return website;
  return `https://${website}`;
}

function mapUrl(lat, lon) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lon}`)}`;
}

export function formatPlace(record, kind, city) {
  const typeLabel = kind === "restaurant" ? cuisineLabel(record.cuisine) : activityLabel(record);
  const location = record.area || record.address || city.name;
  const noun = kind === "restaurant" ? "restaurant" : "place to visit";
  const description =
    kind === "restaurant"
      ? `${typeLabel} in ${city.name}${record.area ? `, ${record.area}` : ""}.`
      : `${typeLabel} in ${city.name}${record.area ? `, ${record.area}` : ""}.`;

  return {
    id: `${kind}-${record.osmType}-${record.osmId}`,
    kind,
    city: city.name,
    name: record.name,
    typeLabel,
    description,
    address: record.address || null,
    area: record.area || null,
    location,
    lat: Number(record.lat),
    lon: Number(record.lon),
    cuisine: record.cuisine || null,
    openingHours: record.openingHours || null,
    website: normalizeWebsite(record.website),
    phone: record.phone || null,
    image: null,
    images: [],
    mapUrl: mapUrl(record.lat, record.lon),
    sourceUrl: record.sourceUrl || null,
    sourceLabel: kind === "restaurant" ? "OpenStreetMap restaurant record" : "OpenStreetMap place record",
    verifiedAt: record.verifiedAt || null,
    searchText: normalizeText(
      [record.name, record.area, record.address, record.cuisine, typeLabel, noun].join(" ")
    ),
  };
}

export function getFallbackPlaces(city, kind) {
  const source =
    kind === "restaurant" ? restaurantsFallbackByCity[city.slug] : activitiesFallbackByCity[city.slug];
  return (source || []).map((record) => formatPlace(record, kind, city));
}

export function mergePlaces(fallback, live, kind, city) {
  const seen = new Set(fallback.map((place) => normalizeText(place.name)));
  const unique = [];
  for (const record of live) {
    const place = formatPlace(record, kind, city);
    const key = normalizeText(place.name);
    if (!key || seen.has(key) || !Number.isFinite(place.lat) || !Number.isFinite(place.lon)) continue;
    seen.add(key);
    unique.push(place);
  }
  return [...fallback, ...unique];
}

export function sortPlaces(list, sort) {
  const sorted = [...list];
  if (sort === "az") sorted.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "za") sorted.sort((a, b) => b.name.localeCompare(a.name));
  if (sort === "area") {
    sorted.sort((a, b) => (a.area || a.location || "").localeCompare(b.area || b.location || ""));
  }
  return sorted;
}

function buildQuery(city, kind) {
  const [lat, lon] = city.coords;
  const around = kind === "restaurant" ? 12000 : 18000;
  const body =
    kind === "restaurant"
      ? `nwr["amenity"="restaurant"]["name"](around:${around},${lat},${lon});`
      : [
          `nwr["tourism"~"^(attraction|museum|gallery|viewpoint|zoo|theme_park)$"]["name"](around:${around},${lat},${lon});`,
          `nwr["historic"]["name"](around:${around},${lat},${lon});`,
          `nwr["leisure"~"^(park|garden|nature_reserve)$"]["name"](around:${around},${lat},${lon});`,
          `nwr["natural"~"^(beach|spring|cape|peak)$"]["name"](around:${around},${lat},${lon});`,
          `nwr["amenity"~"^(theatre|arts_centre|place_of_worship)$"]["name"](around:${around},${lat},${lon});`,
        ].join("\n  ");
  return `[out:json][timeout:20];\n(\n  ${body}\n);\nout center 90;`;
}

async function requestOverpass(query) {
  let lastError;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Overpass ${response.status}`);
      const json = await response.json();
      return Array.isArray(json.elements) ? json.elements : [];
    } catch (error) {
      lastError = error;
    } finally {
      window.clearTimeout(timer);
    }
  }
  throw lastError || new Error("Overpass unavailable");
}

function elementToRecord(element, kind) {
  const tags = element.tags || {};
  const center = element.center || { lat: element.lat, lon: element.lon };
  if (!tags.name || !Number.isFinite(Number(center.lat)) || !Number.isFinite(Number(center.lon))) {
    return null;
  }
  if (kind === "restaurant" && tags.amenity !== "restaurant") return null;
  if (
    kind === "activity" &&
    ["pharmacy", "bar", "pub", "hotel", "guest_house", "hostel", "bus_stop"].includes(tags.amenity)
  ) {
    return null;
  }

  return {
    osmType: element.type,
    osmId: element.id,
    name: tags.name,
    address: buildAddress(tags),
    area: buildArea(tags),
    lat: Number(center.lat),
    lon: Number(center.lon),
    type: tags.tourism || tags.historic || tags.leisure || tags.natural || tags.amenity || null,
    osmCategory: tags.tourism || tags.historic || tags.leisure || tags.natural || tags.amenity || null,
    cuisine: tags.cuisine || null,
    openingHours: tags.opening_hours || null,
    website: normalizeWebsite(tags.website || tags["contact:website"]),
    phone: tags.phone || tags["contact:phone"] || null,
    historic: tags.historic || null,
    tourism: tags.tourism || null,
    leisure: tags.leisure || null,
    natural: tags.natural || null,
    sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
    verifiedAt: new Date().toISOString().slice(0, 10),
  };
}

export function getPlaces(city, kind) {
  const key = `${city.slug}:${kind}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.time < CACHE_MS) {
    return Promise.resolve(cached.data);
  }
  if (inflight.has(key)) return inflight.get(key);

  const promise = requestOverpass(buildQuery(city, kind))
    .then((elements) =>
      elements.map((element) => elementToRecord(element, kind)).filter(Boolean)
    )
    .then((data) => {
      cache.set(key, { time: Date.now(), data });
      inflight.delete(key);
      return data;
    })
    .catch((error) => {
      inflight.delete(key);
      throw error;
    });

  inflight.set(key, promise);
  return promise;
}
