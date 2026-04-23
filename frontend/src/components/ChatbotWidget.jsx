/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/chatbot.css";

import { sendChatMessage } from "../services/chatbotService";
import { listProductions } from "../services/productionService";

import ReactMarkdown from "react-markdown";

const USER_ID_STORAGE_KEY = "rag_user_id";
const CONVERSATION_ID_STORAGE_KEY = "rag_conversation_id";

const getOrCreateUserId = () => {
  const existing = localStorage.getItem(USER_ID_STORAGE_KEY);
  if (existing) return existing;

  const userId = `web-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(USER_ID_STORAGE_KEY, userId);
  return userId;
};

const resolveImageUrlOrNull = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  try {
    const mediaBase =
      import.meta.env.VITE_MEDIA_BASE_URL || window.location.origin;
    return new URL(trimmed, mediaBase).toString();
  } catch {
    return null;
  }
};

const PLACEHOLDER_URL_TOKENS = [
  "no-image",
  "no_image",
  "image-not-available",
  "image_not_available",
  "not-available",
  "not_available",
  "placeholder",
  "default-poster",
  "default_poster",
  "missing-poster",
  "missing_poster",
  "poster-not-found",
  "poster_not_found",
  "no-poster",
  "no_poster",
];

const isLikelyPlaceholderUrl = (value) => {
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;
  if (normalized.includes("anonymousbanner")) return true;
  return PLACEHOLDER_URL_TOKENS.some((token) => normalized.includes(token));
};

const isMostlyWhiteImage = (imgElement) => {
  if (
    !imgElement ||
    imgElement.naturalWidth <= 1 ||
    imgElement.naturalHeight <= 1
  ) {
    return true;
  }

  try {
    const sampleWidth = 24;
    const sampleHeight = 24;
    const canvas = document.createElement("canvas");
    canvas.width = sampleWidth;
    canvas.height = sampleHeight;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return false;

    context.drawImage(imgElement, 0, 0, sampleWidth, sampleHeight);
    const pixels = context.getImageData(0, 0, sampleWidth, sampleHeight).data;

    let opaquePixels = 0;
    let veryBrightPixels = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      const alpha = pixels[i + 3];
      if (alpha < 16) continue;

      opaquePixels += 1;
      const luminance = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
      if (luminance >= 246) {
        veryBrightPixels += 1;
      }
    }

    if (opaquePixels < 80) return false;
    return veryBrightPixels / opaquePixels >= 0.985;
  } catch {
    // Cross-origin images may block pixel read; skip white check in that case.
    return false;
  }
};

const stripLegacyLinkLines = (text) => {
  if (typeof text !== "string") return "";

  const cleaned = text
    .split("\n")
    .filter(
      (line) => !/^\s*[-*]?\s*\*{0,2}\s*Đường link\s*:/i.test(line.trim()),
    )
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return cleaned;
};

const toStringList = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item !== "");
  }

  if (typeof value === "string") {
    return value
      .split(/[;,]/)
      .map((item) => item.trim())
      .filter((item) => item !== "");
  }

  return [];
};

const formatMovieType = (value) => {
  if (typeof value !== "string") return "movie";
  const normalized = value.trim().toLowerCase();
  if (!normalized) return "movie";
  if (normalized === "series") return "series";
  if (normalized === "season") return "season";
  return "movie";
};

const normalizeLookupText = (value) => {
  if (typeof value !== "string") return "";
  try {
    return value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ");
  } catch {
    return value.trim().toLowerCase().replace(/\s+/g, " ");
  }
};

const toProductionIdOrNull = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) return null;
  return Math.trunc(numericValue);
};

const buildWatchHref = (slug) => {
  if (typeof slug !== "string") return "";
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) return "";
  return `/watch/${encodeURIComponent(normalizedSlug)}`;
};

const buildPosterCandidates = (item) => {
  const posterCandidate = resolveImageUrlOrNull(item?.poster_url);
  const thumbnailCandidate = resolveImageUrlOrNull(item?.thumbnail_url);

  const rawCandidates = [];

  // If poster URL looks like a known placeholder, prefer thumbnail first.
  if (isLikelyPlaceholderUrl(posterCandidate)) {
    rawCandidates.push(thumbnailCandidate, posterCandidate);
  } else {
    rawCandidates.push(posterCandidate, thumbnailCandidate);
  }

  const unique = [];
  const seen = new Set();
  rawCandidates.forEach((candidate) => {
    if (typeof candidate !== "string" || candidate.trim() === "") return;
    if (seen.has(candidate)) return;
    seen.add(candidate);
    unique.push(candidate);
  });

  return unique;
};

const MoviePosterImage = ({ movie }) => {
  const posterCandidates = useMemo(() => {
    if (
      Array.isArray(movie?.posterCandidates) &&
      movie.posterCandidates.length > 0
    ) {
      return movie.posterCandidates;
    }

    if (typeof movie?.posterUrl === "string" && movie.posterUrl.trim() !== "") {
      return [movie.posterUrl];
    }

    return [];
  }, [movie?.posterCandidates, movie?.posterUrl]);

  const [posterIndex, setPosterIndex] = useState(0);

  useEffect(() => {
    setPosterIndex(0);
  }, [movie?.id, posterCandidates]);

  const moveToNextPoster = useCallback(() => {
    setPosterIndex((current) =>
      current < posterCandidates.length ? current + 1 : current,
    );
  }, [posterCandidates.length]);

  const handlePosterError = useCallback(() => {
    moveToNextPoster();
  }, [moveToNextPoster]);

  const handlePosterLoad = useCallback(
    (event) => {
      const currentSrc = posterCandidates[posterIndex] || "";
      if (!currentSrc) return;

      if (isLikelyPlaceholderUrl(currentSrc)) {
        moveToNextPoster();
        return;
      }

      if (isMostlyWhiteImage(event.currentTarget)) {
        moveToNextPoster();
      }
    },
    [moveToNextPoster, posterCandidates, posterIndex],
  );

  const activePoster = posterCandidates[posterIndex] || "";

  if (!activePoster) {
    const fallbackLabel =
      typeof movie?.title === "string" && movie.title.trim() !== ""
        ? movie.title.trim().charAt(0).toUpperCase()
        : "?";

    return (
      <div
        className="chatbot-movie-poster-fallback"
        aria-label="Không có ảnh phim"
      >
        <span>{fallbackLabel}</span>
      </div>
    );
  }

  return (
    <img
      src={activePoster}
      alt={movie?.title || "Poster phim"}
      loading="lazy"
      onError={handlePosterError}
      onLoad={handlePosterLoad}
    />
  );
};

const resolveWatchHref = (watchUrl, slug) => {
  if (typeof watchUrl === "string" && watchUrl.trim() !== "") {
    const trimmed = watchUrl.trim();
    if (trimmed.startsWith("/watch/")) {
      return trimmed;
    }

    try {
      const parsedUrl = new URL(trimmed, window.location.origin);
      if (parsedUrl.pathname.startsWith("/watch/")) {
        return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
      }
    } catch {
      // Ignore malformed external URL and fallback to slug.
    }
  }

  return buildWatchHref(slug);
};

const buildMovieTags = ({ genres, type, year, country, language }) => {
  const tags = [];
  tags.push(...toStringList(genres));

  if (typeof year === "string" && year.trim() !== "") {
    tags.push(year.trim());
  }
  if (typeof type === "string" && type.trim() !== "") {
    tags.push(type.trim());
  }
  if (typeof country === "string" && country.trim() !== "") {
    tags.push(country.trim());
  }
  if (typeof language === "string" && language.trim() !== "") {
    tags.push(language.trim());
  }

  const deduped = [];
  const seen = new Set();
  tags.forEach((tag) => {
    const normalized = normalizeLookupText(tag);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    deduped.push(tag);
  });

  return deduped.slice(0, 6);
};

const SUMMARY_INTENT_REGEX =
  /(\bt[óo]m\s*t[ắa]t\b|\bt[óo]m\s*l[ượu]c\b|\bn[ộo]i\s*dung\b|\bk[ểe]\s*l[ạa]i\b|\bspoil\b|\bk[ếe]t\s*th[úu]c\b|\bending\b)/i;

const RECOMMEND_INTENT_KEYWORDS = [
  "goi y",
  "de xuat",
  "recommend",
  "danh sach",
  "list",
  "top",
  "phim giong",
  "tuong tu",
  "nen xem",
  "xem gi",
  "tim phim",
  "goi y phim",
];

const RECOMMEND_RESPONSE_HINTS = [
  "ly do goi y",
  "goi y",
  "de xuat",
  "danh sach phim",
];

const normalizeIntentText = (value) => {
  if (typeof value !== "string") return "";
  return normalizeLookupText(value)
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const isSummaryIntent = (query) => {
  if (typeof query !== "string") return false;
  return SUMMARY_INTENT_REGEX.test(query);
};

const isRecommendIntent = (query) => {
  if (typeof query !== "string") return false;
  if (isSummaryIntent(query)) return false;
  const normalizedQuery = normalizeIntentText(query);
  return RECOMMEND_INTENT_KEYWORDS.some((keyword) =>
    normalizedQuery.includes(keyword),
  );
};

const buildRecommendationLeadSentence = (cards) => {
  const count = Array.isArray(cards) ? cards.length : 0;
  if (count <= 0) return "";
  return "Đây là danh sách các bộ phim, mong bạn sẽ thích.";
};

const isRecommendationAnswerText = (answerText) => {
  const normalized = normalizeIntentText(answerText);
  if (!normalized) return false;
  return RECOMMEND_RESPONSE_HINTS.some((hint) => normalized.includes(hint));
};

const pickCardsByIntent = (cards, query) => {
  if (!Array.isArray(cards) || cards.length <= 1) return cards;
  if (!isSummaryIntent(query)) return cards;

  const queryKey = normalizeLookupText(query);
  if (queryKey) {
    const directMatch = cards.find(
      (card) =>
        queryKey.includes(card.titleKey) || card.titleKey.includes(queryKey),
    );
    if (directMatch) return [directMatch];
  }

  const queryTokens = queryKey.split(" ").filter((token) => token.length >= 3);
  if (queryTokens.length === 0) return cards.slice(0, 1);

  const scoredCards = cards.map((card) => {
    const score = queryTokens.reduce(
      (acc, token) => (card.titleKey.includes(token) ? acc + 1 : acc),
      0,
    );

    return { card, score };
  });

  scoredCards.sort((a, b) => b.score - a.score);
  if (scoredCards[0]?.score > 0) {
    return [scoredCards[0].card];
  }

  return cards.slice(0, 1);
};

const normalizeGenresFromProduction = (production) => {
  if (!Array.isArray(production?.genres)) return [];
  return production.genres
    .map((genre) => {
      if (typeof genre === "string") return genre.trim();
      if (typeof genre?.name === "string") return genre.name.trim();
      return "";
    })
    .filter((genre) => genre !== "");
};

const extractProductionIdsFromSources = (sources) => {
  if (!Array.isArray(sources)) return [];

  const seen = new Set();
  const ids = [];

  sources.forEach((source) => {
    const productionId = toProductionIdOrNull(
      source?.production_id ?? source?.productionId ?? source?.id ?? source,
    );
    if (productionId == null || seen.has(productionId)) return;
    seen.add(productionId);
    ids.push(productionId);
  });

  return ids;
};

const buildMovieCardFromProduction = (production) => {
  const productionId = toProductionIdOrNull(
    production?.id ?? production?.production_id,
  );
  if (productionId == null) return null;

  const title =
    typeof production?.title === "string" && production.title.trim() !== ""
      ? production.title.trim()
      : "Phim đề xuất";
  const slug =
    typeof production?.slug === "string" ? production.slug.trim() : "";
  const yearRaw = production?.release_year ?? production?.year;
  const year = yearRaw == null ? "" : String(yearRaw);
  const type = formatMovieType(production?.type);
  const country =
    typeof production?.country === "string" ? production.country.trim() : "";
  const language =
    typeof production?.language === "string" ? production.language.trim() : "";
  const description =
    typeof production?.description === "string"
      ? production.description.trim()
      : "";

  const genres = normalizeGenresFromProduction(production);
  const actors = toStringList(production?.actors);

  const ratingValue = Number(production?.rating_avg ?? production?.rating);
  const ratingText =
    Number.isFinite(ratingValue) && ratingValue > 0
      ? ratingValue.toFixed(1)
      : "";

  const durationValue = Number(
    production?.duration_minutes ??
      production?.movie?.duration_minutes ??
      production?.movie?.duration,
  );
  const durationText =
    Number.isFinite(durationValue) && durationValue > 0
      ? `${Math.round(durationValue)} phút`
      : "";

  const posterCandidates = buildPosterCandidates({
    poster_url: production?.poster_url,
    thumbnail_url: production?.thumbnail_url ?? production?.banner_url,
  });
  const posterUrl = posterCandidates[0] || "";
  const watchHref = resolveWatchHref(production?.watch_url, slug);

  return {
    id: String(productionId),
    productionId,
    titleKey: normalizeLookupText(title),
    title,
    type,
    year,
    country,
    language,
    description,
    genres,
    actors,
    tags: buildMovieTags({
      genres,
      type,
      year,
      country,
      language,
    }),
    ratingText,
    durationText,
    posterCandidates,
    posterUrl,
    watchHref,
  };
};

const ChatbotWidget = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Chào bạn! Mình có thể giúp tìm phim, gợi ý theo thể loại/diễn viên, hoặc tóm tắt (không spoil).",
      suggestion: 'Gợi ý: "Gợi ý phim hành động giống Biệt Đội Đáp Phá"',
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState(
    () => localStorage.getItem(CONVERSATION_ID_STORAGE_KEY) || null,
  );
  const abortRef = useRef(null);
  const productionCatalogRef = useRef(new Map());
  const productionCatalogPromiseRef = useRef(null);
  const slugLookupRef = useRef({
    byId: new Map(),
    byTitle: new Map(),
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (conversationId) {
      localStorage.setItem(CONVERSATION_ID_STORAGE_KEY, conversationId);
    } else {
      localStorage.removeItem(CONVERSATION_ID_STORAGE_KEY);
    }
  }, [conversationId]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort?.();
    };
  }, []);

  const hydrateProductionCatalog = useCallback(async () => {
    const existingCatalog = productionCatalogRef.current;
    if (existingCatalog.size > 0) {
      return existingCatalog;
    }

    if (!productionCatalogPromiseRef.current) {
      productionCatalogPromiseRef.current = (async () => {
        const productions = await listProductions({ scope: "all" });
        if (!Array.isArray(productions)) return productionCatalogRef.current;

        const nextCatalog = new Map();
        const byId = new Map();
        const byTitle = new Map();

        productions.forEach((production) => {
          const productionId = toProductionIdOrNull(
            production?.id ?? production?.production_id,
          );
          if (productionId != null && !nextCatalog.has(productionId)) {
            nextCatalog.set(productionId, production);
          }

          const slug =
            typeof production?.slug === "string" ? production.slug.trim() : "";
          if (!slug) return;

          if (productionId != null && !byId.has(productionId)) {
            byId.set(productionId, slug);
          }

          const titleKey = normalizeLookupText(production?.title);
          if (titleKey && !byTitle.has(titleKey)) {
            byTitle.set(titleKey, slug);
          }
        });

        productionCatalogRef.current = nextCatalog;
        slugLookupRef.current = { byId, byTitle };
        return productionCatalogRef.current;
      })().finally(() => {
        productionCatalogPromiseRef.current = null;
      });
    }

    return productionCatalogPromiseRef.current;
  }, []);

  const hydrateMovieCardsFromSourceIds = useCallback(
    async (sourceIds) => {
      if (!Array.isArray(sourceIds) || sourceIds.length === 0) return [];

      const catalog = await hydrateProductionCatalog();
      if (!(catalog instanceof Map) || catalog.size === 0) return [];

      const cards = [];
      sourceIds.forEach((productionId) => {
        const production = catalog.get(productionId);
        if (!production) return;
        const card = buildMovieCardFromProduction(production);
        if (!card) return;
        cards.push(card);
      });

      return cards;
    },
    [hydrateProductionCatalog],
  );

  const handleSendMessage = async () => {
    const messageText = inputValue.trim();
    if (messageText === "" || isSending) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      text: messageText,
    };

    const placeholderBotId = Date.now() + 1;
    const placeholderBotMessage = {
      id: placeholderBotId,
      type: "bot",
      text: "Đang xử lý yêu cầu của bạn...",
    };

    setMessages((prev) => [...prev, userMessage, placeholderBotMessage]);
    setInputValue("");
    setIsSending(true);

    abortRef.current?.abort?.();
    abortRef.current = new AbortController();

    try {
      const userId = getOrCreateUserId();
      const response = await sendChatMessage({
        userId,
        message: messageText,
        conversationId,
        signal: abortRef.current.signal,
      });

      if (response?.conversation_id) {
        setConversationId(response.conversation_id);
      }

      const answerTextRaw =
        typeof response?.answer === "string" && response.answer.trim() !== ""
          ? response.answer
          : "Mình chưa có câu trả lời phù hợp lúc này.";
      const normalizedAnswerTextRaw =
        stripLegacyLinkLines(answerTextRaw) || answerTextRaw;
      const sourceIds = extractProductionIdsFromSources(response?.sources);
      const movieCardsRaw = await hydrateMovieCardsFromSourceIds(sourceIds);
      const movieCards = pickCardsByIntent(movieCardsRaw, messageText);

      const shouldUseRecommendationLead =
        movieCards.length > 0 &&
        (isRecommendIntent(messageText) ||
          (movieCards.length >= 2 &&
            isRecommendationAnswerText(normalizedAnswerTextRaw)));

      const answerText = shouldUseRecommendationLead
        ? buildRecommendationLeadSentence(movieCards)
        : normalizedAnswerTextRaw;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderBotId
            ? { ...m, text: answerText, movieCards }
            : m,
        ),
      );
    } catch (err) {
      const errorText =
        err?.name === "AbortError"
          ? "Yêu cầu đã bị hủy."
          : err instanceof Error
            ? err.message
            : "Có lỗi xảy ra khi gọi hệ thống AI.";

      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderBotId ? { ...m, text: errorText } : m,
        ),
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const hydrateSlugLookup = useCallback(async () => {
    await hydrateProductionCatalog();
    return slugLookupRef.current;
  }, [hydrateProductionCatalog]);

  const handleMovieCardClick = useCallback(
    async (movie) => {
      if (movie.watchHref) {
        navigate(movie.watchHref);
        return;
      }

      try {
        const lookup = await hydrateSlugLookup();
        const slugFromId =
          movie.productionId != null
            ? lookup.byId.get(movie.productionId) || ""
            : "";
        const slugFromTitle = slugFromId
          ? ""
          : lookup.byTitle.get(movie.titleKey) || "";
        const resolvedWatchHref = buildWatchHref(slugFromId || slugFromTitle);

        if (resolvedWatchHref) {
          navigate(resolvedWatchHref);
        }
      } catch {
        // Ignore lookup errors so chatbot interaction is not blocked.
      }
    },
    [hydrateSlugLookup, navigate],
  );

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          className="chatbot-float-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Open chatbot"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* Chatbot Widget */}
      {isOpen && (
        <div className="chatbot-widget">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
              </div>
              <div className="chatbot-header-text">
                <div className="chatbot-title">Movie Assistant</div>
                <div className="chatbot-status">
                  <span className="status-dot"></span>
                  Online • trả lời nhanh
                </div>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button
                className="chatbot-action-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Minimize"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M19 13H5v-2h14v2z" fill="currentColor" />
                </svg>
              </button>
              <button
                className="chatbot-action-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chatbot-message ${message.type === "user" ? "user-message" : "bot-message"}`}
              >
                <div className="message-content">
                  <div className="message-text">
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  </div>
                  {message.type === "bot" &&
                    Array.isArray(message.movieCards) &&
                    message.movieCards.length > 0 && (
                      <div className="chatbot-movie-list">
                        {message.movieCards.map((movie) => {
                          const card = (
                            <>
                              <div className="chatbot-movie-poster">
                                <MoviePosterImage movie={movie} />
                              </div>
                              <div className="chatbot-movie-info">
                                <div className="chatbot-movie-title">
                                  {movie.title}
                                </div>
                                <div className="chatbot-movie-meta">
                                  <span className="chatbot-movie-type">
                                    {movie.type}
                                  </span>
                                  {movie.ratingText && (
                                    <span className="chatbot-movie-rating">
                                      ★ {movie.ratingText}
                                    </span>
                                  )}
                                  {movie.durationText && (
                                    <span className="chatbot-movie-duration">
                                      {movie.durationText}
                                    </span>
                                  )}
                                  {movie.year && (
                                    <span className="chatbot-movie-year">
                                      {movie.year}
                                    </span>
                                  )}
                                </div>

                                {movie.description && (
                                  <div className="chatbot-movie-description">
                                    {movie.description}
                                  </div>
                                )}
                              </div>
                            </>
                          );

                          return (
                            <button
                              key={movie.id}
                              type="button"
                              className="chatbot-movie-card"
                              aria-label={`Mở chi tiết phim ${movie.title}`}
                              onClick={() => {
                                void handleMovieCardClick(movie);
                              }}
                            >
                              {card}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  {message.suggestion && (
                    <div className="message-suggestion">
                      {message.suggestion}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input-container">
            <textarea
              className="chatbot-input"
              placeholder="Nhập tin nhắn... "
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isSending}
            />
            <button
              className="chatbot-send-btn"
              onClick={handleSendMessage}
              disabled={isSending || inputValue.trim() === ""}
              aria-label="Send message"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
