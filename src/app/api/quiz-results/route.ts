import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth/session";
import { quizResultSchema } from "@/lib/auth/validation";
import { InputValidator } from "@/lib/security/input-validator";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { user, response } = await requireSessionUser();
    if (!user) return response!;

    const results = await prisma.quizResult.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: results });
  } catch (error: unknown) {
    return InputValidator.createSafeErrorResponse(error, "Failed to load quiz results.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, response } = await requireSessionUser();
    if (!user) return response!;

    const body = await req.json().catch(() => null);
    const { userId: _ignoredUserId, ...quizBody } = body && typeof body === "object" ? body : {};
    void _ignoredUserId;
    const parsed = quizResultSchema.safeParse(quizBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Quiz answers are required." },
        },
        { status: 400 }
      );
    }

    const result = await prisma.quizResult.create({
      data: {
        userId: user.id,
        answers: parsed.data.answers as object,
      },
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: unknown) {
    return InputValidator.createSafeErrorResponse(error, "Failed to save quiz results.");
  }
}
