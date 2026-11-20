# BLADNA

BLADNA is a frontend-only React/Vite application for discovering Moroccan
destinations, cities, hotels, restaurants, and activities.

## Requirements

- Node.js 20 or newer
- npm

## Install

```powershell
npm install
```

## Environment

```powershell
Copy-Item .env.example .env.local
```

All configuration is public frontend configuration. Never put secrets in
`.env.local`; every `VITE_` value is included in the frontend bundle.

`VITE_OVERPASS_URL` is optional and overrides the public Overpass endpoint used
for live OpenStreetMap data.

## Development

```powershell
npm run dev
```

This starts Vite at `http://localhost:5173`.

## Data sources

The frontend reads live data directly from free public sources:

- OpenStreetMap via public Overpass API endpoints for hotels and places.
- Wikimedia Commons and Wikidata for photos and metadata.

When a public source is unavailable, the application falls back to the bundled
local data under `src/data`. No backend, API keys, or paid services are required.

## Tests

```powershell
node --test "tests/*.test.mjs"
```

## Production build

```powershell
npm run build
```

`npm run preview` serves the built frontend locally.
