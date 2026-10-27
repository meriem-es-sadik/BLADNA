const CACHE_VERSION = "v1";
const CACHE_TTL = 24 * 60 * 60 * 1000;
const SEARCH_RADIUS = 9000;

const ENDPOINTS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

const TYPE_LABELS = {
  hotel: "Hotel",
  guesthouse: "Guesthouse",
  hostel: "Hostel",
  apartment: "Apartment stay",
  motel: "Motel",
};

const AMENITY_TAGS = [
  ["internet_access", "Wi-Fi", (v) => v !== "no"],
  ["swimming_pool", "Pool", () => true],
  ["sauna", "Sauna", () => true],
  ["wheelchair", "Accessible", (v) => v === "yes" || v === "limited"],
  ["outdoor_seating", "Terrace", () => true],
  ["air_conditioning", "Air conditioning", () => true],
  ["bar", "Bar", () => true],
  ["restaurant", "Restaurant", () => true],
  ["parking", "Parking", (v) => v !== "no"],
];

const memoryCache = new Map();
const pending = new Map();

function buildQuery(city) {
  const [lat, lon] = city.coords;
  return (
    `[out:json][timeout:90];` +
    `(nwr["tourism"~"^(hotel|guesthouse|hostel|apartment|motel)$"](around:${SEARCH_RADIUS},${lat},${lon}););` +
    `out center;`
  );
}

async function runQuery(query, signal) {
  let lastError = null;
  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "data=" + encodeURIComponent(query),
        signal,
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } catch (err) {
      if (err.name === "AbortError") throw err;
      lastError = err;
    }
  }
  throw lastError || new Error("All data providers failed");
}

function parseStars(value) {
  if (!value) return null;
  const n = parseInt(String(value).replace(/[^0-9]/g, "").charAt(0) || "", 10);
  return n >= 1 && n <= 5 ? n : null;
}

function composeAddress(tags) {
  const parts = [
    [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" "),
    tags["addr:postcode"],
    tags["addr:city"],
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

function composeAmenities(tags) {
  const list = [];
  for (const [tag, label, test = () => true] of AMENITY_TAGS) {
    const v = tags[tag];
    if (v && v !== "no" && test(v)) list.push(label);
  }
  return list;
}

function toHotel(element, city) {
  const tags = element.tags || {};
  const name = (tags.name || "").trim();
  if (!name) return null;
  const center = element.center || element;
  const lat = Number(center.lat ?? element.lat);
  const lon = Number(center.lon ?? element.lon);
  const stars = parseStars(tags.stars);
  const typeLabel = TYPE_LABELS[tags.tourism] || "Accommodation";
  const area = tags["addr:suburb"] || tags["addr:quarter"] || tags["addr:neighbourhood"];
  return {
    id: `${element.type}/${element.id}`,
    name,
    city: city.name,
    citySlug: city.slug,
    type: tags.tourism || "hotel",
    typeLabel,
    stars,
    rating: tags["customer_rating"] ? parseFloat(tags["customer_rating"]) : null,
    address: composeAddress(tags),
    addrCity: tags["addr:city"] || "",
    website: tags.website || tags["contact:website"] || null,
    phone: tags.phone || tags["contact:phone"] || null,
    lat,
    lon,
    description: `${typeLabel}${stars ? ` · ${stars}-star` : ""} · ${city.name}${area ? ` · ${area}` : ""}`,
    amenities: composeAmenities(tags),
  };
}

function dedupe(hotels) {
  const seen = new Set();
  const out = [];
  for (const h of hotels) {
    const key =
      h.name.toLowerCase().replace(/\s+/g, " ") +
      "|" +
      h.lat.toFixed(3) +
      "," +
      h.lon.toFixed(3);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(h);
  }
  return out;
}

function readCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.hotels)) return null;
    if (Date.now() - parsed.ts > CACHE_TTL) return null;
    return parsed.hotels;
  } catch {
    return null;
  }
}

function writeCache(key, hotels) {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), hotels }));
  } catch {
    /* quota exceeded — memory cache still active */
  }
}

export async function getHotels(city, signal) {
  const key = `bladna-hotels:${CACHE_VERSION}:${city.slug}`;

  if (memoryCache.has(key)) return memoryCache.get(key);

  const cached = readCache(key);
  if (cached) {
    memoryCache.set(key, cached);
    return cached;
  }

  if (pending.has(key)) return pending.get(key);

  const task = (async () => {
    const json = await runQuery(buildQuery(city), signal);
    const hotels = dedupe(
      (json.elements || [])
        .map((el) => toHotel(el, city))
        .filter(Boolean)
        .filter((h) => {
          const c = h.addrCity.trim().toLowerCase();
          return !c || c.includes(city.name.toLowerCase());
        })
    );
    memoryCache.set(key, hotels);
    writeCache(key, hotels);
    return hotels;
  })().finally(() => pending.delete(key));

  pending.set(key, task);
  return task;
}

export function sortHotels(hotels, sort) {
  const list = [...hotels];
  switch (sort) {
    case "rating":
      return list.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    case "stars":
      return list.sort((a, b) => (b.stars ?? -1) - (a.stars ?? -1));
    case "az":
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case "za":
      return list.sort((a, b) => b.name.localeCompare(a.name));
    default:
      return list;
  }
}
