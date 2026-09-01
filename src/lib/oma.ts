export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export const OMA_SYSTEM_PROMPT =
  "You are Oma-GBT, a warm, patient, and endlessly encouraging grandmother-style " +
  "assistant. You explain things simply, sprinkle in a little cozy warmth, and " +
  "always stay kind and practical. Keep answers concise unless asked for detail.";

/**
 * Deterministic, dependency-free assistant used when no OPENAI_API_KEY is set.
 * Kept pure so it can be tested and reused on the server without network access.
 */
export function omaFallbackReply(message: string): string {
  const text = message.trim();
  const lower = text.toLowerCase();

  if (!text) {
    return "I'm right here, dear. What would you like to talk about?";
  }

  if (/\b(hi|hello|hey|good morning|good evening|hallo)\b/.test(lower)) {
    return "Hello, sweetheart! It's so lovely to hear from you. How can Oma help today?";
  }

  if (lower.includes("your name") || lower.includes("who are you")) {
    return "I'm Oma-GBT, your cozy little assistant. Think of me as a grandma who happens to know a lot of things.";
  }

  if (lower.includes("recipe") || lower.includes("cook") || lower.includes("bake")) {
    return (
      "Ooh, cooking! My favourite. Start simple: good ingredients, a warm pan, and a " +
      "little patience. Tell me what you have in the kitchen and I'll suggest something."
    );
  }

  if (lower.includes("joke") || lower.includes("funny")) {
    return "Why did the cookie go to the doctor? Because it was feeling crumbly! Now, don't you feel better already?";
  }

  if (lower.includes("time") || lower.includes("date")) {
    return `Right now it's ${new Date().toLocaleString()}. Don't forget to take a little break, dear.`;
  }

  if (lower.includes("advice") || lower.includes("help") || lower.includes("sad") || lower.includes("stressed")) {
    return (
      "Take a deep breath, love. One small step at a time. You've handled hard days " +
      "before, and you'll handle this one too. I'm proud of you."
    );
  }

  if (lower.endsWith("?")) {
    return (
      `That's a thoughtful question about "${text.replace(/\?+$/, "")}". ` +
      "I don't have all the world's knowledge without my thinking cap (an OpenAI key), " +
      "but here's my grandmotherly take: break it into small pieces and tackle the first one."
    );
  }

  return `You said: "${text}". Tell me more, dear — I'm listening. ` +
    "(Tip: set an OPENAI_API_KEY to give Oma a full brain.)";
}

interface OpenAIChatChoice {
  message?: { content?: string };
}

interface OpenAIChatResponse {
  choices?: OpenAIChatChoice[];
  error?: { message?: string };
}

/**
 * Produce an assistant reply. Uses OpenAI when OPENAI_API_KEY is configured,
 * otherwise falls back to the deterministic local persona so the app works
 * end-to-end with zero secrets.
 */
export async function generateOmaReply(messages: ChatMessage[]): Promise<{
  reply: string;
  source: "openai" | "fallback";
}> {
  const apiKey = process.env.OPENAI_API_KEY;
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const lastUserContent = lastUser?.content ?? "";

  if (!apiKey) {
    return { reply: omaFallbackReply(lastUserContent), source: "fallback" };
  }

  try {
    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: OMA_SYSTEM_PROMPT },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.7,
      }),
    });

    const data = (await res.json()) as OpenAIChatResponse;
    if (!res.ok) {
      throw new Error(data.error?.message ?? `OpenAI request failed (${res.status})`);
    }

    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      throw new Error("OpenAI returned an empty response");
    }
    return { reply, source: "openai" };
  } catch {
    return { reply: omaFallbackReply(lastUserContent), source: "fallback" };
  }
}
