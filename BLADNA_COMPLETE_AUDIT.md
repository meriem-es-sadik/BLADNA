# BLADNA — Complete Static Audit

**Audit date:** 2026-11-12  
**Project:** `discover-morocco` (BLADNA Moroccan tourism website)  
**Project root:** `C:\Users\hp\OneDrive\Desktop\projet de fin`  
**Scope:** Read-only static review of the React/Vite application, data files, serverless API, deployment configuration, test suite, and bundled assets.  
**Audit type:** Manual code/data review, static contrast calculation, build/test verification, and PowerShell/Node data audits. No browser, mobile, network, or database runtime testing was performed.

## Executive Summary

BLADNA has a coherent visual identity, a working three-language UI shell, a resilient fallback-data strategy, and a passing static test suite. The build succeeds and the core city/hotel/restaurant/activity journeys are present.

The largest gaps are not build failures. They are product-completeness and trust issues:

1. Destination cards on `/destinations` are not links, and four cards sit in a five-column desktop grid.
2. Home and Destinations have no primary navigation or language switcher.
3. The interface is translated, but most destination/POI/guide content remains English, and Arabic search is incomplete.
4. The site is a client-only SPA with generic metadata, no sitemap/robots/OG/canonical data, a soft-404 route, and English-only crawler output.
5. City heroes can be empty. A likely-invalid Wikimedia thumbnail host puts seven city heroes at risk.
6. Bundled POI coverage is uneven: 4 of 16 cities have no fallback POIs, and most hotels have no real image.
7. Keyboard/focus accessibility needs work in dialogs, details views, route changes, and the image carousel.
8. Several local images have no recorded credit/license while the footer claims credits are shown.
9. Google Places endpoints have no authentication or rate limiting, creating cost-abuse risk if enabled.
10. There is no ErrorBoundary, no CI, no lint/typecheck script, and no automated component/E2E coverage.

No critical authentication bypass, exposed server secret, or hardcoded credential was found in the reviewed source. The Supabase migration is not applied and is not used by the running application.

## Severity Definitions

- **High:** Breaks a primary user journey, materially harms discovery/SEO/accessibility, creates likely broken visuals, or creates material cost/legal risk.
- **Medium:** Degrades usability, data quality, reliability, or maintainability; should be scheduled soon.
- **Low:** Polish, consistency, documentation, or edge-case issues.

## Corrected Assumptions

These were checked and should not be treated as defects:

- `hotels.matching` is valid. English uses `{count} hotel{plural}`; French and Arabic intentionally omit `{plural}`. All other translation placeholders match.
- `DestinationCard` already supports a `to` prop and a `Link`; the bug is that `Destinations.jsx` does not pass one.
- `public/img/fallbacks/*.jpg` exists: 9 JPGs, approximately 1.7 MB total.
- `page-fit` is only applied to Destinations. The absence of `page-fit` on Cities is not a bug by itself.
- No duplicate OSM IDs were found in fallback data. The duplicate problem is multiple OSM records representing the same real property.
- No hardcoded secrets were found in the reviewed source.
- `thumb.wikimedia.org` is not proven invalid by a network check in this audit; it is flagged as **requires verification** because the canonical Wikimedia thumbnail host is normally `upload.wikimedia.org`.

## High-Severity Findings

### H1. Destinations cards are non-interactive, and the grid expects five cards but receives four

**Evidence**

- `src/pages/Destinations.jsx:82` uses `lg:grid-cols-5`.
- `src/pages/Destinations.jsx:89` renders `<DestinationCard city={city} />` without `to` or `onSelect`.
- `src/components/DestinationCard.jsx:32-48` renders a `<Link>` only when `to` exists; otherwise it renders a static `<div>`.
- `src/data/destinations.js:1-37` contains four destinations: Casablanca, Ifrane, Chefchaouen, Rabat.
- The cards still show hover lift/zoom styling, implying they are clickable.

**Impact**

- The primary destination-discovery page has no direct path from a destination card to its city page.
- Users must use the separate “Choose Your Destination” CTA and then find the city again.
- The desktop grid leaves an empty fifth column, producing an unbalanced layout.
- Search result and SEO internal linking value is lost.

**Recommendation**

- Pass `to={`/cities/${city.id}`}` from Destinations to each card, or make the cards explicitly non-interactive and remove hover affordances.
- Decide whether the design is four or five destinations; change the grid to four columns or add the missing destination.
- Add an automated component test asserting destination cards are links.

