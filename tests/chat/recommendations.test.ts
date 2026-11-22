import test from "node:test";
import assert from "node:assert/strict";
import { allProducts, ask, ids, scriptedLLM } from "./helpers";
import { validateLLMReply } from "../../src/lib/skincare-chat/engine";

const HEADLINE = "I have oily skin and acne with dark spots. Suggest products under ₹1000.";

test("every recommended product exists in the catalog", async () => {
  const catalog = await allProducts();
  const known = new Set(catalog.map((p) => p.id));
  for (const q of [HEADLINE, "dry sensitive skin, need a moisturizer", "pigmentation and tanning, sunscreen", "I want anti ageing products"]) {
    const r = await ask(q);
    for (const rec of r.recommendations) {
      assert.ok(known.has(rec.productId), `${rec.productId} is not a catalog product (query: ${q})`);
      const real = catalog.find((p) => p.id === rec.productId)!;
      assert.equal(rec.name, real.name);
      assert.equal(rec.brand, real.brand);
      assert.equal(rec.image, real.image);
      assert.equal(rec.category, real.category);
      assert.equal(rec.rating?.value ?? null, real.rating);
    }
  }
});

test("prices on cards match catalog price records exactly", async () => {
  const catalog = await allProducts();
  const r = await ask(HEADLINE);
  assert.ok(r.recommendations.length > 0);
  for (const rec of r.recommendations) {
    const real = catalog.find((p) => p.id === rec.productId)!;
    assert.ok(real.price, "recommended under a budget implies a verified price");
    assert.equal(rec.price?.amount, real.price!.amount);
    assert.equal(rec.price?.platform, real.price!.platform);
  }
});

test("product links point to a real product page for a catalog id", async () => {
  const catalog = await allProducts();
  const r = await ask(HEADLINE);
  for (const rec of r.recommendations) {
    assert.match(rec.link, /^\/products\/[A-Za-z0-9_%-]+$/);
    const id = decodeURIComponent(rec.link.replace("/products/", ""));
    assert.ok(catalog.some((p) => p.id === id), `link ${rec.link} does not resolve to a catalog product`);
    assert.equal(id, rec.productId);
  }
});

test("skin concerns change the ranking", async () => {
  const acne = await ask("oily skin, acne and pimples");
  const spots = await ask("oily skin, dark spots and pigmentation");
  const dry = await ask("dry skin, dryness and dehydration");
  assert.ok(["p1", "p3", "p8", "p9"].includes(acne.recommendations[0].productId), `acne top = ${acne.recommendations[0].productId}`);
  assert.ok(["p6", "p4", "p1"].includes(spots.recommendations[0].productId), `spots top = ${spots.recommendations[0].productId}`);
  assert.ok(["p5", "p7", "p2", "p11"].includes(dry.recommendations[0].productId), `dry top = ${dry.recommendations[0].productId}`);
  assert.notDeepEqual(ids(acne), ids(spots));
  assert.notDeepEqual(ids(acne), ids(dry));
  // A product that directly lists the concern outranks one that does not.
  const acneScores = acne.recommendations.map((r) => r.score.concern);
  assert.deepEqual([...acneScores].sort((a, b) => b - a).slice(0, 1), [Math.max(...acneScores)]);
  assert.ok(acne.recommendations.every((r) => r.matchedConcerns.length > 0), "no product without a verified link to the concern");
});

test("products are ranked best first", async () => {
  const r = await ask(HEADLINE);
  const totals = r.recommendations.map((x) => x.score.total);
  assert.deepEqual(totals, [...totals].sort((a, b) => b - a));
});

test("skin type compatibility removes mismatched products", async () => {
  const r = await ask("sensitive skin with redness");
  const catalog = await allProducts();
  for (const rec of r.recommendations) {
    const p = catalog.find((c) => c.id === rec.productId)!;
    assert.ok(p.skinTypes.includes("Sensitive"), `${p.name} is not listed for sensitive skin`);
  }
});

test("budget filtering: every result is within budget and over-budget products are excluded", async () => {
  const r = await ask("oily skin with acne under ₹400");
  assert.ok(r.recommendations.length > 0);
  for (const rec of r.recommendations) assert.ok(rec.price!.amount <= 400, `${rec.name} costs ${rec.price!.amount}`);
  assert.equal(r.profile.budgetMax, 400);
  // The ₹2,700 BHA exfoliant fits oily/acne but must never appear under ₹1000.
  const wide = await ask(HEADLINE);
  assert.ok(!ids(wide).includes("p8"));
  // Products with no verified price cannot be shown as "within budget".
  const catalog = await allProducts();
  for (const rec of wide.recommendations) assert.ok(catalog.find((p) => p.id === rec.productId)!.price);
});

test("known allergens are excluded", async () => {
  const catalog = await allProducts();
  const r = await ask("I have oily acne-prone skin but I'm allergic to salicylic acid");
  assert.deepEqual(r.profile.allergens, ["salicylic acid"]);
  assert.ok(r.recommendations.length > 0);
  for (const rec of r.recommendations) {
    const p = catalog.find((c) => c.id === rec.productId)!;
    assert.ok(!p.ingredients.some((i) => /salicylic/i.test(i.name)), `${p.name} contains salicylic acid`);
  }
  assert.ok(!ids(r).some((id) => ["p3", "p8", "p9"].includes(id)));
});

test("fragrance avoidance only keeps fragrance-free products", async () => {
  const catalog = await allProducts();
  const r = await ask("dry skin, need a moisturizer. avoid fragrance please");
  for (const rec of r.recommendations) assert.equal(catalog.find((c) => c.id === rec.productId)!.fragranceFree, true);
  assert.ok(r.profile.allergens.includes("fragrance"));
});

