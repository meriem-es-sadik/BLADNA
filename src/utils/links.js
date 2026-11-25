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

export function isValidCoordinates(lat, lon) {
  const latitude = Number(lat);
  const longitude = Number(lon);
  return Number.isFinite(latitude) && Number.isFinite(longitude);
}

export function buildOsmLocationUrl({ lat, lon }) {
  if (!isValidCoordinates(lat, lon)) return null;
  const latitude = Number(lat);
  const longitude = Number(lon);
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`;
}

export function buildOsmEmbedUrl({ lat, lon }) {
  if (!isValidCoordinates(lat, lon)) return null;
  const latitude = Number(lat);
  const longitude = Number(lon);
  const span = 0.0045;
  const bbox = [
    longitude - span,
    latitude - span,
    longitude + span,
    latitude + span,
  ]
    .map((value) => value.toFixed(6))
    .join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox
  )}&layer=mapnik&marker=${latitude}%2C${longitude}`;
}

export function buildOsmDirectionsUrl({ lat, lon }) {
  if (!isValidCoordinates(lat, lon)) return null;
  return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=;${Number(
    lat
  )},${Number(lon)}`;
}

export function buildOsmUrl({ osmType, osmId }) {
  if (!osmType || !osmId) return null;
  return `https://www.openstreetmap.org/${osmType}/${osmId}`;
}

export function safeOsmEntityUrl(value) {
  const url = safeExternalUrl(value);
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/\.$/, "");
    if (host !== "openstreetmap.org" && host !== "www.openstreetmap.org") return null;
    if (!/^\/(node|way|relation)\/\d+\/?$/i.test(parsed.pathname)) return null;
    return url;
  } catch {
    return null;
  }
}

const RESERVATION_PATH =
  /(?:^|\/)(?:book|booking|book-now|reserve|reservation|reservations|ticket|tickets|billet|billets|reserver)(?:\/|$|-)/i;

export function safeReservationUrl(value) {
  const url = safeExternalUrl(value);
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const path = decodeURIComponent(parsed.pathname);
    if (!RESERVATION_PATH.test(path)) return null;
    return url;
  } catch {
    return null;
  }
}

export function resolveReservationUrl(source = {}) {
  const booking = safeBookingUrl(source.bookingUrl);
  if (booking) return booking;
  for (const value of [source.reservationUrl, source.ticketUrl, source.ticketsUrl]) {
    const url = safeReservationUrl(value);
    if (url) return url;
  }
  for (const value of [source.website, source.sourceUrl]) {
    const url = safeReservationUrl(value);
    if (url) return url;
  }
  return null;
}