### H2. Home and Destinations lack primary navigation and language switching

**Evidence**

- `src/pages/Home.jsx:5-18` renders only `Background`, `Logo`, and `HeroCard`.
- `src/components/HeroCard.jsx:30-36` provides one CTA to `/destinations`.
- `src/pages/Destinations.jsx:57-104` provides only a logo link to `/` and a CTA to `/cities`.
- `src/components/SiteNav.jsx` contains the primary nav, search, and `LanguageSwitcher`, but Home and Destinations do not import it.
- `src/i18n/LanguageContext.jsx:7-16` defaults to English unless a stored language exists; there is no browser-language detection.
- `index.html:2` starts as `lang="en"` and `dir="ltr"`.

**Impact**

- Users landing on Home or Destinations cannot switch language at the point of first impression.
- French- and Arabic-preferring visitors see English by default and must navigate to another page to change it.
- Home has no direct visible route to Cities except through Destinations.
- The product feels like two different applications: a marketing shell on Home/Destinations and a full application on Cities/CityPage.

**Recommendation**

- Add a shared top navigation or a compact header action group to Home and Destinations.
- Include the existing `LanguageSwitcher` on both pages.
- Detect `navigator.language` on first visit and fall back to English only when unsupported, while preserving explicit user choice.
- Consider a persistent locale in the URL for shareable/translated pages.

### H3. Content internationalization is incomplete; Arabic search is inconsistent

**Evidence**

- UI strings are translated in `src/i18n/translations.js`, but content remains English:
  - `src/data/cityGuides.js` guide titles, kickers, taglines, descriptions, image alt text, and credits.
  - `src/data/destinations.js` destination image alt text.
  - `src/data/cities.js` city names and aliases; no Arabic city aliases were found.
  - `src/services/hotelsService.js:22-39` type labels and amenity labels are English.
  - `src/services/hotelsService.js:291` generated hotel descriptions are English.
  - `src/services/placesService.js:143` generated restaurant/activity descriptions are English.
  - `PlaceDetails` displays raw OSM `openingHours` and `cuisine` values in all locales.
- `src/components/SearchOverlay.jsx:11-18` supports Arabic in its normalizer, but city haystacks at lines 40-49 contain only Latin city names/aliases plus region names. Arabic city aliases are absent, so Arabic searches match region names and can return unrelated cities.
- `src/services/placesService.js:102-108` strips everything outside `[a-z0-9]`; an Arabic place query becomes empty, so the POI filter is effectively skipped and shows all places.
- Fallback hotel search text is effectively Latin-only, so Arabic hotel queries return no matches against the bundled hotels; live hotels would only match if their OSM name itself contains Arabic.
- English content inside an Arabic page is not marked with `lang="en"`.

**Impact**

- French and Arabic users see a translated frame around English content.
- Arabic users get inconsistent search: some region-level matches in global search, no useful POI/hotel search, and English descriptions.
- Screen readers may pronounce English text with Arabic phonetics.
- The site cannot credibly claim a multilingual experience.

**Recommendation**

- Decide the language strategy: either translate all editorial/POI content or mark English content explicitly and state that it is English.
- Add Arabic/French city aliases and localized city names.
- Localize type labels, amenities, cuisines, generated descriptions, opening-hours presentation, and guide content.
- Normalize Arabic in all search paths or use a locale-aware normalization helper.
- Add `lang` attributes around mixed-language content.

### H4. SEO and social sharing are structurally weak

**Evidence**

- `src/App.jsx:36` maps `*` to `Home`; unknown URLs render the homepage with HTTP 200, creating soft-404s.
- `src/i18n/LanguageContext.jsx:30-41` always sets `document.title` to the single generic `meta.title`.
- `index.html:7-11` contains one static English description and title for every route.
- No `robots.txt`, `sitemap.xml`, canonical link, Open Graph tags, Twitter card tags, `hreflang`, or structured data exist in `public/` or `index.html`.
- The site is a client-rendered Vite SPA; initial HTML contains no city or POI content.
- POI descriptions are repetitive generated strings, and city guides are short English paragraphs.

**Impact**

- Search engines and social crawlers see the same generic shell for every URL.
- City pages have no unique title/description/image in the initial document.
- Invalid URLs can be indexed as duplicate homepage content.
- Link previews on social platforms lack destination imagery and titles.
- Thin, repetitive content limits organic discovery for a tourism product.

**Recommendation**

