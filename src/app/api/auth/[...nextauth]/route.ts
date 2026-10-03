import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth/auth-options";
import { enforceAuthRateLimit } from "@/lib/auth/rate-limit";

const handler = NextAuth(authOptions);

export const GET = handler;

export async function POST(req: NextRequest, context: { params: { nextauth: string[] } }) {
  const action = context.params?.nextauth?.[0];
  if (action === "callback" && context.params?.nextauth?.[1] === "credentials") {
    const limited = enforceAuthRateLimit(req, "login");
    if (limited) return limited;
  }
  return handler(req, context);
}
