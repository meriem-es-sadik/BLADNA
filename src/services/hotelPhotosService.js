import { normalizeImage } from "./hotelsService";
import { categoryFallbackPhotos, cityFallbackPhotos } from "../data/fallbackPhotos";

const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const WIKIDATA_API = "https://www.wikidata.org/w/api.php";
const GOOGLE_ENABLED = import.meta.env.VITE_GOOGLE_PLACES_ENABLED === "true";
const MAX_PHOTOS = 12;

const STOP_WORDS = new Set([
  "hotel",
  "hostel",
  "riad",
  "ryad",
  "guest",
  "house",
  "guesthouse",
  "spa",
  "resort",
  "palace",
  "restaurant",
  "cafe",
  "snack",
  "pizzeria",
  "grill",
  "brasserie",
  "bar",
  "chez",
  "the",
  "and",
  "des",
  "les",
  "la",
  "le",
  "du",
  "de",
  "of",
  "el",
  "dar",
  "residence",
  "appart",
  "apartment",
]);

const MAX_CONCURRENT_REQUESTS = 2;

const photoCache = new Map();
const primaryCache = new Map();
const categoryCache = new Map();
const searchCache = new Map();
const metadataCache = new Map();
const missingFiles = new Set();
const wikidataCache = new Map();

let activeRequests = 0;
const requestQueue = [];

function createAbortError() {
  const error = new Error("Aborted");
  error.name = "AbortError";
  return error;
}