- Add a real NotFound route/page and return an appropriate status at the edge where possible.
- Add per-route title, description, canonical, OG/Twitter metadata, and structured data.
- Add `robots.txt`, `sitemap.xml`, and language alternates.
- Consider prerendering/SSG for city and destination routes.
- Expand unique editorial content before investing in aggressive SEO.

### H5. City heroes can render empty, and the likely-broken thumbnail host puts seven cities at risk

**Evidence**

- `src/components/city/CityHero.jsx:10` allows `images` to be an empty array.
- With zero images, the component still renders the hero container and overlays but no image. The screen-reader status at lines 247-253 becomes “Photo 1 of 0”.
- `src/data/cityGuides.js` has 47 image entries:
  - 36 use `https://thumb.wikimedia.org/...`
  - 6 use `https://upload.wikimedia.org/...`
  - 5 use local `/img/cities/...`
- The canonical Wikimedia thumbnail host is normally `upload.wikimedia.org`; `thumb.wikimedia.org` requires external DNS/HTTP verification.
- Four cities have `images: []`: Oujda, Béni Mellal, Guelmim, Laâyoune.
- If `thumb.wikimedia.org` is invalid, Marrakech, Essaouira, and Ouarzazate also have no local/upload fallback, producing seven empty heroes.
- Cities with local/upload images would survive, but their carousels may still contain failed slides and show navigation controls for unusable images.
- `CityHero` has no generic placeholder image when every image fails.

**Impact**

- The first visual on a city page can be a large empty dark panel, especially for the four cities without fallback POIs.
- The “Photo 1 of 0” announcement is an accessibility defect.
- Broken image requests create visual jank and unnecessary failed network calls.
- The experience is inconsistent across cities and depends on an unverified external host.

**Recommendation**

- Verify the thumbnail host; if invalid, replace URLs with canonical `upload.wikimedia.org` thumbnail URLs or use `Special:FilePath` with width.
- Add a local city-hero placeholder and use it when the image list is empty or all images fail.
- Do not render the carousel controls/status when there are zero displayable images.
- Add the four missing cities to the local/fallback image set at minimum.
- Add a build-time or runtime check that every guide image URL has an allowed host and non-empty credit/license metadata.

### H6. POI coverage and imagery are uneven

**Evidence**

- Fallback totals: 117 hotels, 123 restaurants, 103 activities = 343 records.
- Fallback data covers 12 cities; Oujda, Béni Mellal, Guelmim, and Laâyoune have zero fallback POIs in all three categories.
- Hotels: 111 of 117 have no image or gallery at all; 114 have no primary image; 101 have no website; 97 have no phone; 10 have no type.
- Restaurants: all 123 have no image; 115 have no website; 106 have no phone.
- Activities: all 103 have no image; 93 have no website; 96 have no phone.
- Only 3 primary image values and 19 distinct image URLs exist across fallback records, including gallery URLs.
- Restaurant cards therefore reuse three generic food illustrations each; activity cards use three generic activity illustrations or one of the five local city images.
- The fallback dates are `2026-10-29`/`2026-10-30`; today is 2026-11-12. Records remain labelled unreviewed/fallback, which is honest, but they are already about two weeks old.

**Impact**

- The four uncovered cities have no bundled offline POI experience and depend entirely on live Overpass.
- Users see repeated stock imagery and incomplete contact/website information.
- A tourism directory with mostly missing hotel imagery feels less trustworthy and less useful.
- Coverage claims can feel stronger than the underlying fallback dataset supports.

**Recommendation**

- Prioritize fallback POIs and at least one local hero image for the four missing cities.
- Add real primary images for a curated set of high-value hotels/restaurants/activities, with verified credit/license metadata.
- Treat missing contact fields as a content backlog; prioritize phone/website completeness for featured listings.
- Show a visible “illustrative image” badge consistently (already partially implemented) and avoid presenting generic imagery as property photography.
- Add data-quality tests for coverage, required fields, and duplicate properties.

### H7. Accessibility needs substantial focus and dialog work

**Evidence**

