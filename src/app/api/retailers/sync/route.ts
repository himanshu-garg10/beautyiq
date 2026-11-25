import { NextRequest, NextResponse } from "next/server";
import { RetailerSyncService } from "@/server/retailer-api/retailer-sync.service";
import { BRAND_STORE_APIS } from "@/server/retailer-api/shopify-brand-api";
import { RETAILER_PLATFORMS } from "@/services/retailer-aggregator.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { products } = await import("@/data/products");

    const brandSources = BRAND_STORE_APIS.map((b) => ({
      id: b.brandId,
      name: b.brandName,
      type: "Shopify Direct REST API",
      domain: b.storeDomain,
      status: "online",
      endpoint: `${b.baseUrl}/products.json`,
    }));

    const marketplaceSources = RETAILER_PLATFORMS.map((m) => ({
      id: m.id,
      name: m.name,
      type: "Marketplace Price & Catalog Feed",
      domain: m.domain,
      status: "online",
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalProductsInCatalog: products.length,
        supportedApis: {
          brandStores: brandSources,
          marketplaces: marketplaceSources,
        },
        message: "Retailer API sync service is online and ready.",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load sync status" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const limitPerBrand = typeof body.limit === "number" ? Math.min(body.limit, 50) : 12;

    const stats = await RetailerSyncService.syncAllRetailerApis(limitPerBrand);

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${stats.totalImported} products from brand APIs with ${stats.totalMarketplaceOffers} comparative offers across Amazon, Flipkart, Nykaa, Myntra, Purplle, Tira & Brand Stores.`,
      data: stats,
    });
  } catch (error: any) {
    console.error("[API Retailer Sync Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to sync retailer products" },
      { status: 500 }
    );
  }
}
