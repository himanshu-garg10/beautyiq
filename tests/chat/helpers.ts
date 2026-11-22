import { createSeedCatalog } from "../../src/lib/skincare-chat/catalog";
import { handleChatTurn } from "../../src/lib/skincare-chat/engine";
import type { ChatResponse, CatalogProduct, ChatSkinProfile } from "../../src/lib/skincare-chat/types";
import type { LLMProvider } from "../../src/lib/skincare-chat/llm";

export const catalog = createSeedCatalog();

export async function allProducts(): Promise<CatalogProduct[]> {
  return catalog.getProducts();
}

/** Rule-based turn (no LLM) against the catalog seed records. */
export function ask(message: string, state?: { profile?: ChatSkinProfile; lastProductIds?: string[] }, llm: LLMProvider | null = null): Promise<ChatResponse> {
  return handleChatTurn({ message, profile: state?.profile, lastProductIds: state?.lastProductIds }, { catalog, llm });
}

/** A scripted LLM used to prove the guardrails: it returns whatever the test tells it to. */
export function scriptedLLM(responder: (system: string, user: string) => unknown): LLMProvider {
  return {
    name: "scripted",
    async generateJson({ system, user }) {
      return responder(system, user);
    },
  };
}

export const ids = (r: ChatResponse) => r.recommendations.map((x) => x.productId);
