export function encodeItemId(id) {
  return encodeURIComponent(String(id));
}

export function decodeItemId(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function buildItemPath(citySlug, category, id) {
  const root = category === "places" ? "places" : category;
  return `/cities/${citySlug}/${root}/${encodeItemId(id)}`;
}

export function buildBackPath(citySlug, category) {
  if (category === "places" || category === "attractions") {
    return `/cities/${citySlug}/attractions`;
  }
  return `/cities/${citySlug}/${category}`;
}

export function categoryForPlace(place) {
  if (place?.kind === "restaurant") return "restaurants";
  if (place?.activityGroup === "landmarks") return "attractions";
  return "activities";
}

export function detailCategoryForGroup(group, place) {
  if (place?.kind === "restaurant") return "restaurants";
  if (group === "landmarks" || group === "attractions") return "attractions";
  return categoryForPlace(place);
}
