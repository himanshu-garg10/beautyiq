import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signupSchema } from "@/lib/auth/validation";
import { enforceAuthRateLimit } from "@/lib/auth/rate-limit";
import { InputValidator } from "@/lib/security/input-validator";
import { createUser } from "@/lib/auth/user-store";

const BCRYPT_COST = 10;

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

export async function POST(req: NextRequest) {
  try {
    const limited = enforceAuthRateLimit(req, "signup");
    if (limited) return limited;

    const body = await req.json().catch(() => null);
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "Invalid signup details.";
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message } },
        { status: 400 }
      );
    }

    const { name, password } = parsed.data;
    const email = parsed.data.email.trim().toLowerCase();

    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

    const user = await createUser({
      name: InputValidator.sanitizeString(name),
      email,
      passwordHash,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "EMAIL_IN_USE", message: "Could not create account. Please try a different email or log in." },
        },
        { status: 409 }
      );
    }
    return InputValidator.createSafeErrorResponse(error, "Failed to create account.");
  }
}