function withRequestSlot(task) {
  return new Promise((resolve, reject) => {
    const run = () => {
      activeRequests += 1;
      Promise.resolve()
        .then(task)
        .then(resolve, reject)
        .finally(() => {
          activeRequests -= 1;
          const next = requestQueue.shift();
          if (next) next();
        });
    };
    if (activeRequests < MAX_CONCURRENT_REQUESTS) run();
    else requestQueue.push(run);
  });
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const NON_IMAGE_FILE = /\.(wav|ogg|oga|mp3|flac|webm|ogv|mp4|pdf|djvu)$/i;

function safeDecode(value) {
  const text = String(value || "");
  if (!/%[0-9a-f]{2}/i.test(text)) return text;
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

function canonicalFileName(value) {
  return safeDecode(String(value || ""))
    .replace(/^File:/i, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fileKey(value) {
  return normalize(canonicalFileName(value));
}

function markMissing(fileName) {
  const key = fileKey(fileName);
  if (key) missingFiles.add(key);
}

function isMissing(fileName) {
  const key = fileKey(fileName);
  return key ? missingFiles.has(key) : false;
}

function fileNameFromTitle(title) {
  return canonicalFileName(title);
}

function isImagePage(page) {
  const info = page?.imageinfo?.[0];
  if (!info) return false;
  if (info.mime && !String(info.mime).toLowerCase().startsWith("image/")) return false;
  return !NON_IMAGE_FILE.test(fileNameFromTitle(page.title));
}

function fileNameFromImage(image) {
  for (const source of [image.sourceUrl, image.url]) {
    if (!source) continue;
    try {
      const url = new URL(source);
      const fileMatch = url.pathname.match(/\/wiki\/File:(.+)$/i);
      if (fileMatch) return canonicalFileName(fileMatch[1]);
      const pathMatch = url.pathname.match(/Special:FilePath\/(.+)$/i);
      if (pathMatch) return canonicalFileName(pathMatch[1]);
      if (/(^|\.)wikimedia\.org$/i.test(url.hostname)) {
        const last = url.pathname.split("/").filter(Boolean).pop();
        if (last) return canonicalFileName(last.replace(/^\d+px-/, ""));
      }
    } catch {
      /* not a parseable URL */
    }
  }
  return image.fileName ? canonicalFileName(image.fileName) : null;
}

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

function commonsUrl(params) {
  const url = new URL(COMMONS_API);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  return url.href;
}

async function fetchJson(url, signal) {
  if (signal?.aborted) throw createAbortError();
  return withRequestSlot(async () => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const res = await fetch(url, {
        signal,
        headers: { Accept: "application/json" },
      });
      if (res.status === 429 && attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
        if (signal?.aborted) throw createAbortError();
        continue;
      }
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      if (data?.error) {
        throw new Error(data.error.code || data.error.info || "Wikimedia API error");
      }
      return data;
    }
    throw new Error("HTTP 429");
  });
}

function metadataValue(extmetadata, key) {
  return stripHtml(extmetadata?.[key]?.value);
}

function imageFromPage(page) {
  const info = page?.imageinfo?.[0];
  if (!info || !isImagePage(page)) return null;
  const meta = info.extmetadata || {};
  const fileName = fileNameFromTitle(page.title);
  const url = info.thumburl || info.url;
  return normalizeImage({
    url,
    credit: metadataValue(meta, "Artist") || metadataValue(meta, "Credit") || "Wikimedia Commons",
    license: metadataValue(meta, "LicenseShortName") || "See file page",
    licenseUrl: metadataValue(meta, "LicenseUrl"),
    sourceUrl: info.descriptionurl || commonsFilePage(fileName),
    source: "wikimedia",
    fileName,
  });
}

function imageFromFileName(fileName, metadata) {
  const clean = canonicalFileName(fileName);
  if (!clean || NON_IMAGE_FILE.test(clean)) return null;
  if (isMissing(clean)) return null;
  const info = metadata || metadataCache.get(fileKey(clean));
  if (info) {
    return normalizeImage({
      url: info.url,
      credit: info.credit,
      license: info.license,
      licenseUrl: info.licenseUrl,
      sourceUrl: info.sourceUrl,
      source: "wikimedia",
      fileName: info.fileName || clean,
    });
  }
  return normalizeImage({
    url: commonsFileUrl(clean),
    credit: "Wikimedia Commons",
    license: "See file page",
    sourceUrl: commonsFilePage(clean),
    source: "wikimedia",
    fileName: clean,
  });
}

function pageIsMissing(page) {
  return (
    !page ||
    page.missing !== undefined ||
    page.invalid !== undefined ||
    !isImagePage(page)
  );
}

async function hydrateImage(image, signal) {
  if (!image) return null;
  const fileName = fileNameFromImage(image);
  if (!fileName) return image;
  const key = fileKey(fileName);
  const cached = metadataCache.get(key);
  if (cached) return imageFromFileName(fileName, cached);
  if (missingFiles.has(key)) return null;
  try {
    const json = await fetchJson(
      commonsUrl({
        action: "query",
        titles: `File:${fileName}`,
        prop: "imageinfo",
        iiprop: "url|extmetadata|mime",
        iiurlwidth: "1600",
      }),
      signal
    );
    const page = Object.values(json.query?.pages || {})[0];
    if (pageIsMissing(page)) {
      markMissing(fileName);
      return null;
    }
    const hydrated = imageFromPage(page);
    if (!hydrated) {
      markMissing(fileName);
      return null;
    }
    rememberMetadata(hydrated.fileName || fileName, hydrated);
    return hydrated;
  } catch (error) {
    if (error.name === "AbortError") throw error;
    return image;
  }
}

function significantTokens(value) {
  return normalize(value)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

function isRelevant(fileTitle, description, name) {
  const haystack = normalize(fileTitle + " " + description);
  const tokens = significantTokens(name);
  if (!tokens.length) return true;
  return tokens.some((token) => haystack.includes(token));
}

function entityKind(entity) {
  if (
    entity?.kind === "hotel" ||
    entity?.kind === "restaurant" ||
    entity?.kind === "activity"
  ) {
    return entity.kind;
  }
  const type = normalize(`${entity?.type || ""} ${entity?.typeLabel || ""}`);
  if (/(hotel|hostel|guest house|riad|ryad|resort|apartment|motel|auberge)/.test(type)) {
    return "hotel";
  }
  if (/(restaurant|cafe|brasserie|pizzeria|grill|snack|taverne)/.test(type)) {
    return "restaurant";
  }
  return "activity";
}

function hashString(value) {
  let hash = 0;
  const text = String(value || "");
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

function fallbackPool(kind, citySlug) {
  if (kind === "activity") {
    const cityPool = (cityFallbackPhotos[citySlug] || []).filter((image) =>
      String(image.url || "").startsWith("/")
    );
    if (cityPool.length) return cityPool;
  }
  return categoryFallbackPhotos[kind] || categoryFallbackPhotos.activity;
}

export function getFallbackPhoto(entity) {
  if (!entity) return null;
  const kind = entityKind(entity);
  const citySlug =
    entity.citySlug ||
    normalize(entity.city || entity.cityName || "")
      .replace(/\s+/g, "-")
      .replace(/^-|-$/g, "");
  const pool = fallbackPool(kind, citySlug);
  const seed = `${entity.id || entity.name || ""}:${entity.name || ""}:${citySlug}:${kind}`;
  const image = pool[hashString(seed) % pool.length];
  return {
    ...image,
    source: "illustration",
    isIllustrative: true,
    credit: image.credit || "BLADNA",
    license: image.license || "Illustrative image",
  };
}

function isSearchRelevant(item, name, city, kind = "") {
  const tokens = significantTokens(name);
  if (!tokens.length) return false;
  const title = normalize(item.title);
  const haystack = normalize(item.title + " " + item.description);
  if (!tokens.every((token) => title.includes(token))) return false;
  const cityTokens = significantTokens(city);
  const cityHit = cityTokens.some((token) => haystack.includes(token));
  if (cityTokens.length && !cityHit) return false;
  if (kind === "restaurant") {
    return /(restaurant|cafe|brasserie|bistro|pizzeria|grill|snack|terrace|taverne)/i.test(
      haystack
    );
  }
  if (kind === "hotel") {
    return /(hotel|riad|ryad|hostel|resort|palace|guest|auberge)/i.test(haystack);
  }
  return true;
}

function rememberMetadata(fileName, image) {
  const clean = canonicalFileName(fileName);
  if (!clean) return;
  metadataCache.set(fileKey(clean), {
    url: image.url,
    credit: image.credit,
    license: image.license,
    licenseUrl: image.licenseUrl,
    sourceUrl: image.sourceUrl,
    fileName: clean,
  });
}

async function fetchCategoryFiles(category, signal) {
  const clean = String(category || "").replace(/^Category:/i, "").trim();
  if (!clean) return [];
  const key = normalize(clean);
  if (categoryCache.has(key)) return categoryCache.get(key);
  const task = (async () => {
    const url = commonsUrl({
      action: "query",
      generator: "categorymembers",
      gcmtitle: `Category:${clean}`,
      gcmtype: "file",
      gcmlimit: "8",
      prop: "imageinfo",
      iiprop: "url|extmetadata|mime",
      iiurlwidth: "1600",
    });
    const json = await fetchJson(url, signal);
    const pages = Object.values(json.query?.pages || {});
    const items = [];
    for (const page of pages) {
      const image = imageFromPage(page);
      if (!image) continue;
      const fileName = fileNameFromTitle(page.title);
      items.push({
        image,
        title: page.title,
        description: metadataValue(
          page.imageinfo?.[0]?.extmetadata,
          "ImageDescription"
        ),
      });
      rememberMetadata(fileName, image);
    }
    return { images: items.map((item) => item.image), items };
  })().catch((error) => {
    categoryCache.delete(key);
    throw error;
  });
  categoryCache.set(key, task);
  return task;
}

async function searchCommonsFiles(name, city, signal) {
  const query = [name, city].filter(Boolean).join(" ").trim();
  if (!query) return [];
  const key = normalize(query);
  if (searchCache.has(key)) return searchCache.get(key);
  const task = (async () => {
    const url = commonsUrl({
      action: "query",
      generator: "search",
      gsrsearch: `${query} filetype:bitmap`,
      gsrnamespace: "6",
      gsrlimit: "10",
      prop: "imageinfo",
      iiprop: "url|extmetadata|mime",
      iiurlwidth: "1600",
    });
    const json = await fetchJson(url, signal);
    const pages = Object.values(json.query?.pages || {});
    const items = [];
    for (const page of pages) {
      const image = imageFromPage(page);
      if (!image) continue;
      const fileName = fileNameFromTitle(page.title);
      items.push({
        image,
        title: page.title,
        description: metadataValue(
          page.imageinfo?.[0]?.extmetadata,
          "ImageDescription"
        ),
      });
      rememberMetadata(fileName, image);
    }
    return items;
  })().catch((error) => {
    searchCache.delete(key);
    throw error;
  });
  searchCache.set(key, task);
  return task;
}

async function fetchMetadata(fileNames, signal) {
  const unique = [...new Set(fileNames.map(canonicalFileName).filter(Boolean))].slice(0, 20);
  const missing = unique.filter((name) => {
    const key = fileKey(name);
    return !metadataCache.has(key) && !missingFiles.has(key);
  });
  if (missing.length) {
    const url = commonsUrl({
      action: "query",
      titles: missing.map((name) => `File:${name}`).join("|"),
      prop: "imageinfo",
      iiprop: "url|extmetadata|mime",
      iiurlwidth: "1600",
    });
    const json = await fetchJson(url, signal);
    const seen = new Set();
    for (const page of Object.values(json.query?.pages || {})) {
      const fileName = fileNameFromTitle(page.title);
      seen.add(fileKey(fileName));
      if (pageIsMissing(page)) {
        markMissing(fileName);
        continue;
      }
      const image = imageFromPage(page);
      if (!image) {
        markMissing(fileName);
        continue;
      }
      rememberMetadata(fileName, image);
    }
    for (const name of missing) {
      if (!seen.has(fileKey(name))) markMissing(name);
    }
  }
  return new Map(unique.map((name) => [fileKey(name), metadataCache.get(fileKey(name))]));
}

async function fetchWikidata(wikidataId, signal) {
  const id = String(wikidataId || "").toUpperCase();
  if (!/^Q\d+$/i.test(id)) return null;
  if (wikidataCache.has(id)) return wikidataCache.get(id);
  const task = (async () => {
    const url = new URL(WIKIDATA_API);
    url.searchParams.set("action", "wbgetentities");
    url.searchParams.set("ids", id);
    url.searchParams.set("props", "claims");
    url.searchParams.set("format", "json");
    url.searchParams.set("origin", "*");
    try {
      const json = await fetchJson(url.href, signal);
      return json.entities?.[id]?.claims || null;
    } catch (error) {
      if (error.name === "AbortError") throw error;
      return null;
    }
  })();
  wikidataCache.set(id, task);
  return task.catch((error) => {
    wikidataCache.delete(id);
    throw error;
  });
}

function claimValue(claims, property) {
  const claim = claims?.[property]?.[0];
  return claim?.mainsnak?.datavalue?.value ?? null;
}

function mergeImages(list) {
  const seenUrls = new Set();
  const seenFiles = new Set();
  const seenSources = new Set();
  const out = [];
  for (const image of list) {
    if (!image || !image.url) continue;
    const file = fileNameFromImage(image);
    const fileKeyValue = file ? fileKey(file) : null;
    const sourceKey = String(image.sourceUrl || "").split("#")[0];
    if (seenUrls.has(image.url)) continue;
    if (fileKeyValue && seenFiles.has(fileKeyValue)) continue;
    if (fileKeyValue && sourceKey && seenSources.has(sourceKey)) continue;
    seenUrls.add(image.url);
    if (fileKeyValue) seenFiles.add(fileKeyValue);
    if (fileKeyValue && sourceKey) seenSources.add(sourceKey);
    out.push(image);
    if (out.length >= MAX_PHOTOS) break;
  }
  return out;
}

async function fetchGooglePhotos(entity, signal) {
  if (!GOOGLE_ENABLED) return [];
  try {
    const res = await withRequestSlot(() =>
      fetch("/api/hotels/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: entity.name,
          address: entity.address,
          city: entity.city,
          lat: entity.lat,
          lon: entity.lon,
        }),
        signal,
      })
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!data?.configured || !Array.isArray(data.photos)) return [];
    const placeUrl =
      data.placeUrl ||
      (data.placeId
        ? `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(data.placeId)}`
        : "https://www.google.com/maps");
    const base =
      typeof window !== "undefined" ? window.location.origin : "http://localhost";
    return data.photos
      .map((photo) =>
        normalizeImage({
          url: new URL(photo.url, base).href,
          credit: "Google",
          license: "Google Maps photo",
          sourceUrl: placeUrl,
          source: "google",
        })
      )
      .filter(Boolean);
  } catch (error) {
    if (error.name === "AbortError") throw error;
    return [];
  }
}

function normalizeExistingImages(entity) {
  const images = [];
  const seen = new Set();
  const seenFiles = new Set();
  const add = (image) => {
    const normalized = normalizeImage(image);
    if (!normalized) return;
    const file = fileNameFromImage(normalized);
    const key = file ? fileKey(file) : null;
    if (seen.has(normalized.url) || (key && seenFiles.has(key))) return;
    seen.add(normalized.url);
    if (key) seenFiles.add(key);
    images.push(normalized);
  };
  for (const image of Array.isArray(entity.images) ? entity.images : []) add(image);
  if (!images.length && entity.image) {
    add({
      url: entity.image,
      credit: entity.imageCredit,
      license: entity.imageLicense,
      licenseUrl: entity.imageLicenseUrl,
      sourceUrl: entity.imageSourceUrl,
      source: entity.imageSource || "wikimedia",
    });
  }
  return images;
}

function needsHydration(image) {
  if (!image || image.source !== "wikimedia") return false;
  const file = fileNameFromImage(image);
  if (!file) return false;
  const key = fileKey(file);
  if (metadataCache.has(key) || missingFiles.has(key)) return true;
  if (!image.license || image.license === "See file page" || !image.credit) return true;
  return /Special:FilePath|\/wiki\/File:/i.test(image.url || "");
}

async function hydrateImages(images, signal) {
  const resolved = new Map();
  const pending = [];

  images.forEach((image, index) => {
    if (!image) {
      resolved.set(index, null);
      return;
    }
    if (!needsHydration(image)) {
      resolved.set(index, image);
      return;
    }
    const fileName = fileNameFromImage(image);
    const key = fileKey(fileName);
    const cached = metadataCache.get(key);
    if (cached) {
      resolved.set(index, imageFromFileName(fileName, cached));
      return;
    }
    if (missingFiles.has(key)) {
      resolved.set(index, null);
      return;
    }
    pending.push({ image, index, fileName, key });
  });

  if (pending.length) {
    let fetchOk = true;
    try {
      for (let index = 0; index < pending.length; index += 20) {
        await fetchMetadata(
          pending.slice(index, index + 20).map((item) => item.fileName),
          signal
        );
      }
    } catch (error) {
      if (error.name === "AbortError") throw error;
      fetchOk = false;
    }
    for (const item of pending) {
      const cached = metadataCache.get(item.key);
      if (cached) {
        resolved.set(item.index, imageFromFileName(item.fileName, cached));
      } else if (missingFiles.has(item.key)) {
        resolved.set(item.index, null);
      } else {
        resolved.set(item.index, fetchOk ? null : item.image);
      }
    }
  }

  return images.map((_, index) => resolved.get(index)).filter(Boolean);
}

async function resolvePhotos(entity, signal) {
  const existing = await hydrateImages(normalizeExistingImages(entity), signal);
  const images = [...existing];
  const kind = entityKind(entity);

  if (entity.wikimediaCommons) {
    const commons = entity.wikimediaCommons;
    try {
      if (/^File:/i.test(commons)) {
        const image = await hydrateImage(
          imageFromFileName(commons.replace(/^File:/i, "")),
          signal
        );
        if (image) images.push(image);
      } else if (/^Category:/i.test(commons)) {
        const { images: categoryImages, items } = await fetchCategoryFiles(commons, signal);
        const relevant = items
          .filter((item) => isRelevant(item.title, item.description, entity.name))
          .map((item) => item.image);
        images.push(...(relevant.length ? relevant : categoryImages));
      }
    } catch (error) {
      if (error.name === "AbortError") throw error;
    }
  }

  if (entity.wikidata) {
    try {
      const claims = await fetchWikidata(entity.wikidata, signal);
      if (claims) {
        const p18 = claimValue(claims, "P18");
        if (p18) {
          const image = await hydrateImage(imageFromFileName(p18), signal);
          if (image) images.push(image);
        }
        const p373 = claimValue(claims, "P373");
        if (p373 && mergeImages(images).length < 2) {
          const { items } = await fetchCategoryFiles(`Category:${p373}`, signal);
          images.push(
            ...items
              .filter((item) => isRelevant(item.title, item.description, entity.name))
              .map((item) => item.image)
              .slice(0, 6)
          );
        }
      }
    } catch (error) {
      if (error.name === "AbortError") throw error;
    }
  }

  if (mergeImages(images).length < 3 && entity.name && entity.city) {
    try {
      const items = await searchCommonsFiles(entity.name, entity.city, signal);
      images.push(
        ...items
          .filter((item) => isSearchRelevant(item, entity.name, entity.city, kind))
          .map((item) => item.image)
      );
    } catch (error) {
      if (error.name === "AbortError") throw error;
    }
  }

  const added = await hydrateImages(images.slice(existing.length), signal);
  const hydrated = [...existing, ...added];
  hydrated.push(...(await fetchGooglePhotos(entity, signal)));
  const merged = mergeImages(hydrated);
  return merged.length ? merged : [getFallbackPhoto(entity)];
}

async function resolvePrimary(entity, signal) {
  const existing = normalizeExistingImages(entity);
  if (existing.length) return existing[0];
  const kind = entityKind(entity);

  const commons = entity.wikimediaCommons;
  if (commons) {
    try {
      if (/^File:/i.test(commons)) {
        const image = await hydrateImage(
          imageFromFileName(commons.replace(/^File:/i, "")),
          signal
        );
        if (image) return image;
      } else if (/^Category:/i.test(commons)) {
        const { images, items } = await fetchCategoryFiles(commons, signal);
        const relevant = items
          .filter((item) => isRelevant(item.title, item.description, entity.name))
          .map((item) => item.image);
        const pool = relevant.length ? relevant : images;
        if (pool.length) return pool[0];
      }
    } catch (error) {
      if (error.name === "AbortError") throw error;
    }
  }

  if (entity.wikidata) {
    try {
      const claims = await fetchWikidata(entity.wikidata, signal);
      if (claims) {
        const p18 = claimValue(claims, "P18");
        if (p18) {
          const image = await hydrateImage(imageFromFileName(p18), signal);
          if (image) return image;
        }
        const p373 = claimValue(claims, "P373");
        if (p373) {
          const { images, items } = await fetchCategoryFiles(`Category:${p373}`, signal);
          const relevant = items
            .filter((item) => isRelevant(item.title, item.description, entity.name))
            .map((item) => item.image);
          const pool = relevant.length ? relevant : images;
          if (pool.length) return pool[0];
        }
      }
    } catch (error) {
      if (error.name === "AbortError") throw error;
    }
  }

  if (entity.name && entity.city) {
    try {
      const items = await searchCommonsFiles(entity.name, entity.city, signal);
      const match = items.find((item) =>
        isSearchRelevant(item, entity.name, entity.city, kind)
      );
      if (match) return match.image;
    } catch (error) {
      if (error.name === "AbortError") throw error;
    }
  }

  if (GOOGLE_ENABLED) {
    const photos = await fetchGooglePhotos(entity, signal);
    if (photos.length) return photos[0];
  }

  return getFallbackPhoto(entity);
}

function photoKey(entity) {
  const id =
    entity.id || `${entity.citySlug || entity.city || ""}:${normalize(entity.name)}`;
  return `${entityKind(entity)}:${id}:${entity.image || ""}:${entity.wikimediaCommons || ""}:${entity.wikidata || ""}`;
}

async function getPhotos(entity, signal) {
  if (!entity) return [];
  const key = photoKey(entity);
  if (photoCache.has(key)) return photoCache.get(key);
  const task = resolvePhotos(entity, signal).catch((error) => {
    photoCache.delete(key);
    throw error;
  });
  photoCache.set(key, task);
  return task;
}

export async function getHotelPhotos(hotel, signal) {
  return getPhotos(hotel, signal);
}

export async function getPlacePhotos(place, signal) {
  return getPhotos(place, signal);
}

export async function getPrimaryPhoto(entity, signal) {
  if (!entity) return null;
  const key = photoKey(entity);
  if (primaryCache.has(key)) return primaryCache.get(key);
  const task = resolvePrimary(entity, signal).catch((error) => {
    primaryCache.delete(key);
    throw error;
  });
  primaryCache.set(key, task);
  return task;
}
