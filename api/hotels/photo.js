const PHOTO_NAME = /^places\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+$/;
const ALLOWED_WIDTHS = new Set([400, 800, 1200, 1600]);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    res.status(404).json({ error: "Google Places is not configured" });
    return;
  }

  const name = String(req.query?.name || "");
  if (!PHOTO_NAME.test(name)) {
    res.status(400).json({ error: "Invalid photo name" });
    return;
  }

  const requestedWidth = Number.parseInt(String(req.query?.w || "1600"), 10);
  const width = ALLOWED_WIDTHS.has(requestedWidth) ? requestedWidth : 1600;
  const path = name.split("/").map(encodeURIComponent).join("/");

  let googleRes;
  try {
    googleRes = await fetch(
      `https://places.googleapis.com/v1/${path}/media?maxWidthPx=${width}&key=${encodeURIComponent(apiKey)}`,
      { redirect: "follow" }
    );
  } catch {
    res.status(502).json({ error: "Google photo request failed" });
    return;
  }

  if (!googleRes.ok) {
    res.status(googleRes.status === 404 ? 404 : 502).json({ error: "Photo unavailable" });
    return;
  }

  let buffer;
  try {
    buffer = Buffer.from(await googleRes.arrayBuffer());
  } catch {
    res.status(502).json({ error: "Invalid photo response" });
    return;
  }

  res.setHeader("Content-Type", googleRes.headers.get("content-type") || "image/jpeg");
  res.setHeader("Content-Length", buffer.length);
  res.setHeader("Cache-Control", "public, max-age=86400, immutable");
  res.status(200).send(buffer);
}
