import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/chatbot.css";

import { sendChatMessage } from "../services/chatbotService";
import { listProductions } from "../services/productionService";
import AnonymousBanner from "../assets/anonymousBanner.png";

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
    const mediaBase = import.meta.env.VITE_MEDIA_BASE_URL || window.location.origin;
    return new URL(trimmed, mediaBase).toString();
  } catch {
    return null;
  }
};

const stripLegacyLinkLines = (text) => {
  if (typeof text !== "string") return "";

  const cleaned = text
    .split("\n")
    .filter((line) => !/^\s*[-*]?\s*\*{0,2}\s*Đường link\s*:/i.test(line.trim()))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return cleaned;
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
  return value.trim().toLowerCase().replace(/\s+/g, " ");
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

const normalizeChatSources = (sources) => {
  if (!Array.isArray(sources)) return [];

  const seen = new Set();
  const cards = [];

  sources.forEach((item, index) => {
    const productionId = toProductionIdOrNull(
      item?.production_id ?? item?.productionId ?? item?.id,
    );
    const uniqueKey = productionId != null ? String(productionId) : `source-${index}`;
    if (seen.has(uniqueKey)) return;
    seen.add(uniqueKey);

    const title = typeof item?.title === "string" && item.title.trim() !== ""
      ? item.title.trim()
      : "Phim đề xuất";

    const slug = typeof item?.slug === "string" ? item.slug.trim() : "";
    const year = item?.year == null ? "" : String(item.year);
    const type = formatMovieType(item?.type);

    const ratingValue = Number(item?.rating);
    const ratingText = Number.isFinite(ratingValue) && ratingValue > 0
      ? ratingValue.toFixed(1)
      : "";

    const durationValue = Number(item?.duration_minutes);
    const durationText = Number.isFinite(durationValue) && durationValue > 0
      ? `${Math.round(durationValue)} phút`
      : "";

    const posterUrl =
      resolveImageUrlOrNull(item?.poster_url) ||
      resolveImageUrlOrNull(item?.thumbnail_url) ||
      AnonymousBanner;

    cards.push({
      id: uniqueKey,
      productionId,
      titleKey: normalizeLookupText(title),
      title,
      type,
      year,
      ratingText,
      durationText,
      posterUrl,
      watchHref: buildWatchHref(slug),
    });
  });

  return cards;
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
  const slugLookupRef = useRef({
    byId: new Map(),
    byTitle: new Map(),
  });
  const slugLookupPromiseRef = useRef(null);
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
      const movieCards = normalizeChatSources(response?.sources);
      const answerText = movieCards.length > 0
        ? stripLegacyLinkLines(answerTextRaw) || "Mình chưa có câu trả lời phù hợp lúc này."
        : answerTextRaw;

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
        prev.map((m) => (m.id === placeholderBotId ? { ...m, text: errorText } : m)),
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
    const existingLookup = slugLookupRef.current;
    if (existingLookup.byId.size > 0 || existingLookup.byTitle.size > 0) {
      return existingLookup;
    }

    if (!slugLookupPromiseRef.current) {
      slugLookupPromiseRef.current = (async () => {
        const productions = await listProductions();
        if (!Array.isArray(productions)) return slugLookupRef.current;

        const byId = new Map();
        const byTitle = new Map();

        productions.forEach((production) => {
          const slug = typeof production?.slug === "string" ? production.slug.trim() : "";
          if (!slug) return;

          const productionId = toProductionIdOrNull(production?.id ?? production?.production_id);
          if (productionId != null && !byId.has(productionId)) {
            byId.set(productionId, slug);
          }

          const titleKey = normalizeLookupText(production?.title);
          if (titleKey && !byTitle.has(titleKey)) {
            byTitle.set(titleKey, slug);
          }
        });

        slugLookupRef.current = { byId, byTitle };
        return slugLookupRef.current;
      })().finally(() => {
        slugLookupPromiseRef.current = null;
      });
    }

    return slugLookupPromiseRef.current;
  }, []);

  const handleMovieCardClick = useCallback(async (movie) => {
    if (movie.watchHref) {
      navigate(movie.watchHref);
      return;
    }

    try {
      const lookup = await hydrateSlugLookup();
      const slugFromId =
        movie.productionId != null ? lookup.byId.get(movie.productionId) || "" : "";
      const slugFromTitle = slugFromId ? "" : lookup.byTitle.get(movie.titleKey) || "";
      const resolvedWatchHref = buildWatchHref(slugFromId || slugFromTitle);

      if (resolvedWatchHref) {
        navigate(resolvedWatchHref);
      }
    } catch {
      // Ignore lookup errors so chatbot interaction is not blocked.
    }
  }, [hydrateSlugLookup, navigate]);

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
                  {message.type === "bot" && Array.isArray(message.movieCards) && message.movieCards.length > 0 && (
                    <div className="chatbot-movie-list">
                      {message.movieCards.map((movie, index) => {
                        const card = (
                          <>
                            <div className="chatbot-movie-rank">#{index + 1}</div>
                            <div className="chatbot-movie-poster">
                              <img src={movie.posterUrl} alt={movie.title} loading="lazy" />
                            </div>
                            <div className="chatbot-movie-info">
                              <div className="chatbot-movie-title">{movie.title}</div>
                              <div className="chatbot-movie-meta">
                                <span className="chatbot-movie-type">{movie.type}</span>
                                {movie.ratingText && <span className="chatbot-movie-rating">★ {movie.ratingText}</span>}
                                {movie.durationText && <span className="chatbot-movie-duration">{movie.durationText}</span>}
                                {movie.year && <span className="chatbot-movie-year">{movie.year}</span>}
                              </div>
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
