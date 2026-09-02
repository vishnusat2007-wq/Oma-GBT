"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";
import {
  Send,
  Mic,
  MicOff,
  Square,
  RefreshCw,
  Brain,
  Volume2,
  VolumeX,
  Plus,
  MessagesSquare,
  Pencil,
  Archive,
  Trash2,
  ShieldAlert,
  PhoneCall,
} from "lucide-react";
import { Mascot, type MascotMood } from "@/components/mascot/mascot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { useAppStore } from "@/lib/store/app-store";
import { useCompanionChat } from "./use-chat";
import { MessageBubble } from "./message-bubble";
import { ToolApprovalCard } from "./tool-approval-card";
import { MemoryPanel } from "./memory-panel";
import { VoiceCall } from "./voice-call";
import {
  getRecognition,
  speechSupported,
  ttsSupported,
  speak,
  stopSpeaking,
} from "./speech";
import { playSound } from "@/lib/sound";

const STARTERS = [
  "Tell me a fun fact! 🌟",
  "Let's make up a story 📖",
  "Tell me a joke 😆",
  "Help me learn something 📚",
  "What games can we play? 🎮",
];

export function ChatView() {
  const conversations = useAppStore((s) => s.conversations);
  const companion = useAppStore((s) => s.companion);
  const profile = useAppStore((s) => s.profile);
  const addConversation = useAppStore((s) => s.addConversation);
  const renameConversation = useAppStore((s) => s.renameConversation);
  const archiveConversation = useAppStore((s) => s.archiveConversation);
  const deleteConversation = useAppStore((s) => s.deleteConversation);
  const addMessage = useAppStore((s) => s.addMessage);
  const ttsOn = useAppStore((s) => s.preferences.ttsOn);
  const soundOn = useAppStore((s) => s.preferences.soundOn);
  const setPreferences = useAppStore((s) => s.setPreferences);

  const active = conversations.filter((c) => !c.archived);
  const [activeId, setActiveId] = React.useState<string>(
    active[0]?.id ?? "",
  );

  React.useEffect(() => {
    if (!activeId) {
      const id = active[0]?.id ?? addConversation("New chat");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveId(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chat = useCompanionChat(activeId);
  const [input, setInput] = React.useState("");
  const [listening, setListening] = React.useState(false);
  const [voiceCallOpen, setVoiceCallOpen] = React.useState(false);
  const voiceInput = speechSupported();
  const voiceOutput = ttsSupported();
  const [memoryOpen, setMemoryOpen] = React.useState(false);
  const [convoOpen, setConvoOpen] = React.useState(false);
  const [renaming, setRenaming] = React.useState<string | null>(null);
  const [renameText, setRenameText] = React.useState("");
  const nameContext = React.useMemo(
    () => ({ childName: profile.displayName }),
    [profile.displayName],
  );
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const recognitionRef = React.useRef<ReturnType<typeof getRecognition>>(null);
  const lastSpokenRef = React.useRef<string>("");

  const mood: MascotMood = chat.isStreaming
    ? "thinking"
    : chat.error
      ? "sad"
      : "happy";

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages, chat.streamingText]);

  // Auto-speak the latest assistant message when TTS is on (voice call handles its own speech).
  React.useEffect(() => {
    if (voiceCallOpen || !ttsOn || chat.isStreaming) return;
    const last = chat.messages[chat.messages.length - 1];
    if (last && last.role === "assistant" && last.id !== lastSpokenRef.current) {
      lastSpokenRef.current = last.id;
      speak(last.content, companion, undefined, nameContext);
    }
  }, [chat.messages, chat.isStreaming, ttsOn, companion, voiceCallOpen, nameContext]);

  function handleSend(text: string) {
    const value = text.trim();
    if (!value) return;
    playSound("pop", soundOn);
    setInput("");
    void chat.send(value);
  }

  function toggleMic() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = getRecognition();
    if (!rec) return;
    recognitionRef.current = rec;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    setListening(true);
    rec.start();
  }

  const activeConvo = conversations.find((c) => c.id === activeId);

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col gap-3 md:h-[calc(100dvh-2.5rem)]">
      {/* Header */}
      <Card className="shrink-0">
        <CardContent className="flex items-center justify-between gap-2 p-3">
          <div className="flex min-w-0 items-center gap-2">
            <Mascot companion={companion} mood={mood} size={44} animate={false} />
            <div className="min-w-0">
              <p className="truncate font-display font-bold">
                {activeConvo?.title ?? "Chat"}
              </p>
              <p className="text-xs text-muted-foreground">
                Chatting with {companion.name}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" aria-label="Memories" onClick={() => setMemoryOpen(true)}>
              <Brain className="h-5 w-5" />
            </Button>
            {(voiceInput || voiceOutput) && (
              <Button
                size="icon"
                variant="default"
                aria-label="Start voice chat"
                title="Voice chat (talk with your friend)"
                onClick={() => {
                  stopSpeaking();
                  setVoiceCallOpen(true);
                }}
              >
                <PhoneCall className="h-5 w-5" />
              </Button>
            )}
            {voiceOutput && (
              <Button
                size="icon"
                variant="ghost"
                aria-label={ttsOn ? "Turn off read-aloud" : "Turn on read-aloud"}
                title="Read replies aloud"
                onClick={() => {
                  if (ttsOn) stopSpeaking();
                  setPreferences({ ttsOn: !ttsOn });
                }}
              >
                {ttsOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </Button>
            )}
            <Button size="icon" variant="ghost" aria-label="Conversations" onClick={() => setConvoOpen(true)}>
              <MessagesSquare className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto rounded-3xl border-2 border-border bg-card/50 p-4">
        {chat.messages.length === 0 && !chat.isStreaming && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Mascot companion={companion} mood="excited" className="h-auto w-[min(40vw,7.5rem)]" />
            <p className="font-display text-xl font-bold">Hi! What should we talk about?</p>
          </div>
        )}

        {chat.messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            companionName={companion.name}
            onSpeak={ttsSupported() ? (t) => speak(t, companion, undefined, nameContext) : undefined}
          />
        ))}

        {chat.isStreaming && chat.streamingText && (
          <MessageBubble
            message={{
              id: "streaming",
              conversationId: activeId,
              role: "assistant",
              content: chat.streamingText,
              kind: "text",
              createdAt: new Date().toISOString(),
              aiGenerated: chat.source !== "safety",
            }}
            companionName={companion.name}
          />
        )}

        {chat.isStreaming && !chat.streamingText && (
          <div className="flex items-center gap-2 px-2 text-muted-foreground">
            <Mascot companion={companion} mood="thinking" size={36} />
            <span className="animate-pulse font-bold">thinking…</span>
          </div>
        )}

        {chat.safety?.urgent && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="flex items-center gap-2 p-3 text-sm font-bold">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              If you feel unsafe, please tell a trusted adult nearby right away.
            </CardContent>
          </Card>
        )}

        <AnimatePresence>
          {chat.pendingProposal && (
            <ToolApprovalCard
              proposal={chat.pendingProposal}
              onResolved={(msg) => {
                chat.dismissProposal();
                if (msg) {
                  addMessage({
                    conversationId: activeId,
                    role: "assistant",
                    content: msg,
                    kind: "text",
                  });
                }
              }}
            />
          )}
        </AnimatePresence>

        {chat.error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-center justify-between gap-2 p-3">
              <span className="text-sm font-bold">{chat.error}</span>
              <Button size="sm" variant="outline" onClick={() => chat.regenerate()}>
                <RefreshCw className="h-4 w-4" /> Try again
              </Button>
            </CardContent>
          </Card>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Starters */}
      {chat.messages.length <= 3 && !chat.isStreaming && (
        <div className="flex flex-wrap gap-2">
          {STARTERS.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="rounded-full border-2 border-border bg-card px-3 py-1.5 text-sm font-bold hover:bg-muted"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="shrink-0 space-y-2">
        {(voiceInput || voiceOutput) && (
          <button
            onClick={() => {
              stopSpeaking();
              setVoiceCallOpen(true);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-primary bg-primary/10 px-3 py-2 font-bold text-primary transition-colors hover:bg-primary/20"
          >
            <PhoneCall className="h-5 w-5" /> Start voice chat — talk with {companion.name}
          </button>
        )}
        {(chat.isStreaming || chat.messages.some((m) => m.role === "assistant")) && (
          <div className="flex gap-2">
            {chat.isStreaming ? (
              <Button size="sm" variant="outline" onClick={chat.stop}>
                <Square className="h-4 w-4" /> Stop
              </Button>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => chat.regenerate()}>
                <RefreshCw className="h-4 w-4" /> Regenerate
              </Button>
            )}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2"
        >
          {voiceInput && (
            <Button
              type="button"
              size="icon"
              variant={listening ? "destructive" : "outline"}
              onClick={toggleMic}
              aria-label={listening ? "Stop listening" : "Speak to type"}
              title="Speak to type"
            >
              {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
          )}
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={voiceInput ? `Type or talk to ${companion.name}…` : `Message ${companion.name}…`}
            aria-label="Type your message"
            maxLength={1000}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || chat.isStreaming} aria-label="Send">
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>

      <MemoryPanel open={memoryOpen} onOpenChange={setMemoryOpen} />

      {/* Conversation manager */}
      <Dialog open={convoOpen} onOpenChange={setConvoOpen} title="Your conversations">
        <Button
          className="mb-3 w-full"
          onClick={() => {
            const id = addConversation("New chat");
            setActiveId(id);
            setConvoOpen(false);
          }}
        >
          <Plus className="h-4 w-4" /> New chat
        </Button>
        <ul className="space-y-2">
          {conversations.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-2 rounded-2xl border-2 border-border p-2"
            >
              {renaming === c.id ? (
                <Input
                  value={renameText}
                  onChange={(e) => setRenameText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      renameConversation(c.id, renameText || c.title);
                      setRenaming(null);
                    }
                  }}
                  autoFocus
                  className="h-9"
                />
              ) : (
                <button
                  className="min-w-0 flex-1 text-left"
                  onClick={() => {
                    setActiveId(c.id);
                    setConvoOpen(false);
                  }}
                >
                  <span className="block truncate font-bold">{c.title}</span>
                  {c.archived && <span className="text-xs text-muted-foreground">archived</span>}
                </button>
              )}
              <Button
                size="icon"
                variant="ghost"
                aria-label="Rename"
                onClick={() => {
                  setRenaming(c.id);
                  setRenameText(c.title);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label={c.archived ? "Unarchive" : "Archive"}
                onClick={() => archiveConversation(c.id, !c.archived)}
              >
                <Archive className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Delete"
                onClick={() => {
                  deleteConversation(c.id);
                  if (activeId === c.id) {
                    const next = conversations.find((x) => x.id !== c.id);
                    setActiveId(next?.id ?? addConversation("New chat"));
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </Dialog>

      <AnimatePresence>
        {voiceCallOpen && (
          <VoiceCall
            chat={chat}
            companion={companion}
            profile={profile}
            onClose={() => setVoiceCallOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
