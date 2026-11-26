import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/theme-context";
import { AuthProvider } from "@/context/auth-context";
import { SkinProfileProvider } from "@/context/skin-profile-context";
import { ToastProvider } from "@/context/toast-context";
import { ComparisonProvider } from "@/context/comparison-context";
import { NextAuthSessionProvider } from "@/components/auth/session-provider";
import { ChatProvider } from "@/components/chat/ChatProvider";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BeautyIQ — AI Powered Skincare Discovery & Intelligence Platform",
  description:
    "BeautyIQ is an AI-powered personalized cosmetics discovery, recommendation, ingredient intelligence and cross-platform product comparison platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-sage-tint selection:text-foreground">
        <ThemeProvider>
          <ToastProvider>
            <NextAuthSessionProvider>
              <AuthProvider>
                <SkinProfileProvider>
                  <ComparisonProvider>
                    <ChatProvider>{children}</ChatProvider>
                  </ComparisonProvider>
                </SkinProfileProvider>
              </AuthProvider>
            </NextAuthSessionProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
