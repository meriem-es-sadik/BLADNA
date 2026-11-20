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

const BOOKING_HOSTS = new Set(["booking.com", "www.booking.com"]);
const BOOKING_PROPERTY_PATH = /^\/hotel\/[a-z]{2}\/[a-z0-9][a-z0-9.-]*\.html$/i;

export function safeBookingUrl(value) {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw || !/^https:\/\//i.test(raw)) return null;
  if (raw.includes("?") || raw.includes("#") || raw.includes("\\")) return null;
  if (/[\u0000-\u001f\u007f]/.test(raw)) return null;

  let url;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  if (url.protocol !== "https:") return null;
  if (url.username || url.password || url.port) return null;
  if (url.search || url.hash) return null;

  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!BOOKING_HOSTS.has(host)) return null;

  const path = url.pathname;
  if (!BOOKING_PROPERTY_PATH.test(path)) return null;
  if (path.includes("..") || path.includes("//")) return null;
  if (/%2f|%5c|%00/i.test(path)) return null;

  return `https://${host}${path}`;
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
