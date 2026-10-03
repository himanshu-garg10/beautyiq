import type { Metadata } from "next";
import { Fraunces, Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/theme-context";
import { AuthProvider } from "@/context/auth-context";
import { SkinProfileProvider } from "@/context/skin-profile-context";
import { ToastProvider } from "@/context/toast-context";
import { ComparisonProvider } from "@/context/comparison-context";
import { NextAuthSessionProvider } from "@/components/auth/session-provider";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
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
      className={`${fraunces.variable} ${manrope.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-sage-tint selection:text-foreground">
        <ThemeProvider>
          <ToastProvider>
            <NextAuthSessionProvider>
              <AuthProvider>
                <SkinProfileProvider>
                  <ComparisonProvider>{children}</ComparisonProvider>
                </SkinProfileProvider>
              </AuthProvider>
            </NextAuthSessionProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
