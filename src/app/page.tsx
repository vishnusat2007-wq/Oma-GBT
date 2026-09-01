"use client";

import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  source?: "openai" | "fallback";
}

const SUGGESTIONS = [
  "Hi Oma!",
  "Tell me a joke",
  "I'm feeling stressed",
  "Suggest a simple recipe",
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello, dear! I'm Oma-GBT. Pull up a chair and tell me what's on your mind. ☕",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, source: data.source },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Oh dear, I couldn't reach my thoughts just now. Please try again in a moment. (" +
            (err instanceof Error ? err.message : "unknown error") +
            ")",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex h-dvh w-full max-w-2xl flex-col px-4 py-6">
      <header className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-amber-400 text-xl shadow-md">
          👵
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-tight">Oma-GBT</h1>
          <p className="text-xs text-black/60 dark:text-white/60">
            Your cozy grandmother-style assistant
          </p>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-black/10 bg-black/[.02] p-4 dark:border-white/10 dark:bg-white/[.03]"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                m.role === "user"
                  ? "rounded-br-sm bg-rose-500 text-white"
                  : "rounded-bl-sm bg-white text-black dark:bg-neutral-800 dark:text-white"
              }`}
            >
              {m.content}
              {m.source === "fallback" && (
                <span className="mt-1 block text-[10px] uppercase tracking-wide opacity-50">
                  offline mode
                </span>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-2.5 text-sm text-black/50 shadow-sm dark:bg-neutral-800 dark:text-white/50">
              Oma is thinking…
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => sendMessage(s)}
            disabled={loading}
            className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/70 transition hover:bg-black/5 disabled:opacity-40 dark:border-white/15 dark:text-white/70 dark:hover:bg-white/10"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        className="mt-3 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message for Oma…"
          className="flex-1 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-rose-400 dark:border-white/15 dark:bg-neutral-900"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-full bg-rose-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-rose-600 disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </main>
  );
}
