/**
 * BeautyIQ Domain Types & Interfaces
 * Cleanly organized across domain modules:
 * - user.ts: Skin profile, authentication, user preferences, notifications
 * - product.ts: Product catalog, listings, categories, brands, availability
 * - ingredient.ts: Skincare ingredients, safety ratings, comedogenic scores
 * - recommendation.ts: AI requirements, scoring engine, match results, feedback
 * - comparison.ts: Side-by-side comparison matrix, price history, normalized value
 * - admin.ts: Admin analytics, system metrics, reports, moderation, data issues
 * - pipeline.ts: 7-stage data pipeline, raw sources, validation, ingestion
 */

export * from "./user";
export * from "./product";
export * from "./ingredient";
export * from "./recommendation";
export * from "./comparison";
export * from "./admin";
export * from "./pipeline";
