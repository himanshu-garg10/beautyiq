/**
 * BeautyIQ Application Constants
 */

export const APP_CONFIG = {
  name: "BeautyIQ",
  tagline: "AI-Powered Skincare Discovery & Intelligence Platform",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  description:
    "BeautyIQ is an AI-powered personalized cosmetics discovery, recommendation, ingredient intelligence and cross-platform product comparison platform.",
  defaultCurrency: "INR",
  currencySymbol: "₹",
};

export const PAGINATION = {
  defaultPageSize: 12,
  maxPageSize: 48,
};

export const RATE_LIMITS = {
  maxRequests: 60,
  windowMs: 60000,
};
