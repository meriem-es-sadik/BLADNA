import { hotelsFallbackByCity } from "../data/hotelsFallback";

const CACHE_VERSION = "v4";
const CACHE_TTL = 24 * 60 * 60 * 1000;
const SEARCH_RADIUS = 9000;
const REQUEST_TIMEOUT = 20000;

const DEFAULT_ENDPOINTS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

const CONFIGURED_ENDPOINT = import.meta.env.VITE_OVERPASS_URL?.trim();

const ENDPOINTS = [
  ...(CONFIGURED_ENDPOINT ? [CONFIGURED_ENDPOINT] : []),
  ...DEFAULT_ENDPOINTS,
].filter((url, index, list) => list.indexOf(url) === index);

const TYPE_LABELS = {
  hotel: "Hotel",
  guest_house: "Guesthouse",
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

export function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function buildQuery(city) {
  const [lat, lon] = city.coords;
  return (
    `[out:json][timeout:90];` +
    `(nwr["tourism"~"^(hotel|motel|hostel|guest_house|apartment)$"](around:${SEARCH_RADIUS},${lat},${lon}););` +
    `out center;`
  );
}

function createAbortError() {
  const error = new Error("Aborted");
  error.name = "AbortError";
  return error;
}

async function fetchEndpoint(url, query, signal) {
  const controller = new AbortController();
  let timedOut = false;
  const onAbort = () => controller.abort();
  if (signal) signal.addEventListener("abort", onAbort, { once: true });
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: "data=" + encodeURIComponent(query),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } catch (err) {
    if (signal?.aborted) throw createAbortError();
    if (timedOut) throw new Error("Request timed out");
    throw err;
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener("abort", onAbort);
  }
}

async function runQuery(query, signal) {
  let lastError = null;
  for (const url of ENDPOINTS) {
    if (signal?.aborted) throw createAbortError();
    try {
      return await fetchEndpoint(url, query, signal);
    } catch (err) {
      if (err.name === "AbortError" && signal?.aborted) throw err;
      lastError = err;
    }
  }
  throw lastError || new Error("All data providers failed");
}

function parseStars(value) {
  if (!value) return null;
  const n = Number.parseInt(String(value).replace(/[^0-9]/g, ""), 10);
  return n >= 1 && n <= 5 ? n : null;
}

function parseRating(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number.parseFloat(String(value).replace(",", "."));
  return Number.isFinite(n) && n >= 0 && n <= 5 ? n : null;
}

function safeHttpUrl(value) {
  if (!value) return null;
  let raw = String(value).trim().split(/[\s,]+/)[0];
  if (!raw) return null;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(raw)) raw = "https://" + raw;
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

const TRUSTED_IMAGE_HOSTS = new Set([
  "upload.wikimedia.org",
  "thumb.wikimedia.org",
  "commons.wikimedia.org",
]);

function commonsFileUrl(file, width = 1600) {
  const clean = String(file || "").replace(/^File:/i, "").replace(/\s+/g, "_");
  if (!clean) return null;
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(clean)}?width=${width}`;
}

function commonsFilePage(file) {
  const clean = String(file || "").replace(/^File:/i, "").replace(/\s+/g, "_");
  if (!clean) return null;
  return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(clean).replace(/%2F/g, "/")}`;
}

export function normalizeImage(image) {
  if (!image || typeof image !== "object") return null;
  const url = safeHttpUrl(image.url);
  if (!url) return null;
  let host = "";
  try {
    host = new URL(url).hostname;
  } catch {
    return null;
  }
  if (!TRUSTED_IMAGE_HOSTS.has(host) && image.source !== "google") return null;
  return {
    url,
    credit: image.credit || (image.source === "google" ? "Google" : "Wikimedia Commons"),
    license:
      image.license ||
      (image.source === "google" ? "Google Maps photo" : "See file page"),
    licenseUrl: safeHttpUrl(image.licenseUrl),
    sourceUrl: safeHttpUrl(image.sourceUrl) || url,
    source: image.source || "wikimedia",
    fileName: image.fileName || null,
  };
}

function imagesFromTags(tags) {
  const list = [];
  const seen = new Set();
  const add = (image) => {
    const normalized = normalizeImage(image);
    if (!normalized || seen.has(normalized.url)) return;
    seen.add(normalized.url);
    list.push(normalized);
  };

  const commons = tags.wikimedia_commons;
  if (commons && /^File:/i.test(commons)) {
    add({
      url: commonsFileUrl(commons),
      sourceUrl: commonsFilePage(commons),
      source: "wikimedia",
      fileName: commons.replace(/^File:/i, "").replace(/\s+/g, "_"),
    });
  }

  const candidates = [
    tags.image,
    tags["contact:image"],
    ...Object.keys(tags)
      .filter((key) => /^image:\d+$/i.test(key))
      .sort()
      .map((key) => tags[key]),
  ];
  for (const value of candidates) {
    const direct = safeHttpUrl(value);
    if (!direct) continue;
    add({ url: direct, sourceUrl: direct, source: "wikimedia" });
  }

  return list;
}

