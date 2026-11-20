export const DATA_PROVIDERS = Object.freeze({
  OSM: "osm",
  BLADNA_FALLBACK: "bladna_fallback",
  GOOGLE: "google",
  BLADNA: "bladna",
  UNKNOWN: "unknown",
});

const RATING_SOURCES = new Set(["osm", "google"]);

export function getDataProvider(entity) {
  if (!entity || typeof entity !== "object") return DATA_PROVIDERS.UNKNOWN;
  if (entity.dataProvider) return entity.dataProvider;
  if (entity.isFallback) return DATA_PROVIDERS.BLADNA_FALLBACK;
  return DATA_PROVIDERS.UNKNOWN;
}

export function getVerificationStatus(entity) {
  return entity?.verificationStatus === "verified" ? "verified" : "unreviewed";
}

export function isReviewed(entity) {
  return getVerificationStatus(entity) === "verified";
}

export function normalizeDataProvenance(entity, fallbackProvider = null) {
  const source = entity || {};
  const dataProvider =
    source.dataProvider ||
    (source.isFallback ? DATA_PROVIDERS.BLADNA_FALLBACK : fallbackProvider) ||
    DATA_PROVIDERS.UNKNOWN;
  const rating =
    typeof source.rating === "number" && Number.isFinite(source.rating)
      ? source.rating
      : null;
  const declaredRatingSource = RATING_SOURCES.has(source.ratingSource)
    ? source.ratingSource
    : null;
  const inferredRatingSource =
    rating === null
      ? null
      : declaredRatingSource ||
        (dataProvider === DATA_PROVIDERS.GOOGLE
          ? "google"
          : dataProvider === DATA_PROVIDERS.OSM
            ? "osm"
            : null);
  const verificationStatus = getVerificationStatus(source);
  const lastCheckedAt =
    verificationStatus === "verified" && source.lastCheckedAt
      ? source.lastCheckedAt
      : null;

  return {
    dataProvider,
    rating,
    ratingSource: inferredRatingSource,
    verificationStatus,
    lastCheckedAt,
    legacyVerifiedAt: source.legacyVerifiedAt || source.verifiedAt || null,
    verifiedAt: null,
  };
}

export function getSourceLabelKey(entity) {
  if (isReviewed(entity)) return "common.verified";
  switch (getDataProvider(entity)) {
    case DATA_PROVIDERS.GOOGLE:
      return "common.googleListing";
    case DATA_PROVIDERS.BLADNA:
      return "common.bladnaListing";
    case DATA_PROVIDERS.BLADNA_FALLBACK:
      return "common.bundledListing";
    case DATA_PROVIDERS.OSM:
      return "common.osmListing";
    default:
      return "common.communityListing";
  }
}

export function getRatingSource(entity) {
  if (typeof entity?.rating !== "number" || !Number.isFinite(entity.rating)) {
    return null;
  }
  return RATING_SOURCES.has(entity.ratingSource) ? entity.ratingSource : null;
}

export function getRatingSourceLabelKey(entity) {
  const source = getRatingSource(entity);
  if (source === "osm") return "common.ratingOsm";
  if (source === "google") return "common.ratingGoogle";
  return null;
}

export function getRatingSourceShortLabelKey(entity) {
  const source = getRatingSource(entity);
  if (source === "osm") return "common.ratingOsmShort";
  if (source === "google") return "common.ratingGoogleShort";
  return null;
}

export function getLastCheckedAt(entity) {
  if (!isReviewed(entity)) return null;
  return entity.lastCheckedAt || null;
}
