"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageCircle,
  Sparkles,
  X,
  Minus,
  ArrowUp,
  Star,
  Camera,
  RotateCcw,
} from "lucide-react";
import { useChatContext, type ChatMessage, type ProductCard } from "@/context/chat-context";
import { cn } from "@/lib/utils";

const HIDDEN_PATHS = ["/admin", "/login", "/register", "/signup", "/forgot-password", "/reset-password"];

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-bl-sm bg-background-elevated max-w-[85%] w-fit">
      <span className="h-2 w-2 rounded-full bg-foreground-muted animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="h-2 w-2 rounded-full bg-foreground-muted animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="h-2 w-2 rounded-full bg-foreground-muted animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

function ProductCardItem({ product }: { product: ProductCard }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="flex items-center gap-3 rounded-xl border border-line bg-background p-2.5 hover:border-champagne/60 hover:bg-champagne-tint/20 transition-colors"
    >
      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.image}
          alt={product.name}
          className="h-10 w-10 rounded-lg object-cover shrink-0 bg-background-elevated"
        />
      ) : (
        <div className="h-10 w-10 rounded-lg bg-background-elevated shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-foreground truncate">{product.name}</p>
        <p className="text-[0.68rem] text-foreground-faint truncate">{product.brand}</p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className="text-[0.65rem] rounded-full bg-sage-tint/60 text-sage-deep px-1.5 py-0.5 font-medium">
            {product.category}
          </span>
          {product.price != null && (
            <span className="text-[0.65rem] font-semibold text-foreground">
              ₹{Math.round(product.price)}
            </span>
          )}
          {product.rating !== null && (
            <span className="flex items-center gap-0.5 text-[0.65rem] text-foreground-faint">
              <Star className="h-2.5 w-2.5 fill-champagne-deep text-champagne-deep" />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function MessageBubble({
  message,
  onRetry,
}: {
  message: ChatMessage;
  onRetry?: (id: string, text: string) => void;
}) {
  if (message.role === "system") {
    return (
      <div className="flex flex-col items-center gap-1.5 py-1">
        <div className="text-center text-xs text-foreground-faint">
          {message.content}
        </div>
        {message.isError && message.retryText && onRetry && (
          <button
            type="button"
            onClick={() => onRetry(message.id, message.retryText!)}
            className="inline-flex items-center gap-1 rounded-full border border-line bg-background-elevated px-2.5 py-1 text-[0.68rem] font-medium text-foreground hover:border-champagne/60 hover:bg-champagne-tint/30 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Retry
          </button>
        )}
      </div>
    );
  }

  const isUser = message.role === "user";

  return (
    <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
      <div
        className={cn(
          "px-4 py-2.5 text-sm leading-relaxed max-w-[85%] whitespace-pre-wrap",
          isUser
            ? "bg-foreground text-background rounded-2xl rounded-br-sm max-w-[80%]"
            : "bg-background-elevated text-foreground rounded-2xl rounded-bl-sm"
        )}
      >
        {message.content}
      </div>
      {message.action === "skin-scan" && (
        <Link
          href="/skin-scan"
          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-sage-deep px-3.5 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
        >
          <Camera className="h-3.5 w-3.5" />
          Open Face Skin Scan
        </Link>
      )}
      {message.products && message.products.length > 0 && (
        <div className="mt-2 w-full max-w-[90%] space-y-1.5">
          <p className="text-[0.68rem] font-semibold text-foreground-faint uppercase tracking-wider px-0.5">
            From the catalog
          </p>
          {message.products.map((p) => (
            <ProductCardItem key={p.id} product={p} />
          ))}
        </div>
      )}
      <span className="mt-1 text-[0.6rem] text-foreground-faint px-0.5">
        {formatTime(message.timestamp)}
      </span>
    </div>
  );
}

const QUICK_SUGGESTIONS = [
  { label: "Oily skin routine", text: "What's a good routine for oily skin?" },
  { label: "Products for dark spots", text: "Recommend products for dark spots" },
  { label: "Best sunscreen for dry skin", text: "Best sunscreen for dry skin?" },
  { label: "Scan my face →", text: "I want to scan my face" },
];

export function FloatingChat() {
  const pathname = usePathname();
  const { messages, isOpen, isMinimized, isLoading, openChat, closeChat, minimizeChat, sendMessage, retryMessage, clearChat } =
    useChatContext();
  const [input, setInput] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const isHiddenPath = HIDDEN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  const hasMessages = messages.length > 0;
  const unreadDot = isMinimized && hasMessages;

  // Auto-scroll to bottom
  React.useEffect(() => {
    if (isOpen && !isHiddenPath) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading, isHiddenPath]);

  // Focus input when opened
  React.useEffect(() => {
    if (isOpen && !isHiddenPath) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isHiddenPath]);

  if (isHiddenPath) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput("");
    await sendMessage(text);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e as unknown as React.FormEvent);
    }
  }

  async function handleSuggestion(suggestion: { label: string; text: string }) {
    if (isLoading) return;
    openChat();
    await sendMessage(suggestion.text);
  }

  const showSuggestions = isOpen && !hasMessages && !isLoading;

  return (
    <>
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "fixed z-50 flex flex-col bg-background-card border border-line shadow-2xl overflow-hidden",
              // Mobile: bottom sheet
              "inset-x-0 bottom-0 h-[75vh] rounded-t-2xl",
              // Desktop: floating panel
              "sm:inset-x-auto sm:bottom-20 sm:right-5 sm:w-[380px] sm:h-[560px] sm:rounded-2xl"
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-line bg-background-card shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">BeautyIQ AI</span>
                  <span className="flex items-center gap-1 text-[0.65rem] text-sage-deep">
                    <span className="h-1.5 w-1.5 rounded-full bg-sage-deep animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-[0.68rem] text-foreground-faint truncate">Skincare & beauty assistant</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={minimizeChat}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-foreground-muted hover:text-foreground hover:bg-background-elevated transition-colors"
                  aria-label="Minimize chat"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={closeChat}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-foreground-muted hover:text-foreground hover:bg-background-elevated transition-colors"
                  aria-label="Close chat"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
              {/* Welcome message if no messages */}
              {!hasMessages && !isLoading && (
                <div className="flex flex-col items-start">
                  <div className="px-4 py-2.5 text-sm leading-relaxed bg-background-elevated text-foreground rounded-2xl rounded-bl-sm max-w-[85%]">
                    Hi! I&apos;m BeautyIQ AI 👋 Ask me anything about skincare, ingredients, or product recommendations.
                  </div>
                  <span className="mt-1 text-[0.6rem] text-foreground-faint px-0.5">
                    {formatTime(new Date())}
                  </span>
                </div>
              )}

              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onRetry={(id, text) => void retryMessage(id, text)}
                />
              ))}

              {isLoading && (
                <div className="flex items-start">
                  <TypingIndicator />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {showSuggestions && (
              <div className="px-3 pb-2 shrink-0">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-foreground-faint mb-1.5">
                  Quick suggestions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => void handleSuggestion(s)}
                      disabled={isLoading}
                      className="rounded-full border border-line bg-background-elevated px-3 py-1 text-xs text-foreground hover:border-champagne/60 hover:bg-champagne-tint/30 transition-colors disabled:opacity-50"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="border-t border-line bg-background-card px-3 py-2.5 shrink-0">
              <form onSubmit={(e) => void handleSubmit(e)} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about skincare..."
                  disabled={isLoading}
                  maxLength={800}
                  className="flex-1 min-w-0 bg-background-elevated rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-foreground-faint outline-none focus:ring-2 focus:ring-champagne/30 border border-line focus:border-champagne/60 transition-colors disabled:opacity-60"
                  aria-label="Chat input"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-foreground text-background disabled:opacity-40 hover:bg-foreground/90 transition-all"
                  aria-label="Send message"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </form>
              {/* Footer */}
              <div className="flex items-center justify-between mt-1.5">
                <button
                  type="button"
                  onClick={clearChat}
                  disabled={!hasMessages}
                  className="text-[0.65rem] text-foreground-faint hover:text-foreground-muted transition-colors disabled:opacity-30"
                >
                  Clear chat
                </button>
                <span className="text-[0.6rem] text-foreground-faint">
                  {input.length}/800
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bubble */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50">
        <div className="relative group">
          {/* Pulse ring */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full bg-champagne-deep/30 animate-ping" aria-hidden="true" />
          )}

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block pointer-events-none">
            <div className="rounded-lg bg-foreground text-background text-xs font-medium px-2.5 py-1.5 whitespace-nowrap shadow-lg">
              Ask BeautyIQ AI
            </div>
            <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-foreground" />
          </div>

          {/* Bubble button */}
          <button
            type="button"
            onClick={isOpen ? closeChat : openChat}
            aria-label={isOpen ? "Close BeautyIQ AI chat" : "Open BeautyIQ AI chat"}
            className="relative flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-xl hover:scale-105 active:scale-95 transition-transform"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="x"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.15 }}
                >
                  <MessageCircle className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Unread dot */}
            {unreadDot && (
              <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-champagne-deep border-2 border-background" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}