function isRiadName(name) {
  return /\b(riad|ryad)\b/i.test(String(name || ""));
}

function labelForType(type, name) {
  if (isRiadName(name) && (type === "hotel" || type === "guest_house")) return "Riad";
  return TYPE_LABELS[type] || "Accommodation";
}

function composeAddress(tags) {
  if (tags["addr:full"]) return tags["addr:full"];
  const parts = [
    [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" "),
    tags["addr:postcode"],
    tags["addr:city"],
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

function composeArea(tags) {
  return (
    tags["addr:suburb"] ||
    tags["addr:quarter"] ||
    tags["addr:neighbourhood"] ||
    tags["addr:district"] ||
    tags["addr:place"] ||
    null
  );
}

function composeAmenities(tags) {
  const list = [];
  for (const [tag, label, test = () => true] of AMENITY_TAGS) {
    const v = tags[tag];
    if (v && v !== "no" && test(v)) list.push(label);
  }
  return list;
}

function finalizeHotel(data, city) {
  const type = data.type || "hotel";
  const typeLabel = labelForType(type, data.name) || data.typeLabel || "Accommodation";
  const area = data.area || null;
  const address = data.address || null;
  const amenities = Array.isArray(data.amenities) ? data.amenities : [];
  const images = [];
  const seen = new Set();
  for (const image of Array.isArray(data.images) ? data.images : []) {
    const normalized = normalizeImage(image);
    if (!normalized || seen.has(normalized.url)) continue;
    seen.add(normalized.url);
    images.push(normalized);
  }
  if (!images.length && data.image) {
    const normalized = normalizeImage({
      url: data.image,
      credit: data.imageCredit,
      license: data.imageLicense,
      licenseUrl: data.imageLicenseUrl,
      sourceUrl: data.imageSourceUrl,
      source: data.imageSource || "wikimedia",
    });
    if (normalized) images.push(normalized);
  }
  const first = images[0] || null;
  const description = `${typeLabel}${data.stars ? ` · ${data.stars}-star` : ""} · ${city.name}${area ? ` · ${area}` : ""}`;
  const searchText = normalizeText(
    [
      data.name,
      typeLabel,
      area,
      address,
      city.name,
      description,
      ...amenities,
    ].join(" ")
  );
  return {
    ...data,
    city: city.name,
    citySlug: city.slug,
    type,
    typeLabel,
    isRiad: typeLabel === "Riad",
    area,
    address,
    amenities,
    images,
    image: first?.url || null,
    imageCredit: first?.credit || null,
    imageLicense: first?.license || null,
    imageLicenseUrl: first?.licenseUrl || null,
    imageSourceUrl: first?.sourceUrl || null,
    description,
    searchText,
  };
}

function toHotel(element, city) {
  const tags = element.tags || {};
  const name = (tags.name || "").trim();
  if (!name) return null;
  const center = element.center || element;
  const lat = Number(center.lat ?? element.lat);
  const lon = Number(center.lon ?? element.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const stars = parseStars(tags.stars);
  const rating = parseRating(tags["customer_rating"] ?? tags.rating);
  const type = tags.tourism || "hotel";
  const area = composeArea(tags);
  const address = composeAddress(tags);
  const amenities = composeAmenities(tags);
  return finalizeHotel(
    {
      id: `${element.type}/${element.id}`,
      osmType: element.type,
      osmId: element.id,
      name,
      type,
      stars,
      rating,
      address,
      area,
      addrCity: tags["addr:city"] || "",
      website: safeHttpUrl(tags.website || tags["contact:website"]),
      phone: (tags.phone || tags["contact:phone"] || "").trim() || null,
      images: imagesFromTags(tags),
      wikidata: tags.wikidata || null,
      wikimediaCommons: tags.wikimedia_commons || null,
      sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
      verifiedAt: null,
      lat,
      lon,
      amenities,
      isFallback: false,
    },
    city
  );
}

export function getFallbackHotels(city) {
  if (!city) return [];
  const records = hotelsFallbackByCity[city.slug] || [];
  return records.map((record) =>
    finalizeHotel(
      {
        id: `${record.osmType}/${record.osmId}`,
        osmType: record.osmType,
        osmId: record.osmId,
        name: record.name,
        type: record.type || "hotel",
        stars: record.stars ?? null,
        rating: null,
        address: record.address || null,
        area: record.area || null,
        addrCity: city.name,
        website: safeHttpUrl(record.website),
        phone: record.phone || null,
        images: record.images || [],
        image: record.image || null,
        imageCredit: record.imageCredit || null,
        imageLicense: record.imageLicense || null,
        imageLicenseUrl: record.imageLicenseUrl || null,
        imageSourceUrl: record.imageSourceUrl || null,
        wikidata: record.wikidata || null,
        wikimediaCommons: record.wikimediaCommons || null,
        sourceUrl: record.sourceUrl || null,
        verifiedAt: record.verifiedAt || null,
        lat: record.lat,
        lon: record.lon,
        amenities: [],
        isFallback: true,
      },
      city
    )
  );
}

export function mergeHotels(fallback, live, city) {
  const byKey = new Map();
  const order = [];
  const keyFor = (hotel) =>
    hotel.osmType && hotel.osmId
      ? `${hotel.osmType}/${hotel.osmId}`
      : normalizeText(hotel.name);

  const add = (hotel) => {
    if (!hotel) return;
    const key = keyFor(hotel);
    if (!byKey.has(key)) order.push(key);
    byKey.set(key, hotel);
  };

  for (const hotel of fallback) add(hotel);

  for (const hotel of live) {
    const key = keyFor(hotel);
    if (!byKey.has(key)) {
      add(finalizeHotel({ ...hotel, isFallback: false }, city));
      continue;
    }
    const base = byKey.get(key);
    byKey.set(
      key,
      finalizeHotel(
        {
          ...base,
          ...hotel,
          type: hotel.type || base.type,
          stars: hotel.stars ?? base.stars,
          rating: hotel.rating ?? base.rating,
          website: hotel.website || base.website,
          phone: hotel.phone || base.phone,
          images: [...(hotel.images || []), ...(base.images || [])],
          wikidata: hotel.wikidata || base.wikidata,
          wikimediaCommons: hotel.wikimediaCommons || base.wikimediaCommons,
          sourceUrl: hotel.sourceUrl || base.sourceUrl,
          verifiedAt: hotel.verifiedAt || base.verifiedAt,
          address: hotel.address || base.address,
          area: hotel.area || base.area,
          amenities: hotel.amenities?.length ? hotel.amenities : base.amenities,
          isFallback: false,
        },
        city
      )
    );
  }

  return order.map((key) => byKey.get(key));
}

function dedupe(hotels) {
  const seen = new Set();
  const out = [];
  for (const h of hotels) {
    const key =
      normalizeText(h.name) + "|" + h.lat.toFixed(3) + "," + h.lon.toFixed(3);
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
    /* quota exceeded, memory cache still active */
  }
}

export async function getHotels(city, signal, options = {}) {
  const { force = false } = options;
  const key = `bladna-hotels:${CACHE_VERSION}:${city.slug}`;

  if (!force) {
    if (memoryCache.has(key)) return memoryCache.get(key);

    const cached = readCache(key);
    if (cached) {
      memoryCache.set(key, cached);
      return cached;
    }

    if (pending.has(key)) return pending.get(key);
  } else {
    memoryCache.delete(key);
    try {
      localStorage.removeItem(key);
    } catch {
      /* storage unavailable */
    }
  }

  const task = (async () => {
    const json = await runQuery(buildQuery(city), signal);
    const elements = Array.isArray(json.elements) ? json.elements : [];
    if (!elements.length && json.remark) {
      throw new Error("Overpass: " + json.remark);
    }
    const cityKey = normalizeText(city.name);
    const hotels = dedupe(
      elements
        .map((el) => toHotel(el, city))
        .filter(Boolean)
        .filter((h) => {
          const c = normalizeText(h.addrCity);
          return !c || c.includes(cityKey);
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
  const byName = (a, b) => a.name.localeCompare(b.name);
  const byCategory = (a, b) =>
    (b.rating ?? -1) - (a.rating ?? -1) ||
    (b.stars ?? -1) - (a.stars ?? -1) ||
    byName(a, b);
  switch (sort) {
    case "rating":
      return list.sort(byCategory);
    case "stars":
      return list.sort((a, b) => (b.stars ?? -1) - (a.stars ?? -1) || byName(a, b));
    case "az":
      return list.sort(byName);
    case "za":
      return list.sort((a, b) => b.name.localeCompare(a.name));
    default:
      return list;
  }
}
