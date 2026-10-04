import { importOpenBeautyFacts } from "../src/server/open-beauty-facts-importer";

async function main() {
  const query = process.argv.slice(2).join(" ").trim() || "skincare";
  const result = await importOpenBeautyFacts(query);
  console.log(`Imported or refreshed ${result.imported} of ${result.received} source products for query: ${query}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
