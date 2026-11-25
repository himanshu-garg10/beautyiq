"use client";

import { ChatProvider as ChatContextProvider } from "@/context/chat-context";
import { FloatingChat } from "./FloatingChat";

export function ChatProvider({ children }: { children: React.ReactNode }) {
  return (
    <ChatContextProvider>
      {children}
      <FloatingChat />
    </ChatContextProvider>
  );
}