- No skip-to-content link and no consistent `<main>` landmark across pages. Home has a `<main>`, but Cities, Destinations, and CityPage use generic containers.
- `src/components/SearchOverlay.jsx:163-235` is a modal dialog with no focus trap. Tab can move into the page behind it.
- `src/components/hotels/HotelGallery.jsx:309-399` lightbox has `role="dialog"` and `aria-modal="true"` but no focus trap; Tab can escape to the page.
- Closing hotel details/place details can lose focus because the selected card is unmounted; `HotelDetails` focuses its back button on mount, but does not restore focus to the originating card on close. `PlaceDetails` does not move focus on mount at all.
- Route changes do not move focus to the new page heading or reset scroll.
- Search results have no live region or listbox/`aria-activedescendant` semantics. A screen-reader user typing gets no announcement of result count/active result.
- `CityHero` carousel dots at lines 229-242 are approximately 6 px hit targets, below WCAG target-size expectations.
- `CityHero`’s `aria-live` status announces every automatic slide change, which can be disruptive during autoplay.
- The lightbox does not announce image changes after arrow navigation.
- Clickable `<article>` cards rely on inner “View details” buttons for keyboard access; the card surface itself is not keyboard operable.
- Manual contrast calculation found failures for small text, including:
  - `gold-deep` `#97742e` on ivory `#f8f3e6`: ~3.91:1
  - white on `#c9a24b` in the `PlaceActions` hover state: ~2.40:1
  - `ink/55` on ivory: ~3.29:1
  - `ink/45` on ivory: ~2.53:1
  - `ink/40` on ivory: ~2.24:1

**Impact**

- Keyboard users can become trapped outside modal content or lose their place after closing details.
- Screen-reader users cannot reliably discover search results, image changes, or page changes.
- Low-contrast small labels and CTAs are difficult to read for low-vision users.
- The image carousel’s auto-announcements can make the page noisy for assistive technology.

**Recommendation**

- Add a skip link and consistent `<main>`/landmark structure.
- Implement focus trapping and focus restoration for SearchOverlay and HotelGallery.
- Move focus to the city/page heading on route change, and scroll to top unless restoring history.
- Restore focus to the originating card when details close.
- Add result-count live regions and proper combobox/listbox semantics to search.
- Increase carousel dot hit targets or replace them with larger controls.
- Announce carousel changes only on manual navigation, not autoplay.
- Fix contrast tokens/classes or restrict failing combinations to decorative/large text.
- Add `lang` attributes for mixed-language content and localize alt text.

### H8. Image attribution and licensing are not consistently evidenced

**Evidence**

- `src/components/SiteFooter.jsx:28-30` claims “City photography via Wikimedia Commons with credits shown on each image.”
- `src/data/cityGuides.js` local city images have no `credit` or `license` metadata.
- `src/data/destinations.js` local destination images have no credit/license fields.
- `src/components/Background.jsx` uses a local hero image with no visible attribution metadata.
- Fallback illustration credits are often available only in a `title` tooltip (`HotelCard.jsx:132-157`, `PlaceCard.jsx:99-124`, `HotelGallery.jsx:216-227`), which is not reliably available on touch devices.
- OSM attribution in the footer is text-only; `fallbackAttribution.url` exists in data but the footer does not render a visible link to the OSM copyright/license page.
- If Google Places photos are enabled, the gallery shows a generic “Photos from Google Maps” link and generic “Google” credit; this may not satisfy Google Maps Platform attribution requirements.

**Impact**

- The footer’s claim is factually inaccurate for local hero/destination/city images.
- Reusing Wikimedia/CC images without visible attribution can create license-compliance risk.
- Title-only attribution is weak for legal compliance and inaccessible to touch/screen-reader users.
- Enabling Google photos without reviewing attribution terms adds legal/compliance risk.

**Recommendation**

- Inventory every local image asset and record source, author, license, license URL, and source page.
- Show visible, accessible credits for CC-licensed images, not only tooltips.
- Correct the footer claim or make it true by adding credits.
- Link OSM attribution to the copyright/license page.
- Review Google Maps Platform attribution requirements before enabling Google photos; consider disabling the feature until compliant.

### H9. Google Places API endpoints have no authentication or rate limiting

**Evidence**

- `api/hotels/photos.js:48-204` accepts an arbitrary hotel name/address/city and coordinates within Morocco, then calls Google Places Text Search with the server API key.
- `api/hotels/photo.js:13-78` proxies arbitrary valid Google photo names at selected widths.
- Neither endpoint implements authentication, per-IP rate limiting, request quotas, or abuse protection.
- CORS allowlisting only affects browser behavior; direct HTTP clients are not rejected.
- Google photo fetching is client-triggered per card; there is no server-side cache for search/proxy responses.
- `vercel.json:17-31` applies only minimal security headers to `/api`; there is no CSP/HSTS/permissions policy for the static app.

**Impact**

