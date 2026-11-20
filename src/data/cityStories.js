import { cityStoriesEn } from "./cityStories.en";
import { cityStoriesFr } from "./cityStories.fr";
import { cityStoriesAr } from "./cityStories.ar";

const storiesByLanguage = {
  en: cityStoriesEn,
  fr: cityStoriesFr,
  ar: cityStoriesAr,
};

export const cityStories = storiesByLanguage.en;

export function getCityStory(slug, lang = "en") {
  const stories = storiesByLanguage[lang] || storiesByLanguage.en;
  return stories[slug] || storiesByLanguage.en[slug] || null;
}
