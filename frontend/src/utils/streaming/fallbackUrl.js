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
  // Nếu có link hợp lệ (bắt đầu bằng http) thì trả về luôn link đó
  if (originalUrl && originalUrl.startsWith("http")) {
    return originalUrl;
  }

  if (type === "movie") {
    return DUMMY_MOVIE_URL;
  }

  const sum = Number(seasonNumber) + Number(episodeNumber);
  const index = sum % 2; // Sinh ra 0 hoặc 1

  return DUMMY_SERIES_URLS[index];
};