- If `GOOGLE_PLACES_API_KEY` is configured, third parties can consume quota and generate cost.
- A malicious client can repeatedly call the proxy to burn Google billing/quotas.
- No server-side cache means repeated page views can repeat costly lookups.
- Missing browser security headers reduce defense-in-depth.

**Recommendation**

- Put the Google endpoints behind authentication or a signed server-side token, or add strict per-IP/per-session rate limiting and quotas.
- Cache search/photo responses server-side where terms allow.
- Add `X-Frame-Options`/frame-ancestors, a Content-Security-Policy, Referrer-Policy, and Permissions-Policy for the static app.
- Keep Google photo fetching disabled by default until attribution and abuse controls are ready.

## Medium-Severity Findings

### M1. Navigation state is not URL-addressable, and SPA history/focus behavior is rough

**Evidence**

- `src/pages/CityPage.jsx:16` stores the active category in local state; it is not in the URL.
- `src/components/hotels/HotelsSection.jsx:43` stores the selected hotel in local state.
- `PlacesSection` uses the same local-selection pattern.
- Browser Back from a hotel/place detail exits the city page instead of closing details, because no route change occurred.
- Refreshing a city page always resets to Hotels.
- There is no scroll-to-top or route focus management on navigation.
- `SearchOverlay` region results navigate to `/cities` without a region filter (`SearchOverlay.jsx:55-70`).

**Impact**

- Users cannot share a link to a restaurant tab or a specific hotel/place.
- Refresh loses context.
- Browser Back behaves contrary to expectations in detail views.
- Region search results feel broken because the destination page is unfiltered.

**Recommendation**

- Put category in the URL (`?tab=restaurants`) and selected POI in a route or query parameter.
- Restore focus/scroll on route change.
- Add a region filter or region-specific city view.
- Support closing details with browser Back by using a nested route.

### M2. Overpass queries can produce false city associations or truncation

**Evidence**

- `src/services/hotelsService.js:536-544` filters live hotels by `addr:city` containing the selected city name. A hotel with `addr:city=Tanger` is dropped on the Tangier page (`city.name=Tangier`), and Arabic `addr:city` values do not match Latin city names.
- `src/services/placesService.js:251-264` searches a 12 km radius for restaurants and 18 km for activities, then limits the result to 90 elements with `out center 90`.
- Places are not filtered by administrative city boundary.

**Impact**

- Valid live hotels can disappear because of address spelling differences.
- Nearby towns can appear as POIs for the selected city.
- Dense cities can be truncated without any indication that results are incomplete.
- Users may distrust the data after seeing wrong-city results.

**Recommendation**

- Use OSM administrative boundaries or a geofence, or expand `addr:city` matching with aliases/alternate names.
- Remove the arbitrary 90-result cap or paginate with an explicit “partial results” notice.
- Add tests for Tanja/Tangier, Arabic `addr:city`, and near-boundary coordinates.

### M3. Fallback data contains duplicate properties and generic names

**Evidence**

- In Ifrane, hotel `Chamonix` and hotel `Le Chamonix` are about 16 m apart.
- In Ifrane, hotel `L’Empreinte d’Ifrane` and restaurant `L'Empreinte d'Ifrane` are about 5 m apart; curly vs straight apostrophe produces different names.
- In Dakhla, hotel `Bahia` and restaurant `Bahia` are about 10 m apart.
- Generic fallback names include `Open Area`, `Filmset`, `Night market`, `Grand Hotel`, and `Jardin Public`.
- `mergePlaces` dedupes by normalized name only.
- `mergeHotels` falls back to normalized name when OSM IDs are absent.

**Impact**

- The same property can appear twice under slightly different names.
- Generic names reduce trust and provide little SEO value.
- Name-only deduplication can merge distinct venues or fail to merge the same venue.

**Recommendation**

- Deduplicate by OSM ID where available, then by normalized name plus coordinates/distance and category.
- Curate generic records or remove them from featured listings.
- Add a data-quality test for same-name/near-coordinate pairs across categories.

### M4. No React ErrorBoundary or user-facing recovery for unexpected render errors

**Evidence**

- `src/main.jsx:8-15` mounts the app without an ErrorBoundary.
- There is no fallback UI for a render-time exception in a lazy route or data component.
- Lazy route loading has a Suspense fallback, but no error recovery.

**Impact**

- A single unexpected runtime error can blank the application for the user.
- Production failures are harder to diagnose and recover from.

**Recommendation**

