/**
 * Configurable LLM provider for the skincare chat.
 *
 * AI_ENGINE_PROVIDER = gemini | openai | anthropic | internal-rule-based (alias: none)
 *   - unset: Gemini if GEMINI_API_KEY exists (the provider AI Match already used), otherwise rule-based.
 * AI_MODEL overrides the model; GEMINI_MODEL still works for Gemini. AI_TIMEOUT_MS bounds each call.
 * OPENAI_BASE_URL lets "openai" point at any OpenAI-compatible endpoint.
 *
 * The LLM is optional. Without it the chat is fully functional using deterministic extraction,
 * ranking and templated replies. With it, the LLM (a) helps understand free-form messages and
 * (b) rewrites the reply; neither can introduce product facts (see engine.ts validation).
 */

export interface LLMProvider {
  readonly name: string;
  /** Returns parsed JSON, or null on any failure/timeout (callers must always have a fallback). */
  generateJson(args: { system: string; user: string; maxTokens?: number }): Promise<unknown | null>;
}

function timeoutMs(): number {
  const n = Number(process.env.AI_TIMEOUT_MS);
  return Number.isFinite(n) && n >= 1000 ? n : 8000;
}

function parseJsonLoose(text: string): unknown | null {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function postJson(url: string, headers: Record<string, string>, body: unknown): Promise<any | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs());
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body), signal: controller.signal });
    if (!res.ok) {
      console.error(`Skincare chat LLM request failed: HTTP ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("Skincare chat LLM request error", (err as Error)?.name || err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

class GeminiProvider implements LLMProvider {
  readonly name = "gemini";
  constructor(private key: string, private model: string) {}
  async generateJson({ system, user, maxTokens = 700 }: { system: string; user: string; maxTokens?: number }) {
    const payload = await postJson(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent`,
      { "x-goog-api-key": this.key },
      {
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: maxTokens, responseMimeType: "application/json" },
      }
    );
    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof text === "string" ? parseJsonLoose(text) : null;
  }
}

class OpenAIProvider implements LLMProvider {
  readonly name = "openai";
  constructor(private key: string, private model: string, private baseUrl: string) {}
  async generateJson({ system, user, maxTokens = 700 }: { system: string; user: string; maxTokens?: number }) {
    const payload = await postJson(
      `${this.baseUrl.replace(/\/$/, "")}/chat/completions`,
      { Authorization: `Bearer ${this.key}` },
      {
        model: this.model,
        temperature: 0.2,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
      }
    );
    const text = payload?.choices?.[0]?.message?.content;
    return typeof text === "string" ? parseJsonLoose(text) : null;
  }
}

class AnthropicProvider implements LLMProvider {
  readonly name = "anthropic";
  constructor(private key: string, private model: string) {}
  async generateJson({ system, user, maxTokens = 700 }: { system: string; user: string; maxTokens?: number }) {
    const payload = await postJson(
      "https://api.anthropic.com/v1/messages",
      { "x-api-key": this.key, "anthropic-version": "2023-06-01" },
      { model: this.model, max_tokens: maxTokens, temperature: 0.2, system: `${system}\nRespond with a single JSON object only.`, messages: [{ role: "user", content: user }] }
    );
    const text = payload?.content?.find?.((b: any) => b?.type === "text")?.text;
    return typeof text === "string" ? parseJsonLoose(text) : null;
  }
}

export function getLLMProvider(env: NodeJS.ProcessEnv = process.env): LLMProvider | null {
  const configured = (env.AI_ENGINE_PROVIDER || "").trim().toLowerCase();
  const provider = configured || (env.GEMINI_API_KEY ? "gemini" : "none");
  const model = env.AI_MODEL?.trim();
  switch (provider) {
    case "gemini":
      return env.GEMINI_API_KEY ? new GeminiProvider(env.GEMINI_API_KEY, model || env.GEMINI_MODEL || "gemini-2.5-flash-lite") : null;
    case "openai":
      return env.OPENAI_API_KEY ? new OpenAIProvider(env.OPENAI_API_KEY, model || "gpt-4o-mini", env.OPENAI_BASE_URL || "https://api.openai.com/v1") : null;
    case "anthropic":
      return env.ANTHROPIC_API_KEY ? new AnthropicProvider(env.ANTHROPIC_API_KEY, model || "claude-haiku-5-5") : null;
    default:
      return null;
  }
}
