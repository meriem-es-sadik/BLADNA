import { normalizeImage } from "./hotelsService";

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
  "the",
  "and",
  "des",
  "les",
  "dar",
  "residence",
  "appart",
  "apartment",
]);

const photoCache = new Map();
const categoryCache = new Map();
const metadataCache = new Map();

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

function fileNameFromTitle(title) {
  return String(title || "")
    .replace(/^File:/i, "")
    .replace(/_/g, " ")
    .trim();
}

function fileNameFromImage(image) {
  if (image.fileName) return image.fileName;
  const source = image.sourceUrl || image.url || "";
  try {
    const url = new URL(source);
    const fileMatch = url.pathname.match(/\/wiki\/File:(.+)$/i);
    if (fileMatch) return decodeURIComponent(fileMatch[1]).replace(/_/g, " ");
    const pathMatch = url.pathname.match(/Special:FilePath\/(.+)$/i);
    if (pathMatch) return decodeURIComponent(pathMatch[1]).replace(/_/g, " ");
    if (/wikimedia\.org$/i.test(url.hostname) || /\.wikimedia\.org$/i.test(url.hostname)) {
      const last = url.pathname.split("/").filter(Boolean).pop();
      if (last) return decodeURIComponent(last).replace(/^\d+px-/, "").replace(/_/g, " ");
    }
  } catch {
    /* not a parseable URL */
  }
  return null;
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
  const res = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

function metadataValue(extmetadata, key) {
  return stripHtml(extmetadata?.[key]?.value);
}

function imageFromPage(page) {
  const info = page?.imageinfo?.[0];
  if (!info) return null;
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
  const clean = fileNameFromTitle(fileName);
  if (!clean) return null;
  const info = metadata || metadataCache.get(normalize(clean));
  if (info) {
    return normalizeImage({
      url: info.url,
      credit: info.credit,
      license: info.license,
      licenseUrl: info.licenseUrl,
      sourceUrl: info.sourceUrl,
      source: "wikimedia",
      fileName: info.fileName,
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

function isRelevant(fileTitle, description, hotelName) {
  const haystack = normalize(fileTitle + " " + description);
  const tokens = normalize(hotelName)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
  if (!tokens.length) return true;
  return tokens.some((token) => haystack.includes(token));
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
      iiprop: "url|extmetadata",
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
      metadataCache.set(normalize(fileName), {
        url: image.url,
        credit: image.credit,
        license: image.license,
        licenseUrl: image.licenseUrl,
        sourceUrl: image.sourceUrl,
        fileName,
      });
    }
    return { images: items.map((item) => item.image), items };
  })().catch((error) => {
    categoryCache.delete(key);
    throw error;
  });
  categoryCache.set(key, task);
  return task;
}

async function fetchMetadata(fileNames, signal) {
  const unique = [...new Set(fileNames.map(fileNameFromTitle).filter(Boolean))].slice(0, 20);
  const missing = unique.filter((name) => !metadataCache.has(normalize(name)));
  if (missing.length) {
    const url = commonsUrl({
      action: "query",
      titles: missing.map((name) => `File:${name}`).join("|"),
      prop: "imageinfo",
      iiprop: "url|extmetadata",
      iiurlwidth: "1600",
    });
    try {
      const json = await fetchJson(url, signal);
      for (const page of Object.values(json.query?.pages || {})) {
        if (!page.imageinfo?.[0]) continue;
        const fileName = fileNameFromTitle(page.title);
        metadataCache.set(normalize(fileName), {
          url: page.imageinfo[0].thumburl || page.imageinfo[0].url,
          credit:
            metadataValue(page.imageinfo[0].extmetadata, "Artist") ||
            metadataValue(page.imageinfo[0].extmetadata, "Credit") ||
            "Wikimedia Commons",
          license:
            metadataValue(page.imageinfo[0].extmetadata, "LicenseShortName") ||
            "See file page",
          licenseUrl: metadataValue(page.imageinfo[0].extmetadata, "LicenseUrl"),
          sourceUrl:
            page.imageinfo[0].descriptionurl || commonsFilePage(fileName),
          fileName,
        });
      }
    } catch (error) {
      if (error.name === "AbortError") throw error;
    }
  }
  return new Map(unique.map((name) => [normalize(name), metadataCache.get(normalize(name))]));
}

async function fetchWikidata(wikidataId, signal) {
  if (!/^Q\d+$/i.test(String(wikidataId || ""))) return null;
  const url = new URL(WIKIDATA_API);
  url.searchParams.set("action", "wbgetentities");
  url.searchParams.set("ids", wikidataId);
  url.searchParams.set("props", "claims");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  try {
    const json = await fetchJson(url.href, signal);
    return json.entities?.[wikidataId]?.claims || null;
  } catch (error) {
    if (error.name === "AbortError") throw error;
    return null;
  }
}

function claimValue(claims, property) {
  const claim = claims?.[property]?.[0];
  return claim?.mainsnak?.datavalue?.value ?? null;
}

function mergeImages(list) {
  const seenUrls = new Set();
  const seenFiles = new Set();
  const out = [];
  for (const image of list) {
    if (!image) continue;
    const file = image.fileName ? normalize(fileNameFromTitle(image.fileName)) : null;
    if (seenUrls.has(image.url) || (file && seenFiles.has(file))) continue;
    seenUrls.add(image.url);
    if (file) seenFiles.add(file);
    out.push(image);
    if (out.length >= MAX_PHOTOS) break;
  }
  return out;
}

async function fetchGooglePhotos(hotel, signal) {
  if (!GOOGLE_ENABLED) return [];
  try {
    const res = await fetch("/api/hotels/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name: hotel.name,
        address: hotel.address,
        city: hotel.city,
        lat: hotel.lat,
        lon: hotel.lon,
      }),
      signal,
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data?.configured || !Array.isArray(data.photos)) return [];
    const placeUrl =
      data.placeUrl ||
      (data.placeId
        ? `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(data.placeId)}`
        : "https://www.google.com/maps");
    return data.photos
      .map((photo) =>
        normalizeImage({
          url: new URL(photo.url, window.location.origin).href,
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

async function resolvePhotos(hotel, signal) {
  const images = [...(hotel.images || [])];

  if (hotel.wikimediaCommons) {
    const commons = hotel.wikimediaCommons;
    try {
      if (/^File:/i.test(commons)) {
        images.push(imageFromFileName(commons.replace(/^File:/i, "")));
      } else if (/^Category:/i.test(commons)) {
        const { images: categoryImages, items } = await fetchCategoryFiles(commons, signal);
        const relevant = items
          .filter((item) => isRelevant(item.title, item.description, hotel.name))
          .map((item) => item.image);
        images.push(...(relevant.length ? relevant : categoryImages));
      }
    } catch (error) {
      if (error.name === "AbortError") throw error;
    }
  }

  if (hotel.wikidata) {
    try {
      const claims = await fetchWikidata(hotel.wikidata, signal);
      if (claims) {
        const p18 = claimValue(claims, "P18");
        if (p18) images.push(imageFromFileName(p18));
        const p373 = claimValue(claims, "P373");
        if (p373 && images.length < 2) {
          const { items } = await fetchCategoryFiles(`Category:${p373}`, signal);
          images.push(
            ...items
              .filter((item) => isRelevant(item.title, item.description, hotel.name))
              .map((item) => item.image)
              .slice(0, 6)
          );
        }
      }
    } catch (error) {
      if (error.name === "AbortError") throw error;
    }
  }

  const needMetadata = images.filter(
    (image) =>
      image?.source === "wikimedia" &&
      (!image.license || image.license === "See file page") &&
      fileNameFromImage(image)
  );
  if (needMetadata.length) {
    const fileNames = needMetadata.map(fileNameFromImage);
    const metadata = await fetchMetadata(fileNames, signal);
    for (const image of needMetadata) {
      const info = metadata.get(normalize(fileNameFromImage(image)));
      if (!info) continue;
      image.url = info.url;
      image.credit = info.credit;
      image.license = info.license;
      image.licenseUrl = info.licenseUrl;
      image.sourceUrl = info.sourceUrl;
      image.fileName = info.fileName;
    }
  }

  images.push(...(await fetchGooglePhotos(hotel, signal)));
  return mergeImages(images);
}

export async function getHotelPhotos(hotel, signal) {
  if (!hotel) return [];
  const key =
    hotel.id || `${hotel.citySlug || hotel.city || ""}:${normalize(hotel.name)}`;
  if (photoCache.has(key)) return photoCache.get(key);
  const task = resolvePhotos(hotel, signal).catch((error) => {
    photoCache.delete(key);
    throw error;
  });
  photoCache.set(key, task);
  return task;
}
