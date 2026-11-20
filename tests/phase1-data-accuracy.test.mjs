import test from "node:test";
import assert from "node:assert/strict";
import {
  getDataProvider,
  getLastCheckedAt,
  getRatingSourceLabelKey,
  getRatingSourceShortLabelKey,
  getSourceLabelKey,
  normalizeDataProvenance,
} from "../src/utils/dataProvenance.js";
import { translations } from "../src/i18n/translations.js";

test("fallback records are labelled as bundled OSM listings, not verified", () => {
  const place = normalizeDataProvenance({
    isFallback: true,
    verifiedAt: "2026-10-29",
  });

  assert.equal(place.dataProvider, "bladna_fallback");
  assert.equal(place.verificationStatus, "unreviewed");
  assert.equal(place.lastCheckedAt, null);
  assert.equal(place.verifiedAt, null);
  assert.equal(place.legacyVerifiedAt, "2026-10-29");
  assert.equal(getSourceLabelKey(place), "common.bundledListing");
  assert.equal(getLastCheckedAt(place), null);
});

test("live OSM ratings carry an OSM source label", () => {
  const hotel = normalizeDataProvenance({
    dataProvider: "osm",
    rating: 4.5,
    ratingSource: "osm",
  });

  assert.equal(getSourceLabelKey(hotel), "common.osmListing");
  assert.equal(getRatingSourceLabelKey(hotel), "common.ratingOsm");
  assert.equal(getRatingSourceShortLabelKey(hotel), "common.ratingOsmShort");
});

test("Google ratings infer a Google source and label", () => {
  const place = normalizeDataProvenance({
    dataProvider: "google",
    rating: 4.7,
  });

  assert.equal(place.ratingSource, "google");
  assert.equal(getSourceLabelKey(place), "common.googleListing");
  assert.equal(getRatingSourceLabelKey(place), "common.ratingGoogle");
  assert.equal(getRatingSourceShortLabelKey(place), "common.ratingGoogleShort");
});

test("ratings without a known source are hidden", () => {
  const place = normalizeDataProvenance({
    dataProvider: "unknown",
    rating: 4.2,
  });

  assert.equal(place.ratingSource, null);
  assert.equal(getRatingSourceLabelKey(place), null);
  assert.equal(getRatingSourceShortLabelKey(place), null);
});

test("only genuinely reviewed records expose a review label and check date", () => {
  const reviewed = normalizeDataProvenance({
    dataProvider: "bladna",
    verificationStatus: "verified",
    lastCheckedAt: "2026-11-01",
  });
  const unreviewed = normalizeDataProvenance({
    dataProvider: "osm",
    lastCheckedAt: "2026-11-01",
  });

  assert.equal(getSourceLabelKey(reviewed), "common.verified");
  assert.equal(getLastCheckedAt(reviewed), "2026-11-01");
  assert.equal(reviewed.verifiedAt, null);
  assert.equal(unreviewed.lastCheckedAt, null);
  assert.equal(getLastCheckedAt(unreviewed), null);
});

test("unknown or missing providers fall back to a neutral community label", () => {
  assert.equal(getDataProvider(null), "unknown");
  assert.equal(getDataProvider({ isFallback: true }), "bladna_fallback");
  assert.equal(getSourceLabelKey({ dataProvider: "mystery" }), "common.communityListing");
  assert.equal(getSourceLabelKey(null), "common.communityListing");
});

test("all locales include the Phase 1 source and rating labels", () => {
  const keys = [
    "common.osmListing",
    "common.googleListing",
    "common.bladnaListing",
    "common.communityListing",
    "common.bundledListing",
    "common.ratingOsm",
    "common.ratingGoogle",
    "common.ratingOsmShort",
    "common.ratingGoogleShort",
    "common.lastChecked",
    "common.verified",
  ];

  for (const lang of ["en", "fr", "ar"]) {
    for (const key of keys) {
      assert.ok(translations[lang][key], `${lang} is missing ${key}`);
    }
    assert.ok(
      !translations[lang]["hotels.detailsSource"].includes("{verified}"),
      `${lang} hotels.detailsSource still has a verification placeholder`
    );
    assert.ok(
      !translations[lang]["places.detailsSource"].includes("{verified}"),
      `${lang} places.detailsSource still has a verification placeholder`
    );
  }

  assert.match(translations.en["common.verified"], /BLADNA/);
});

test("English fallback, attribution, and count copy no longer claims verification", () => {
  const keys = [
    "hotels.offline",
    "hotels.attribution",
    "hotels.detailsSource",
    "places.offline",
    "places.attribution",
    "places.detailsSource",
    "places.showing",
    "places.emptyTitle",
  ];

  for (const key of keys) {
    assert.doesNotMatch(translations.en[key], /verified/i, `${key} still claims verification`);
  }
});
