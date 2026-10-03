import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth/session";
import { InputValidator } from "@/lib/security/input-validator";

export async function DELETE() {
  try {
    const { user, response } = await requireSessionUser();
    if (!user) return response!;

    await prisma.$transaction([
      prisma.savedProduct.deleteMany({ where: { userId: user.id } }),
      prisma.quizResult.deleteMany({ where: { userId: user.id } }),
      prisma.skinProfile.deleteMany({ where: { userId: user.id } }),
      prisma.user.delete({ where: { id: user.id } }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Account and related data have been permanently deleted.",
    });
  } catch (error: unknown) {
    return InputValidator.createSafeErrorResponse(error, "Failed to delete account.");
  }
}
