"use client";

import * as React from "react";

export interface AiClientStatus {
  configured: boolean;
  provider: string;
  model: string;
}

export function providerLabel(provider: string): string {
  if (provider === "gemini") return "Gemini";
  if (provider === "openai") return "OpenAI";
  if (provider === "mock") return "Local companion";
  return "Connected";
}

/** Reads the secret-free GET /api/chat status used by chat + parent dashboard. */
export function useAiStatus(): AiClientStatus | null {
  const [status, setStatus] = React.useState<AiClientStatus | null>(null);

  React.useEffect(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((d: { aiConfigured?: boolean; aiProvider?: string; aiModel?: string }) => {
        setStatus({
          configured: Boolean(d.aiConfigured),
          provider: typeof d.aiProvider === "string" ? d.aiProvider : "mock",
          model: typeof d.aiModel === "string" ? d.aiModel : "mock",
        });
      })
      .catch(() => setStatus({ configured: false, provider: "mock", model: "mock" }));
  }, []);

  return status;
}
