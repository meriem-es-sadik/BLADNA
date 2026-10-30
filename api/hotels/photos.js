const MOROCCO_BOUNDS = {
  minLat: 20,
  maxLat: 36.5,
  minLon: -18,
  maxLon: -0.5,
};

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function distanceMeters(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function inMorocco(lat, lon) {
  return (
    lat >= MOROCCO_BOUNDS.minLat &&
    lat <= MOROCCO_BOUNDS.maxLat &&
    lon >= MOROCCO_BOUNDS.minLon &&
    lon <= MOROCCO_BOUNDS.maxLon
  );
}

function send(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.send(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    send(res, 405, { configured: false, photos: [], error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    send(res, 200, { configured: false, photos: [] });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      send(res, 400, { configured: true, photos: [], error: "Invalid JSON" });
      return;
    }
  }
  body = body || {};

  const name = String(body.name || "").trim().slice(0, 160);
  const address = String(body.address || "").trim().slice(0, 240);
  const city = String(body.city || "").trim().slice(0, 80);
  const lat = Number(body.lat);
  const lon = Number(body.lon);

  if (!name || !Number.isFinite(lat) || !Number.isFinite(lon) || !inMorocco(lat, lon)) {
    send(res, 400, { configured: true, photos: [], error: "Invalid hotel details" });
    return;
  }

  const textQuery = [name, address, city, "Morocco"]
    .filter(Boolean)
    .join(", ")
    .slice(0, 400);

  let googleRes;
  try {
    googleRes = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.photos",
      },
      body: JSON.stringify({
        textQuery,
        maxResultCount: 1,
        locationBias: {
          circle: {
            center: { latitude: lat, longitude: lon },
            radius: 1000,
          },
        },
      }),
    });
  } catch {
    send(res, 502, { configured: true, photos: [], error: "Google request failed" });
    return;
  }

  if (!googleRes.ok) {
    send(res, 502, {
      configured: true,
      photos: [],
      error: "Google Places request failed",
    });
    return;
  }

  let data;
  try {
    data = await googleRes.json();
  } catch {
    send(res, 502, { configured: true, photos: [], error: "Invalid Google response" });
    return;
  }

  const place = Array.isArray(data?.places) ? data.places[0] : null;
  if (!place?.id || !place.location) {
    send(res, 200, { configured: true, photos: [] });
    return;
  }

  const displayName = String(place.displayName?.text || "").trim();
  const placeLat = Number(place.location.latitude);
  const placeLon = Number(place.location.longitude);
  const distance =
    Number.isFinite(placeLat) && Number.isFinite(placeLon)
      ? distanceMeters(lat, lon, placeLat, placeLon)
      : Infinity;
  const queryName = normalize(name);
  const placeName = normalize(displayName);
  const nameMatches =
    Boolean(queryName && placeName) &&
    (placeName.includes(queryName) ||
      queryName.includes(placeName) ||
      queryName.split(" ").some((token) => token.length >= 4 && placeName.includes(token)));

  if (distance > 800 || !nameMatches) {
    send(res, 200, { configured: true, photos: [] });
    return;
  }

  const photos = (Array.isArray(place.photos) ? place.photos : [])
    .slice(0, 6)
    .filter((photo) => typeof photo?.name === "string")
    .map((photo) => ({
      name: photo.name,
      width: photo.widthPx || null,
      height: photo.heightPx || null,
      url: `/api/hotels/photo?name=${encodeURIComponent(photo.name)}&w=1600`,
    }));

  send(res, 200, {
    configured: true,
    placeId: place.id,
    placeName: displayName,
    placeUrl: `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(place.id)}`,
    photos,
  });
}
