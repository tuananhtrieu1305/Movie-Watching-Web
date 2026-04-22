export const DUMMY_MOVIE_URL =
  "https://pub-62e1d1e40c7f436b998f83804b7796fd.r2.dev/hls/1775304270176-812/playlist.m3u8";

export const DUMMY_SERIES_URLS = [
  "https://pub-62e1d1e40c7f436b998f83804b7796fd.r2.dev/hls/1775304270176-812/playlist.m3u8", // Series - S1 E1
  "https://pub-62e1d1e40c7f436b998f83804b7796fd.r2.dev/hls/1775304961557-102/playlist.m3u8", // Series - S2 E1
];

export const getFallbackVideoUrl = (
  originalUrl,
  type,
  seasonNumber = 1,
  episodeNumber = 1,
) => {
  // Nếu có link hợp lệ (bắt đầu bằng http) và không phải link mẫu/rác
  if (
    originalUrl &&
    originalUrl.startsWith("http") &&
    !originalUrl.includes("w3schools.com")
  ) {
    return originalUrl;
  }

  if (type === "movie") {
    return DUMMY_MOVIE_URL;
  }

  const sum = Number(seasonNumber) + Number(episodeNumber);
  const index = sum % 2; // Sinh ra 0 hoặc 1

  return DUMMY_SERIES_URLS[index];
};

export const getFallbackDuration = (
  originalUrl,
  type,
  seasonNumber = 1,
  episodeNumber = 1,
  originalDuration = 0,
) => {
  if (
    originalUrl &&
    originalUrl.startsWith("http") &&
    !originalUrl.includes("w3schools.com")
  ) {
    return originalDuration;
  }

  if (type === "movie") {
    return 1213; // 20m 13s dummy movie
  }

  const sum = Number(seasonNumber) + Number(episodeNumber);
  const index = sum % 2;

  // index 0 -> link S1E1 -> 1213s
  // index 1 -> link S2E1 -> 1517s
  return index === 0 ? 1213 : 1517;
};
