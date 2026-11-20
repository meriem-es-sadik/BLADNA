import assert from "node:assert/strict";
import test from "node:test";

import { hotelsFallbackByCity } from "../src/data/hotelsFallback.js";
import { safeBookingUrl } from "../src/utils/links.js";

test("accepts verified hotel-specific Booking.com URLs", () => {
  const urls = [
    "https://www.booking.com/hotel/ma/riad-dar.html",
    "https://booking.com/hotel/fr/hotel-du-louvre.html",
    "https://www.booking.com/hotel/ma/riad-dar.en-gb.html",
    "https://www.booking.com/hotel/ma/riad-dar.fr.html",
  ];

  for (const url of urls) {
    assert.equal(safeBookingUrl(url), url);
  }
});

test("normalizes the host while keeping the hotel path", () => {
  assert.equal(
    safeBookingUrl("https://WWW.Booking.com/hotel/ma/riad-dar.html"),
    "https://www.booking.com/hotel/ma/riad-dar.html"
  );
  assert.equal(
    safeBookingUrl("https://www.booking.com./hotel/ma/riad-dar.html"),
    "https://www.booking.com/hotel/ma/riad-dar.html"
  );
});

test("rejects missing booking URLs", () => {
  for (const value of [null, undefined, "", "   ", 0, false]) {
    assert.equal(safeBookingUrl(value), null);
  }
});

test("rejects non-hotel Booking.com pages", () => {
  const urls = [
    "https://www.booking.com/",
    "https://www.booking.com/searchresults.html",
    "https://www.booking.com/searchresults.html?ss=Marrakech",
    "https://www.booking.com/city/ma/marrakech.html",
    "https://www.booking.com/region/ma/marrakech-tensift-al-haouz.html",
    "https://www.booking.com/country/ma.html",
    "https://www.booking.com/airport/ma/rak.html",
    "https://www.booking.com/landmark/ma/koutoubia.html",
    "https://www.booking.com/hotel/ma/",
    "https://www.booking.com/hotel/ma/riad-dar",
    "https://www.booking.com/hotel/ma/riad-dar.htm",
    "https://www.booking.com/hotel/ma/riad-dar.html/",
    "https://www.booking.com/hotels/ma/riad-dar.html",
    "https://www.booking.com/hotel/riad-dar.html",
    "https://www.booking.com/hotel/ma/riad-dar.html?aid=123",
    "https://www.booking.com/hotel/ma/riad-dar.html#reviews",
    "https://www.booking.com/hotel/ma/../searchresults.html",
    "https://www.booking.com/hotel/ma/%2e%2e/searchresults.html",
    "https://www.booking.com/hotel/ma/riad-dar%2Fsearchresults.html",
    "https://www.booking.com/hotel/ma/riad-dar%5C.html",
    "https://www.booking.com/hotel/ma/riad-dar.html%00",
  ];

  for (const url of urls) {
    assert.equal(safeBookingUrl(url), null, url);
  }
});

test("rejects untrusted hosts and unsafe URL forms", () => {
  const urls = [
    "http://www.booking.com/hotel/ma/riad-dar.html",
    "https://secure.booking.com/hotel/ma/riad-dar.html",
    "https://account.booking.com/hotel/ma/riad-dar.html",
    "https://booking.com.evil.example/hotel/ma/riad-dar.html",
    "https://www.booking.com.evil.example/hotel/ma/riad-dar.html",
    "https://evil.example/hotel/ma/riad-dar.html",
    "https://user:pass@www.booking.com/hotel/ma/riad-dar.html",
    "https://user@www.booking.com/hotel/ma/riad-dar.html",
    "https://www.booking.com:8443/hotel/ma/riad-dar.html",
    "https://www.booking.com/hotel/ma/riad-dar.html?redirect=https://evil.example",
    "https:\\\\www.booking.com\\hotel\\ma\\riad-dar.html",
    "https://www.booking.com/hotel/ma/riad-dar.html\u0000",
    "javascript:alert(1)",
    "//www.booking.com/hotel/ma/riad-dar.html",
    "www.booking.com/hotel/ma/riad-dar.html",
    "ftp://www.booking.com/hotel/ma/riad-dar.html",
  ];

  for (const url of urls) {
    assert.equal(safeBookingUrl(url), null, url);
  }
});

test("bundled fallback hotels do not contain unverified booking links", () => {
  for (const [city, hotels] of Object.entries(hotelsFallbackByCity)) {
    for (const hotel of hotels) {
      assert.ok(
        !hotel.bookingUrl,
        `${city}/${hotel.name} must not include an unverified bookingUrl`
      );
    }
  }
});
