import { RetailerSyncService } from "../src/server/retailer-api/retailer-sync.service";

async function main() {
  console.log("==================================================================");
  console.log("⚡ Starting BeautyIQ Multi-Retailer API Product Synchronization");
  console.log("==================================================================");
  console.log("Connecting to live official store APIs:");
  console.log("  1. BeMinimalist (beminimalist.co/products.json)");
  console.log("  2. Dot & Key (dotandkey.com/products.json)");
  console.log("  3. The Derma Co (thedermaco.com/products.json)");
  console.log("  4. Plum Goodness (plumgoodness.com/products.json)");
  console.log("  5. Dr. Sheth's (drsheths.com/products.json)");
  console.log("Generating cross-website offers for:");
  console.log("  - Amazon India (amazon.in)");
  console.log("  - Flipkart (flipkart.com)");
  console.log("  - Nykaa (nykaa.com)");
  console.log("  - Myntra (myntra.com)");
  console.log("  - Purplle (purplle.com)");
  console.log("  - Tira Beauty (tirabeauty.com)");
  console.log("------------------------------------------------------------------");

  const stats = await RetailerSyncService.syncAllRetailerApis(15);

  console.log("\n✅ Sync Completed Successfully!");
  console.log(`📦 Total Products Synced: ${stats.totalImported}`);
  console.log(`🏷️  Total Cross-Store Listings Generated: ${stats.totalMarketplaceOffers}`);
  console.log("\nBreakdown by Source:");
  for (const s of stats.sources) {
    console.log(`  • ${s.name} (${s.domain}): ${s.count} products [${s.status.toUpperCase()}]`);
  }

  console.log("\nSample Synced Products:");
  for (const sample of stats.sampleProducts) {
    console.log(`  - [${sample.brand}] ${sample.name} (${sample.category})`);
    console.log(`    Direct URL: ${sample.directBuyUrl}`);
  }
  console.log("==================================================================");
}

main().catch((err) => {
  console.error("❌ Sync failed with error:", err);
  process.exit(1);
});