- Add an ErrorBoundary around the route tree with a branded recovery screen and reload/home actions.
- Add lightweight client error reporting if the product will run in production.

### M5. Storage, cache, and retry edge cases

**Evidence**

- `src/pages/Cities.jsx:13-19` calls `sessionStorage.setItem` without `try/catch`; if storage throws, navigation does not occur.
- The stored key `bladna-selected-city` is never read anywhere.
- `HotelsSection.jsx:45` uses a `forceRefresh` ref; once set by Retry, it is not reset. Subsequent city loads bypass the cache (`getHotels` receives `force: true`).
- `HotelsSection` reset does not reset sort, while `PlacesSection` reset does reset sort.
- The city cache and selected city are separate mechanisms; there is no need to write city state to storage merely to navigate.

**Impact**

- Blocked/quota-limited storage can break city selection.
- A single retry can make all later city loads bypass cache and increase network load.
- Reset behavior is inconsistent between categories.

**Recommendation**

- Remove dead storage writes or wrap them safely.
- Reset `forceRefresh.current` after the request starts/completes.
- Make reset semantics consistent.
- Prefer URL/router state over storage for navigation.

### M6. Performance and delivery costs are avoidable

**Evidence**

- `index.html:38` preloads the 91 KB homepage hero image with high priority on every route, including pages that do not use it.
- `index.html:33-36` loads three Google font families and many weights; these are render-blocking external requests.
- Wikimedia/Google images are requested at widths up to 1600 px in card-sized contexts.
- Client-side photo discovery fans out per card; each city with 12 hotels can trigger many Commons/Wikidata/Google requests.
- The main JS bundle is 306.30 kB (95.92 kB gzip); the CityPage chunk is 273.33 kB (56.08 kB gzip).
- 1.7 MB of fallback JPGs and several PNG city images are bundled in `public`.

**Impact**

- The hero image competes with route-specific assets on every page.
- Font loading delays first render on slower Moroccan mobile connections.
- Large remote images increase bandwidth and LCP.
- Per-card photo fan-out can delay card settling and create noisy network traffic.

**Recommendation**

- Remove the global hero preload or scope it to Home.
- Self-host/subset fonts or reduce families/weights.
- Use responsive `srcset`/smaller widths for cards and thumbnails.
- Batch or defer photo lookups and cache results.
- Consider converting local PNGs/JPEGs to WebP/AVIF and compressing.

### M7. Environment example and documentation drift

**Evidence**

