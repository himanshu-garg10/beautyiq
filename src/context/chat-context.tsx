"use client";

import * as React from "react";

export interface ProductCard {
  id: string;
  name: string;
  brand: string;
  category: string;
  rating: number | null;
  image: string;
  slug: string;
  price?: number | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  products?: ProductCard[];
  action?: "skin-scan";
  isError?: boolean;
  retryText?: string;
  timestamp: Date;
}

interface ChatContextValue {
  messages: ChatMessage[];
  isOpen: boolean;
  isMinimized: boolean;
  isLoading: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  minimizeChat: () => void;
  sendMessage: (text: string) => Promise<void>;
  retryMessage: (errorMsgId: string, text: string) => Promise<void>;
  clearChat: () => void;
}

const ChatContext = React.createContext<ChatContextValue | null>(null);

const SESSION_KEY = "beautyiq_chat_messages";

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function serializeMessages(messages: ChatMessage[]): string {
  return JSON.stringify(
    messages.map((m) => ({ ...m, timestamp: m.timestamp.toISOString() }))
  );
}

function deserializeMessages(raw: string): ChatMessage[] {
  try {
    const parsed = JSON.parse(raw) as Array<{
      id: string;
      role: "user" | "assistant" | "system";
      content: string;
      products?: ProductCard[];
      timestamp: string;
    }>;
    return parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));
  } catch {
    return [];
  }
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Restore from sessionStorage on mount
  React.useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        const restored = deserializeMessages(stored);
        if (restored.length > 0) {
          setMessages(restored);
        }
      }
    } catch {
      // sessionStorage unavailable (SSR or private mode)
    }
  }, []);

  // Persist to sessionStorage on change
  React.useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, serializeMessages(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  const openChat = React.useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
  }, []);

  const closeChat = React.useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
  }, []);

  const toggleChat = React.useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) setIsMinimized(false);
      return !prev;
    });
  }, []);

  const minimizeChat = React.useCallback(() => {
    setIsMinimized(true);
    setIsOpen(false);
  }, []);

  const clearChat = React.useCallback(() => {
    setMessages([]);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  }, []);

  const sendMessage = React.useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const historyForApi = [...messages, userMsg]
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: historyForApi }),
        });

        const json = await res.json() as {
          success: boolean;
          data?: { reply: string; products?: ProductCard[]; action?: "skin-scan" };
          error?: { message: string };
        };

        if (json.success && json.data) {
          const assistantMsg: ChatMessage = {
            id: generateId(),
            role: "assistant",
            content: json.data.reply,
            products: json.data.products,
            action: json.data.action,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        } else {
          const errorMsg: ChatMessage = {
            id: generateId(),
            role: "system",
            content: json.error?.message || "Something went wrong. Please try again.",
            isError: true,
            retryText: text.trim(),
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMsg]);
        }
      } catch {
        const errorMsg: ChatMessage = {
          id: generateId(),
          role: "system",
          content: "Could not reach BeautyIQ AI. Please check your connection.",
          isError: true,
          retryText: text.trim(),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading]
  );

  const retryMessage = React.useCallback(
    async (errorMsgId: string, text: string) => {
      if (isLoading) return;
      setMessages((prev) => prev.filter((m) => m.id !== errorMsgId));
      await sendMessage(text);
    },
    [isLoading, sendMessage]
  );

  const value: ChatContextValue = {
    messages,
    isOpen,
    isMinimized,
    isLoading,
    openChat,
    closeChat,
    toggleChat,
    minimizeChat,
    sendMessage,
    retryMessage,
    clearChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext(): ChatContextValue {
  const ctx = React.useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChatContext must be used inside ChatProvider");
  }
  return ctx;
}
