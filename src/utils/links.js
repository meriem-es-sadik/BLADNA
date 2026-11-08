export function safeExternalUrl(value) {
  if (!value) return null;
  let raw = String(value).trim().split(/\s+/)[0];
  if (!raw) return null;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(raw)) raw = `https://${raw}`;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.href;
  } catch {
    return null;
  }
}

export function buildMapUrl({ lat, lon, name, city }) {
  const latitude = Number(lat);
  const longitude = Number(lon);
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${latitude},${longitude}`
    )}`;
  }
  const query = [name, city, "Morocco"].filter(Boolean).join(", ");
  if (!query) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function buildOsmUrl({ osmType, osmId }) {
  if (!osmType || !osmId) return null;
  return `https://www.openstreetmap.org/${osmType}/${osmId}`;
}