test("allergens stay excluded in later turns without being repeated", async () => {
  const first = await ask("oily skin with acne, allergic to niacinamide");
  assert.ok(!ids(first).includes("p1"));
  const second = await ask("show me a serum", { profile: first.profile, lastProductIds: ids(first) });
  assert.ok(second.profile.allergens.includes("niacinamide"));
  assert.ok(!ids(second).includes("p1"));
});

test("empty results are reported honestly with no invented products", async () => {
  const r = await ask("oily skin with acne under ₹50");
  assert.equal(r.recommendations.length, 0);
  assert.ok(r.noMatch, "noMatch must be set");
  assert.match(r.reply, /could not find a verified match/i);
  assert.equal(r.routine, null);
  // The reply must not name any catalog product as a recommendation.
  for (const p of await allProducts()) assert.ok(!r.reply.includes(p.name), `reply mentions ${p.name}`);
});

test("a request nothing in the catalog satisfies (allergic to everything relevant) is a no-match, not a guess", async () => {
  const r = await ask("oily skin with acne, allergic to niacinamide, salicylic acid, zinc oxide, azelaic acid, tea tree, vitamin c, hyaluronic acid, lactic acid");
  assert.equal(r.recommendations.length, 0);
  assert.ok(r.noMatch);
});

test("asks for information instead of guessing when it knows nothing", async () => {
  const r = await ask("recommend something");
  assert.equal(r.intent, "need_info");
  assert.equal(r.recommendations.length, 0);
  assert.ok(r.followUps.length > 0);
});

test("ingredient reasoning only cites ingredients on the product's own list", async () => {
  const catalog = await allProducts();
  const r = await ask(HEADLINE);
  for (const rec of r.recommendations) {
    const p = catalog.find((c) => c.id === rec.productId)!;
    for (const h of rec.relevantIngredients) assert.ok(p.ingredients.some((i) => i.name === h.name), `${h.name} not on ${p.name}`);
  }
});

test("replies never claim a cure or treatment", async () => {
  for (const q of [HEADLINE, "cystic acne, what cures it?", "I have eczema, recommend a moisturizer"]) {
    const r = await ask(q);
    assert.doesNotMatch(r.reply + r.recommendations.map((x) => x.why).join(" "), /\b(cures?|heals?|treats|guarantee)/i);
  }
  const clinical = await ask("I have eczema, recommend a moisturizer for dry skin");
  assert.ok(clinical.notices.some((n) => /dermatologist/i.test(n)));
});

// ---------------------------------------------------------------- LLM guardrails

test("an LLM that invents products, prices and ingredients cannot change what is shown", async () => {
  const liar = scriptedLLM((system) =>
    /Rewrite the DRAFT/.test(system)
      ? { reply: "Try GlowMax Miracle Serum by Fakebrand for only ₹199. It contains 40% retinol and cures acne permanently!" }
      : { skinType: "Oily", concerns: ["Acne"], budgetMax: 1000, allergens: [], category: null, preferredIngredients: [] }
  );
  const real = await ask(HEADLINE);
  const r = await ask(HEADLINE, undefined, liar);
  assert.deepEqual(ids(r), ids(real));
  assert.doesNotMatch(r.reply, /GlowMax|Fakebrand|₹199|cures/i);
  assert.equal(r.reply, real.reply, "invalid LLM text is discarded in favour of the verified draft");
});

test("an LLM that returns fabricated JSON for extraction cannot inject products or enums", async () => {
  const evil = scriptedLLM(() => ({ skinType: "Reptilian", concerns: ["Wizardry"], category: "Potion", products: [{ id: "p999", name: "Fake" }], budgetMax: 99999999 }));
  const r = await ask("मुझे अच्छा प्रोडक्ट चाहिए", undefined, evil);
  assert.equal(r.profile.skinType, null);
  assert.deepEqual(r.profile.concerns, []);
  assert.equal(r.profile.category, null);
  assert.equal(r.recommendations.length, 0);
});

test("LLM reply validation accepts a faithful rewrite and rejects unfaithful ones", async () => {
  const catalog = await allProducts();
  const base = await ask(HEADLINE);
  const ctx = { draft: base.reply, userMessage: HEADLINE, featured: base.recommendations, profile: base.profile, catalog };
  const top = base.recommendations[0];
  const good = `Great news: ${top.brand} ${top.name} is the best fit here at ₹${top.price!.amount}, and it stays within your ₹1,000 budget. I can also compare the options if you like.`;
  assert.equal(validateLLMReply(good, ctx), good);
  assert.equal(validateLLMReply(good.replace(`₹${top.price!.amount}`, "₹10"), ctx), null, "wrong price");
  assert.equal(validateLLMReply(good + " It also contains Retinol.", ctx), null, "ingredient not in verified draft");
  assert.equal(validateLLMReply(good + " It treats acne.", ctx), null, "medical claim");
  const other = catalog.find((p) => !base.recommendations.some((r) => r.productId === p.id))!;
  assert.equal(validateLLMReply(good + ` Also consider ${other.name}.`, ctx), null, "product that was not retrieved");
  assert.equal(validateLLMReply(undefined, ctx), null);
});

test("a faithful LLM rewrite is used when it passes validation", async () => {
  const real = await ask(HEADLINE);
  const top = real.recommendations[0];
  const polite = scriptedLLM((system) =>
    /Rewrite the DRAFT/.test(system)
      ? { reply: `I'd start with ${top.brand} ${top.name} at ₹${top.price!.amount}; it ranks first for your oily, acne-prone skin and stays within ₹1000.` }
      : {}
  );
  const r = await ask(HEADLINE, undefined, polite);
  assert.equal(r.meta.llmUsed, true);
  assert.match(r.reply, /^I'd start with/);
  assert.deepEqual(ids(r), ids(real));
});
