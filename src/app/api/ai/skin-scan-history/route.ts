import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser, unauthorizedResponse } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, response } = await requireSessionUser();
  if (!user) return response ?? unauthorizedResponse();

  const scans = await prisma.skinScan.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      skinType: true,
      concerns: true,
      summary: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ success: true, data: scans });
}

export async function DELETE(request: NextRequest) {
  const { user, response } = await requireSessionUser();
  if (!user) return response ?? unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const scanId = searchParams.get("scanId");

  if (!scanId) {
    return NextResponse.json(
      { success: false, error: { code: "MISSING_SCAN_ID", message: "scanId is required." } },
      { status: 400 }
    );
  }

  const scan = await prisma.skinScan.findFirst({
    where: { id: scanId, userId: user.id },
  });

  if (!scan) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "Scan not found." } },
      { status: 404 }
    );
  }

  await prisma.skinScan.delete({ where: { id: scanId } });

  return NextResponse.json({ success: true });
}
