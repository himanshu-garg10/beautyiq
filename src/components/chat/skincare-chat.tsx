"use client";

import * as React from "react";
import { Loader2, RotateCcw, Send, ShieldCheck, Sparkles, X } from "lucide-react";
import type { ChatResponse, ChatSkinProfile } from "@/lib/skincare-chat/types";
import { EMPTY_PROFILE } from "@/lib/skincare-chat/types";
import { useAuth } from "@/context/auth-context";
import { useSkinProfile } from "@/context/skin-profile-context";
import { ChatProductCard } from "./chat-product-card";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  response?: ChatResponse;
  error?: boolean;
}

const STORAGE_KEY = "beautyiq_skincare_chat_v1";
const GREETING =
  "Hi, I'm BeautyIQ. Tell me your skin type and what you'd like to improve, plus a budget or any ingredients you react to, and I'll recommend real products from our catalog and explain why. You can ask follow-ups any time.";

const STARTERS = [
  "I have oily skin and acne with dark spots. Suggest products under ₹1000.",
  "Dry, sensitive skin — recommend a fragrance-free moisturizer",
  "Sunscreen for oily skin, avoid fragrance",
];

const uid = () => Math.random().toString(36).slice(2, 10);

function loadSaved(): { messages: Message[]; profile: ChatSkinProfile } | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function SkincareChat({ initialQuery }: { initialQuery?: string }) {
  const { isAuthenticated } = useAuth();
  const { profile: savedProfile } = useSkinProfile();

  const [messages, setMessages] = React.useState<Message[]>([]);
  const [profile, setProfile] = React.useState<ChatSkinProfile>(EMPTY_PROFILE);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const started = React.useRef(false);

  // Restore the session, or seed the profile from the signed-in user's saved skin profile.
  React.useEffect(() => {
    if (started.current) return;
    started.current = true;
    const saved = loadSaved();
    let seeded: ChatSkinProfile | undefined;
    if (saved && saved.messages?.length) {
      setMessages(saved.messages);
      setProfile({ ...EMPTY_PROFILE, ...saved.profile });
    } else if (isAuthenticated && savedProfile?.isOnboardingComplete) {
      seeded = {
        ...EMPTY_PROFILE,
        skinType: savedProfile.skinType,
        concerns: savedProfile.concerns.slice(0, 6),
        budgetMax: savedProfile.budget?.max && savedProfile.budget.max < 100000 ? savedProfile.budget.max : null,
        allergens: [
          ...(savedProfile.fragrancePreference === "Fragrance free" ? ["fragrance"] : []),
          ...savedProfile.avoidIngredients.map((s) => s.toLowerCase()),
        ].slice(0, 8),
      };
      setProfile(seeded);
    }
    if (initialQuery && !saved?.messages?.length) void send(initialQuery, { fresh: true, profileOverride: seeded });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ messages: messages.slice(-30), profile }));
    } catch {
      /* storage unavailable: the chat still works, it just won't survive a refresh */
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, profile]);

  async function send(text: string, opts: { fresh?: boolean; profileOverride?: ChatSkinProfile } = {}) {
    const message = text.trim();
    if (!message || loading) return;
    const history = opts.fresh ? [] : messages;
    const userMsg: Message = { id: uid(), role: "user", content: message };
    setMessages([...history, userMsg]);
    setInput("");
    setLoading(true);

    const lastAssistant = [...history].reverse().find((m) => m.role === "assistant" && m.response?.recommendations.length);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
          profile: opts.profileOverride ?? profile,
          lastProductIds: lastAssistant?.response?.recommendations.map((r) => r.productId) ?? [],
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        const reason = res.status === 429 ? "You're sending messages quickly. Please wait a few seconds and try again." : data?.message || "Something went wrong reaching the catalog. Please try again.";
        setMessages((prev) => [...prev, { id: uid(), role: "assistant", content: reason, error: true }]);
      } else {
        const response = data as ChatResponse;
        setProfile(response.profile);
        setMessages((prev) => [...prev, { id: uid(), role: "assistant", content: response.reply, response }]);
      }
    } catch {
      setMessages((prev) => [...prev, { id: uid(), role: "assistant", content: "I couldn't connect right now. Please check your connection and try again.", error: true }]);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setMessages([]);
    setProfile(EMPTY_PROFILE);
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }

  const chips: { key: string; label: string; remove: () => void }[] = [
    ...(profile.skinType ? [{ key: "skin", label: `${profile.skinType} skin`, remove: () => setProfile({ ...profile, skinType: null }) }] : []),
    ...profile.concerns.map((c) => ({ key: `c-${c}`, label: c, remove: () => setProfile({ ...profile, concerns: profile.concerns.filter((x) => x !== c) }) })),
    ...(profile.budgetMax ? [{ key: "budget", label: `Under ₹${profile.budgetMax.toLocaleString("en-IN")}`, remove: () => setProfile({ ...profile, budgetMax: null }) }] : []),
    ...(profile.category ? [{ key: "cat", label: `Looking for: ${profile.category}`, remove: () => setProfile({ ...profile, category: null }) }] : []),
    ...profile.allergens.map((a) => ({ key: `a-${a}`, label: `Avoid ${a}`, remove: () => setProfile({ ...profile, allergens: profile.allergens.filter((x) => x !== a) }) })),
  ];

  const lastIndex = messages.length - 1;

  return (
    <section aria-label="BeautyIQ skincare chat" className="overflow-hidden rounded-3xl border border-line bg-background-card shadow-lg">
      {/* Profile the assistant remembers */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-background-elevated/60 px-4 py-3">
        <span className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-champagne-deep">Your skin profile</span>
        {chips.length === 0 && <span className="text-xs text-foreground-faint">I&apos;ll remember what you tell me, so you don&apos;t have to repeat it.</span>}
        {chips.map((chip) => (
          <span key={chip.key} className="inline-flex items-center gap-1 rounded-full border border-line bg-background-card px-2.5 py-1 text-xs font-medium text-foreground">
            {chip.label}
            <button type="button" onClick={chip.remove} aria-label={`Remove ${chip.label}`} className="text-foreground-faint hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {messages.length > 0 && (
          <button type="button" onClick={reset} className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-foreground-muted hover:text-foreground">
            <RotateCcw className="h-3.5 w-3.5" /> Start over
          </button>
        )}
      </div>

      {/* Conversation */}
      <div className="max-h-[70vh] min-h-[22rem] space-y-5 overflow-y-auto px-4 py-5 sm:px-6" aria-live="polite">
        <AssistantBubble>{GREETING}</AssistantBubble>
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 pl-12">
            {STARTERS.map((s) => (
              <button key={s} type="button" onClick={() => void send(s)} className="rounded border border-line/60 bg-background-elevated px-3 py-1.5 text-left text-xs text-foreground-muted transition-all hover:bg-sage-tint hover:text-sage-deep">
                &quot;{s}&quot;
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-foreground px-4 py-2.5 text-sm leading-relaxed text-background dark:bg-sage-deep dark:text-white">{m.content}</div>
            </div>
          ) : (
            <AssistantMessage key={m.id} message={m} isLast={i === lastIndex} onFollowUp={(q) => void send(q)} />
          )
        )}

        {loading && (
          <AssistantBubble>
            <span className="inline-flex items-center gap-2 text-foreground-muted">
              <Loader2 className="h-4 w-4 animate-spin" /> Checking the BeautyIQ catalog…
            </span>
          </AssistantBubble>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="flex items-end gap-2 border-t border-line bg-background-card p-3 sm:p-4"
      >
        <label htmlFor="skincare-chat-input" className="sr-only">Message BeautyIQ</label>
        <textarea
          id="skincare-chat-input"
          value={input}
          rows={1}
          maxLength={800}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
          placeholder="Describe your skin, or ask a follow-up (e.g. “suggest a cheaper alternative”)"
          className="min-h-[2.75rem] flex-1 resize-none rounded-xl border border-line bg-background-elevated px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-faint focus:border-sage-deep focus:outline-none focus:ring-2 focus:ring-sage-deep/30"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sage-deep text-white transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </section>
  );
}

function AssistantBubble({ children, error }: { children: React.ReactNode; error?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background shadow-sm">
        <Sparkles className="h-4 w-4 text-champagne" />
      </div>
      <div className={cn("max-w-[85%] whitespace-pre-line rounded-2xl rounded-tl-sm bg-background-elevated px-4 py-3 text-sm leading-relaxed", error ? "text-status-error" : "text-foreground")}>{children}</div>
    </div>
  );
}

function AssistantMessage({ message, isLast, onFollowUp }: { message: Message; isLast: boolean; onFollowUp: (q: string) => void }) {
  const r = message.response;
  return (
    <div className="space-y-3">
      <AssistantBubble error={message.error}>{message.content}</AssistantBubble>

      {r?.noMatch && (
        <div className="ml-12 rounded-2xl border border-status-warning/40 bg-status-warning-bg/40 p-4 text-sm text-foreground">
          <p className="font-semibold">No verified match found</p>
          <p className="mt-1 text-foreground-muted">{r.noMatch.reason}</p>
          {r.noMatch.suggestions.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-foreground-muted">
              {r.noMatch.suggestions.map((s) => <li key={s}>{s}</li>)}
            </ul>
          )}
        </div>
      )}

      {r?.routine && (
        <ol className="ml-12 space-y-4">
          {r.routine.map((slot, i) => (
            <li key={slot.step} className="rounded-2xl border border-line bg-background-elevated/40 p-3">
              <p className="text-sm font-semibold text-foreground">
                {i + 1}. {slot.step} <span className="font-normal text-foreground-muted">· {slot.guidance}</span>
              </p>
              {slot.recommendation ? (
                <div className="mt-3 max-w-sm"><ChatProductCard rec={slot.recommendation} /></div>
              ) : (
                <p className="mt-2 text-xs text-foreground-muted">No verified match in the catalog for this step with your profile.</p>
              )}
            </li>
          ))}
        </ol>
      )}

      {r?.comparison && r.recommendations.length > 0 && (
        <div className="ml-12 space-y-3">
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[32rem] text-left text-xs">
              <thead className="bg-background-elevated">
                <tr>
                  <th className="px-3 py-2 font-semibold text-foreground-muted">&nbsp;</th>
                  {r.recommendations.map((c) => <th key={c.productId} className="px-3 py-2 font-semibold text-foreground">{c.brand} {c.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {r.comparison.rows.map((row) => (
                  <tr key={row.label} className="border-t border-line/60">
                    <th scope="row" className="px-3 py-2 font-medium text-foreground-muted">{row.label}</th>
                    {row.values.map((v, i) => <td key={i} className="px-3 py-2 text-foreground">{v ?? "—"}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">{r.recommendations.map((c) => <ChatProductCard key={c.productId} rec={c} />)}</div>
        </div>
      )}

      {r && !r.routine && !r.comparison && r.recommendations.length > 0 && (
        <div className="ml-0 grid gap-4 pl-0 sm:ml-12 sm:grid-cols-2">
          {r.recommendations.map((c, i) => <ChatProductCard key={c.productId} rec={c} rank={r.recommendations.length > 1 ? i + 1 : undefined} />)}
        </div>
      )}

      {r && r.notices.length > 0 && (
        <div className="ml-12 space-y-1 text-[0.72rem] leading-snug text-foreground-faint">
          {r.notices.map((n) => (
            <p key={n} className="flex items-start gap-1.5"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage-deep" aria-hidden />{n}</p>
          ))}
        </div>
      )}

      {isLast && r && r.followUps.length > 0 && (
        <div className="flex flex-wrap gap-2 pl-12">
          {r.followUps.map((f) => (
            <button key={f} type="button" onClick={() => onFollowUp(f)} className="rounded-full border border-line bg-background-card px-3 py-1.5 text-xs font-medium text-foreground-muted transition-all hover:border-sage-deep hover:bg-sage-tint hover:text-sage-deep">
              {f}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
