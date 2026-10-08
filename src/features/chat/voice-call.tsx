"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mascot, type MascotMood } from "@/components/mascot/mascot";
import { cn } from "@/lib/utils";
import {
  getRecognition,
  speechSupported,
  ttsSupported,
  speak,
  stopSpeaking,
  parseTranscript,
} from "./speech";
import type { CompanionConfig, ChildProfile } from "@/lib/data/types";
import type { useCompanionChat } from "./use-chat";

type CallStatus = "idle" | "listening" | "thinking" | "speaking";

export function VoiceCall({
  chat,
  companion,
  profile,
  onClose,
}: {
  chat: ReturnType<typeof useCompanionChat>;
  companion: CompanionConfig;
  profile: ChildProfile;
  onClose: () => void;
}) {
  const supported = React.useMemo(() => speechSupported(), []);
  const canSpeak = React.useMemo(() => ttsSupported(), []);

  const [status, setStatus] = React.useState<CallStatus>("idle");
  const [userCaption, setUserCaption] = React.useState("");
  const [agentCaption, setAgentCaption] = React.useState("");
  const [muted, setMuted] = React.useState(false);

  const nameContext = React.useMemo(
    () => ({ childName: profile.displayName }),
    [profile.displayName],
  );
  const activeRef = React.useRef(true);
  const recRef = React.useRef<ReturnType<typeof getRecognition>>(null);
  const finalRef = React.useRef("");
  const spokenIdRef = React.useRef<string>("");
  const chatRef = React.useRef(chat);
  const companionRef = React.useRef(companion);
  const startRef = React.useRef<() => void>(() => {});

  const stopRecognition = React.useCallback(() => {
    const rec = recRef.current;
    recRef.current = null;
    try {
      rec?.stop();
    } catch {
      /* ignore */
    }
  }, []);

  const submit = React.useCallback((text: string) => {
    setStatus("thinking");
    setAgentCaption("");
    void chatRef.current.send(text);
  }, []);

  const startListening = React.useCallback(() => {
    if (!activeRef.current || !supported) return;
    stopSpeaking();
    const rec = getRecognition(true);
    if (!rec) {
      setStatus("idle");
      return;
    }
    recRef.current = rec;
    finalRef.current = "";
    setUserCaption("");
    setStatus("listening");
    rec.onresult = (e) => {
      const { interim, final } = parseTranscript(e);
      if (final) finalRef.current = final;
      setUserCaption(final || interim);
    };
    rec.onerror = () => {
      /* handled by onend */
    };
    rec.onend = () => {
      recRef.current = null;
      if (!activeRef.current) return;
      const f = finalRef.current.trim();
      if (f) submit(f);
      else setStatus("idle");
    };
    try {
      rec.start();
    } catch {
      setStatus("idle");
    }
  }, [supported, submit]);

  // Keep refs in sync after each render (avoids writing refs during render).
  React.useEffect(() => {
    chatRef.current = chat;
    companionRef.current = companion;
    startRef.current = startListening;
  });

  // Mount / unmount lifecycle.
  React.useEffect(() => {
    activeRef.current = true;
    // Don't re-speak history: mark the current last assistant message as spoken.
    const msgs = chatRef.current.messages;
    const lastAssistant = [...msgs].reverse().find((m) => m.role === "assistant");
    spokenIdRef.current = lastAssistant?.id ?? "";
    // Kicks off the listen→reply→speak loop (status defaults to "idle" otherwise).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (supported) startListening();
    return () => {
      activeRef.current = false;
      stopRecognition();
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to the companion's reply: show live captions, then speak it.
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    if (!activeRef.current) return;
    if (chat.isStreaming) {
      setStatus("thinking");
      if (chat.streamingText) setAgentCaption(chat.streamingText);
      return;
    }
    const last = chat.messages[chat.messages.length - 1];
    if (last && last.role === "assistant" && last.id !== spokenIdRef.current) {
      spokenIdRef.current = last.id;
      setAgentCaption(last.content);
      setStatus("speaking");
      if (muted || !canSpeak) {
        if (activeRef.current) startRef.current();
      } else {
        speak(last.content, companionRef.current, () => {
          if (activeRef.current) startRef.current();
        }, nameContext);
      }
    }
  }, [chat.messages, chat.isStreaming, chat.streamingText, muted, canSpeak, nameContext]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const mood: MascotMood =
    status === "speaking"
      ? "excited"
      : status === "thinking"
        ? "thinking"
        : status === "listening"
          ? "happy"
          : "idle";

  const statusLabel =
    status === "listening"
      ? "Listening…"
      : status === "thinking"
        ? "Thinking…"
        : status === "speaking"
          ? `${companion.name} is talking…`
          : supported
            ? "Tap the mic to talk"
            : "Voice input isn't available in this browser";

  function handleMicButton() {
    if (status === "listening") {
      stopRecognition(); // triggers onend → submit if something was heard
    } else {
      startListening();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="omgbt-aurora fixed inset-0 z-50 flex flex-col items-center justify-between p-6"
    >
      {/* Top bar */}
      <div className="flex w-full max-w-lg items-center justify-between">
        <span className="font-display text-lg font-extrabold">Voice chat</span>
        <div className="flex gap-2">
          {canSpeak && (
            <Button
              size="icon"
              variant="outline"
              aria-label={muted ? "Unmute voice" : "Mute voice"}
              onClick={() => {
                const next = !muted;
                setMuted(next);
                if (next) stopSpeaking();
              }}
            >
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          )}
          <Button size="icon" variant="outline" aria-label="Switch to typing" onClick={onClose}>
            <Keyboard className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mascot + status */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <motion.div
          animate={
            status === "listening"
              ? { scale: [1, 1.06, 1] }
              : status === "speaking"
                ? { scale: [1, 1.03, 1] }
                : { scale: 1 }
          }
          transition={{ repeat: status === "idle" ? 0 : Infinity, duration: 1.1 }}
        >
          <Mascot companion={companion} mood={mood} className="h-auto w-[min(55vw,12.5rem)]" />
        </motion.div>
        <div
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-bold",
            status === "listening"
              ? "bg-primary/20 text-primary"
              : status === "speaking"
                ? "bg-accent/25 text-accent-foreground"
                : "bg-muted text-muted-foreground",
          )}
          aria-live="polite"
        >
          {statusLabel}
        </div>
      </div>

      {/* Captions (English text of both sides) */}
      <div className="w-full max-w-lg space-y-2">
        <div className="min-h-16 rounded-2xl border-2 border-border bg-card/80 p-3 backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {companion.name}
          </p>
          <p className="text-lg font-bold leading-snug">
            {agentCaption || (status === "thinking" ? "…" : "Say hi and I'll answer out loud!")}
          </p>
        </div>
        <div className="min-h-14 rounded-2xl border-2 border-primary/40 bg-primary/5 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">You</p>
          <p className="text-lg font-bold leading-snug">
            {userCaption || (status === "listening" ? "…" : "")}
          </p>
        </div>

        {!supported && (
          <p className="text-center text-sm text-muted-foreground">
            Voice input needs Chrome, Edge, or Safari with microphone access. You can still
            hear replies, or tap the keyboard icon to type.
          </p>
        )}

        {/* Big mic control */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <Button
            size="lg"
            variant={status === "listening" ? "destructive" : "default"}
            className="h-16 min-w-44 rounded-full text-lg"
            onClick={handleMicButton}
            disabled={!supported || status === "thinking" || status === "speaking"}
          >
            {status === "listening" ? (
              <>
                <MicOff className="h-6 w-6" /> Tap when done
              </>
            ) : (
              <>
                <Mic className="h-6 w-6" /> Tap to talk
              </>
            )}
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-16 w-16 rounded-full"
            aria-label="End voice chat"
            onClick={() => {
              activeRef.current = false;
              stopRecognition();
              stopSpeaking();
              onClose();
            }}
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