- `.env.example` includes `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `WIKIMEDIA_USER_AGENT`, server `OVERPASS_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_BASE_URL`.
- The running client uses `VITE_GOOGLE_PLACES_ENABLED` and `VITE_OVERPASS_URL`; the reviewed API uses `GOOGLE_PLACES_API_KEY` and `ALLOWED_ORIGINS`.
- Several listed variables are not referenced by the running application.
- `README.md` documents API startup but does not document the test command.
- `package.json` has no `test`, `lint`, or `typecheck` script.
- No CI workflow or lint configuration exists.

**Impact**

- Operators may configure variables that have no effect.
- New contributors may not discover the test suite.
- Regressions are not caught automatically.
- Deployment setup is less reproducible than it appears.

**Recommendation**

- Make `.env.example` match actual runtime usage and mark future-phase variables clearly.
- Add scripts for tests/lint/typecheck and document them in README.
- Add a minimal CI workflow that runs tests and a production build.

### M8. Fixed-viewport Destinations layout can clip long content

**Evidence**

- `src/index.css:151-162` applies `height: 100dvh`, `justify-content: center`, and `overflow: hidden` to `.page-fit` at large viewports.
- Destinations uses `.page-fit` and contains five-column expectations with only four cards, plus long French/Arabic copy.
- `page-fit-inner` is constrained to `min(860px, calc(100dvh - 24px))`.

**Impact**

- At certain desktop heights, browser zoom, or longer translations, content can be clipped rather than scrollable.
- The layout is fragile to content growth and localization.

**Recommendation**

- Prefer min-height plus normal scrolling over fixed height with `overflow: hidden`.
- Test at 1024x680, 1280x720, 1440x900, browser zoom 125/200%, and French/Arabic copy.
- Remove the five-column grid mismatch.

### M9. API/health/deployment hygiene

**Evidence**

- `api/health.js:23-29` reports `phase: 2`, although the repository contains Phase 3 schema work.
- Health exposes configuration booleans; no secret values are exposed, but operational state is public.
- CORS allowlist always includes localhost origins, including in production (`api/_lib/config.js:1-6`).
- CORS does not reject disallowed origins server-side; it only omits `Access-Control-Allow-Origin`.
- Static pages have no CSP/HSTS/Permissions-Policy.
- `vercel.json` rewrites all non-API paths to `index.html`, so unknown client routes are HTTP 200.

**Impact**

- Operational metadata can confuse monitoring/debugging.
- Localhost origins in production are unnecessary.
- Missing security headers reduce defense-in-depth.
- Soft-404s hurt SEO and analytics.

**Recommendation**

- Update health phase/version.
- Make localhost origins development-only.
- Consider rejecting disallowed origins for state-changing endpoints.
- Add security headers at the Vercel/edge level.
- Add a proper 404 route and, if possible, correct status handling at the edge.

## Low-Severity Findings and Opportunities

- **Pluralization:** `search.citiesCount` is “{count} cities” even for 1; `hotels.star` is “{count}-star” but French/Arabic use a plural form for 1. Add plural-aware copy where it matters.
- **Retry/caching:** Reset `forceRefresh` after a forced request; avoid permanently disabling cache.
- **Reset consistency:** Hotel reset does not clear sort; Places reset does.
- **Duplicate category navigation:** CityPage renders its own category tabs while SiteNav also renders them at `lg`; both are synced but visually redundant.
- **Details phone edge case:** `PlaceDetails.jsx:106-115` creates `tel:` from any phone string, even one with no digits; hotel details already guards this.
- **Details focus:** `HotelDetails` focuses its back button on mount; `PlaceDetails` does not. Make behavior consistent and restore focus on close.
- **Image alt text:** Destinations and guides use English alt text; localize or mark as English.
- **Attribution visibility:** Fallback illustration credits are tooltip-only on cards; make them visible/accessible.
- **Footer accuracy:** “credits shown on each image” is false for local hero/destination/city images.
- **License file:** No repository `LICENSE` file; clarify code/license terms if the project will be shared.
- **Local asset naming:** `public/img/image .png` contains a space and is referenced as `image%20.png`; rename for maintainability.
- **Preload scope:** Home hero image is preloaded globally.
- **README:** Add test commands, browser support, data-freshness policy, and image-credit policy.
- **No test script:** `package.json` has no `test` script even though 25 Node tests exist.
- **No lint/typecheck:** No ESLint/TypeScript checks in a project of this size.
- **No CI:** Tests/build are not enforced on push/PR.
- **`health` phase:** Stale `phase: 2` label.
- **Fallback source freshness:** `verifiedAt` dates are already ~2 weeks old; define a refresh SLA and surface it consistently.

## Data Quality Appendix

### Fallback POI counts by city

| City | Hotels | Restaurants | Activities |
|---|---:|---:|---:|
| Casablanca | 10 | 10 | 9 |
| Rabat | 10 | 10 | 8 |
| Marrakech | 11 | 10 | 10 |
| Fès | 10 | 10 | 8 |
| Tangier | 11 | 10 | 9 |
| Chefchaouen | 8 | 10 | 8 |
| Ifrane | 8 | 10 | 7 |
| Agadir | 10 | 10 | 9 |
| Essaouira | 10 | 11 | 11 |
| Ouarzazate | 10 | 10 | 8 |
| Meknès | 10 | 10 | 8 |
| Dakhla | 9 | 12 | 8 |
| Oujda | 0 | 0 | 0 |
| Béni Mellal | 0 | 0 | 0 |
| Guelmim | 0 | 0 | 0 |
| Laâyoune | 0 | 0 | 0 |

### City guide image inventory

| City | Images | `thumb.wikimedia` | `upload.wikimedia` | Local |
|---|---:|---:|---:|---:|
| Casablanca | 3 | 2 | 0 | 1 |
| Rabat | 3 | 2 | 0 | 1 |
| Marrakech | 5 | 5 | 0 | 0 |
| Fès | 4 | 3 | 1 | 0 |
| Tangier | 4 | 1 | 2 | 1 |
| Chefchaouen | 5 | 4 | 0 | 1 |
| Ifrane | 5 | 4 | 0 | 1 |
| Agadir | 3 | 2 | 1 | 0 |
| Essaouira | 4 | 4 | 0 | 0 |
| Ouarzazate | 4 | 4 | 0 | 0 |
| Meknès | 3 | 2 | 1 | 0 |
| Dakhla | 4 | 3 | 1 | 0 |
| Oujda | 0 | 0 | 0 | 0 |
| Béni Mellal | 0 | 0 | 0 | 0 |
| Guelmim | 0 | 0 | 0 | 0 |
| Laâyoune | 0 | 0 | 0 | 0 |

### Missing fallback fields

| Dataset | Records | No website | No phone | No image/gallery | No primary image |
|---|---:|---:|---:|---:|---:|
| Hotels | 117 | 101 | 97 | 111 | 114 |
| Restaurants | 123 | 115 | 106 | 123 | 123 |
| Activities | 103 | 93 | 96 | 103 | 103 |

### Duplicate/generic records

- Ifrane hotels `Chamonix` and `Le Chamonix` are about 16 m apart.
- Ifrane hotel `L’Empreinte d’Ifrane` and restaurant `L'Empreinte d'Ifrane` are about 5 m apart.
- Dakhla hotel `Bahia` and restaurant `Bahia` are about 10 m apart.
- Generic names found: `Open Area`, `Filmset`, `Night market`, `Grand Hotel`, `Jardin Public`.

## Verification Log

### Commands that succeeded

- `node --test tests/hotel-booking-links.test.mjs tests/phase1-data-accuracy.test.mjs tests/phase2-api-foundation.test.mjs tests/phase3-schema-contract.test.mjs`
  - Result: 25 tests passed, 0 failed, approximately 318 ms.
- `npm run build`
  - Result: success.
  - Main JS: 306.30 kB (95.92 kB gzip).
  - CityPage chunk: 273.33 kB (56.08 kB gzip).
  - CSS: 63.14 kB (10.84 kB gzip).

### Static checks completed

- Inspected all pages, shared components, data providers, API handlers, i18n, Supabase migration/RLS, deployment config, tests, and public assets.
- Counted fallback records, missing fields, coverage, distinct image URLs, guide images, and duplicate/near-duplicate records.
- Calculated contrast ratios for theme color combinations.
- Checked translation placeholder consistency and route metadata behavior.
- Checked for `robots.txt`, `sitemap.xml`, canonical/OG/Twitter/structured data, CI, lint/typecheck configuration, and hardcoded secrets.
- Confirmed fallback JPG assets exist in `public/img/fallbacks`.
- Confirmed no external network/service/database calls were made during this audit.

### Not verified

- Browser rendering, responsive layout, actual visual clipping, and console errors.
- Keyboard behavior on real devices and screen readers.
- Runtime behavior of Overpass, Wikimedia, Google Places, or deployed Vercel functions.
- Actual validity of `thumb.wikimedia.org` URLs.
- Actual license provenance of local hero/destination/city images.
- Supabase behavior, because the schema is not applied and the app does not use it.
- Dependency vulnerability status (no `npm audit`/network check was performed).

## Recommended Remediation Order

1. **Fix discovery:** make Destinations cards link to city pages; correct the four/five-column grid; add navigation and language switching to Home/Destinations.
2. **Fix city hero reliability:** verify/replace `thumb.wikimedia.org`; add local placeholders for empty heroes; remove “Photo 1 of 0”.
3. **Close the content gap:** translate or explicitly mark English content; add Arabic/French city aliases; fix Arabic POI/hotel search.
4. **Improve SEO:** add per-route metadata, sitemap/robots, canonical/OG/structured data, and a real 404.
5. **Improve accessibility:** focus traps, route focus/scroll management, live search announcements, larger carousel controls, contrast fixes, skip link/main landmarks.
6. **Fix data quality:** add POIs/heroes for the four uncovered cities; curate high-value imagery; deduplicate near-identical records; add coverage tests.
7. **Harden API:** add rate limiting/authentication or disable Google photo fetching until cost/attribution controls are ready; add security headers.
8. **Make state URL-addressable:** category tabs, selected POIs, and region filters.
9. **Add engineering guardrails:** ErrorBoundary, test/lint/typecheck scripts, CI, README test instructions, environment-example cleanup.
10. **Polish performance and attribution:** scope preloads, optimize images/fonts, make credits visible, and correct the footer claim.

## Bottom Line

BLADNA is a visually ambitious and structurally promising tourism prototype with a working build and a useful fallback-data strategy. Its biggest weaknesses are discoverability, multilingual content depth, city-hero reliability, accessibility, SEO, and data/legal completeness. The highest-return fixes are the destination-card links, Home/Destinations navigation, city-hero fallback handling, and a deliberate decision about whether English content will be translated or explicitly presented as English.
