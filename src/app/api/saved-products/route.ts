import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth/session";
import { savedProductSchema } from "@/lib/auth/validation";
import { InputValidator } from "@/lib/security/input-validator";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { user, response } = await requireSessionUser();
    if (!user) return response!;

    const saved = await prisma.savedProduct.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const productIds = saved.map((item: any) => item.productId);
    const objectIdPattern = new RegExp("^[a-f\\d]{24}$", "i");
    const mongoIds = productIds.filter((id: string) => objectIdPattern.test(id));

    const products =
      productIds.length === 0
        ? []
        : await prisma.product.findMany({
            where: {
              OR: [
                ...(mongoIds.length > 0 ? [{ id: { in: mongoIds } }] : []),
                { slug: { in: productIds } },
                { legacyId: { in: productIds } },
              ],
            },
            select: {
              id: true,
              slug: true,
              legacyId: true,
              name: true,
              brand: true,
              image: true,
              category: true,
            },
          });

    const productByKey = new Map<string, (typeof products)[number]>();
    for (const product of products) {
      productByKey.set(product.id, product);
      productByKey.set(product.slug, product);
      if (product.legacyId) productByKey.set(product.legacyId, product);
    }

    return NextResponse.json({
      success: true,
      data: saved.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        createdAt: item.createdAt,
        product: productByKey.get(item.productId) || null,
      })),
    });
  } catch (error: unknown) {
    return InputValidator.createSafeErrorResponse(error, "Failed to load saved products.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, response } = await requireSessionUser();
    if (!user) return response!;

    const body = await req.json().catch(() => null);
    const { userId: _ignoredUserId, ...savedBody } = body && typeof body === "object" ? body : {};
    void _ignoredUserId;
    const parsed = savedProductSchema.safeParse(savedBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Valid productId is required." },
        },
        { status: 400 }
      );
    }

    const saved = await prisma.savedProduct.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId: parsed.data.productId,
        },
      },
      create: {
        userId: user.id,
        productId: parsed.data.productId,
      },
      update: {},
    });

    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error: unknown) {
    return InputValidator.createSafeErrorResponse(error, "Failed to save product.");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user, response } = await requireSessionUser();
    if (!user) return response!;

    const productId = req.nextUrl.searchParams.get("productId")?.trim();
    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "productId query parameter is required." },
        },
        { status: 400 }
      );
    }

    await prisma.savedProduct.deleteMany({
      where: { userId: user.id, productId },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return InputValidator.createSafeErrorResponse(error, "Failed to remove saved product.");
  }
}
