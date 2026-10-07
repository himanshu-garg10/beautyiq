import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .max(254)
  .transform((value) => value.toLowerCase());

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const profileUpdateSchema = z.object({
  skinType: z.string().trim().min(1).optional(),
  concerns: z.array(z.string()).optional(),
  budgetMin: z.number().min(0).max(1_000_000).optional().nullable(),
  budgetMax: z.number().min(0).max(1_000_000).optional().nullable(),
  allergies: z.array(z.string()).optional(),
  preferences: z.string().max(4000).optional().nullable(),
  goals: z.array(z.string()).optional(),
  sensitivityLevel: z.string().optional().nullable(),
  reactionFrequency: z.string().optional().nullable(),
  preferredIngredients: z.array(z.string()).optional(),
  avoidIngredients: z.array(z.string()).optional(),
  fragranceFree: z.boolean().optional(),
  crueltyFree: z.boolean().optional(),
  vegan: z.boolean().optional(),
  parabenFree: z.boolean().optional(),
  siliconeFree: z.boolean().optional(),
  isOnboardingComplete: z.boolean().optional(),
});

export const savedProductSchema = z.object({
  productId: z.string().trim().min(1, "Product ID is required").max(128),
});

export const quizResultSchema = z.object({
  answers: z.union([
    z.array(z.unknown()),
    z.record(z.string(), z.unknown()),
  ]),
});
