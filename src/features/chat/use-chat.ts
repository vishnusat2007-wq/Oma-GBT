"use client";

import * as React from "react";
import { useAppStore } from "@/lib/store/app-store";
import { extractMemories, memoryExists } from "./memory-extract";
import { detectToolIntent, TOOLS, type ToolProposal } from "@/lib/tools/registry";
import type { AiChatMessage } from "@/lib/ai/types";
import type { SafetyCategory } from "@/lib/data/types";

export interface ChatSafetyInfo {
  category: SafetyCategory | "";
  action: string;
  urgent: boolean;
}

export function useCompanionChat(conversationId: string) {
  const messages = useAppStore((s) => s.messages);
  const companion = useAppStore((s) => s.companion);
  const profile = useAppStore((s) => s.profile);
  const memories = useAppStore((s) => s.memories);
  const addMessage = useAppStore((s) => s.addMessage);
  const addMemory = useAppStore((s) => s.addMemory);
  const addSafetyEvent = useAppStore((s) => s.addSafetyEvent);
  const requestTool = useAppStore((s) => s.requestTool);
  const onlineEnabled = useAppStore((s) => s.onlineToolsEnabled());

  const [streamingText, setStreamingText] = React.useState("");
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [safety, setSafety] = React.useState<ChatSafetyInfo | null>(null);
  const [pendingProposal, setPendingProposal] = React.useState<ToolProposal | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  const lastSourceRef = React.useRef<string>("mock");

  const convoMessages = React.useMemo(
    () =>
      messages
        .filter((m) => m.conversationId === conversationId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [messages, conversationId],
  );

  const runStream = React.useCallback(
    async (history: AiChatMessage[]) => {
      setIsStreaming(true);
      setError(null);
      setSafety(null);
      setStreamingText("");
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            messages: history,
            context: {
              companionName: companion.name,
              childName: profile.displayName,
              ageRange: profile.ageRange,
              personality: companion.personality,
              interests: companion.interests,
              memories: memories.map((m) => ({ key: m.key, value: m.value })),
            },
          }),
        });

        lastSourceRef.current = res.headers.get("x-omgbt-source") ?? "mock";
        const safetyCat = res.headers.get("x-omgbt-safety");
        if (res.headers.get("x-omgbt-source") === "safety") {
          const info: ChatSafetyInfo = {
            category: (safetyCat as SafetyCategory) ?? "",
            action: res.headers.get("x-omgbt-action") ?? "redirected",
            urgent: res.headers.get("x-omgbt-urgent") === "true",
          };
          setSafety(info);
          if (info.category) {
            addSafetyEvent({
              category: info.category as SafetyCategory,
              action: (info.action as "redirected" | "refused" | "encouraged-adult") ?? "redirected",
            });
          }
        }

        if (!res.ok || !res.body) {
          throw new Error("no-stream");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setStreamingText(acc);
        }

        addMessage({
          conversationId,
          role: "assistant",
          content: acc.trim() || "…",
          kind: "text",
          aiGenerated: lastSourceRef.current !== "safety",
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          if (streamingTextRef.current.trim()) {
            addMessage({
              conversationId,
              role: "assistant",
              content: streamingTextRef.current.trim(),
              kind: "text",
              aiGenerated: true,
            });
          }
        } else {
          setError("Oops! I couldn't reply just now. Want to try again?");
        }
      } finally {
        setIsStreaming(false);
        setStreamingText("");
        abortRef.current = null;
      }
    },
    [companion, profile, memories, conversationId, addMessage, addSafetyEvent],
  );

  // keep a ref of streamingText for abort handler
  const streamingTextRef = React.useRef("");
  React.useEffect(() => {
    streamingTextRef.current = streamingText;
  }, [streamingText]);

  const buildHistory = React.useCallback(
    (extra?: AiChatMessage): AiChatMessage[] => {
      const base: AiChatMessage[] = convoMessages
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
      return extra ? [...base, extra] : base;
    },
    [convoMessages],
  );

  const send = React.useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      addMessage({ conversationId, role: "user", content: trimmed, kind: "text" });

      // Safe memory capture.
      for (const mem of extractMemories(trimmed)) {
        if (!memoryExists(memories, mem)) {
          addMemory({ ...mem, source: "child" });
        }
      }

      // Tool proposal (never auto-runs).
      const proposal = detectToolIntent(trimmed);
      if (proposal) {
        const def = TOOLS[proposal.tool];
        if (!def.online || onlineEnabled) {
          setPendingProposal(proposal);
        }
      }

      await runStream(buildHistory({ role: "user", content: trimmed }));
    },
    [
      isStreaming,
      addMessage,
      conversationId,
      memories,
      addMemory,
      onlineEnabled,
      runStream,
      buildHistory,
    ],
  );

  const stop = React.useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const regenerate = React.useCallback(async () => {
    if (isStreaming) return;
    const lastUser = [...convoMessages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    const history = convoMessages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
    // drop trailing assistant messages after the last user turn
    const lastUserIdx = history.map((h) => h.role).lastIndexOf("user");
    await runStream(history.slice(0, lastUserIdx + 1));
  }, [isStreaming, convoMessages, runStream]);

  const confirmProposal = React.useCallback(
    (proposal: ToolProposal) => {
      const def = TOOLS[proposal.tool];
      requestTool({
        tool: proposal.tool,
        summary: proposal.summary,
        args: proposal.args,
        requiresApproval: def.requiresApproval,
      });
      setPendingProposal(null);
    },
    [requestTool],
  );

  const dismissProposal = React.useCallback(() => setPendingProposal(null), []);

  return {
    messages: convoMessages,
    streamingText,
    isStreaming,
    error,
    safety,
    pendingProposal,
    source: lastSourceRef.current,
    send,
    stop,
    regenerate,
    confirmProposal,
    dismissProposal,
  };
}
