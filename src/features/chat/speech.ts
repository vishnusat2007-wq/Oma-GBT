"use client";

import type { CompanionConfig } from "@/lib/data/types";
import { prepareTextForSpeech, type NameContext } from "@/lib/names/pronunciation";

interface SpeechRecognitionResultLike {
  0: { transcript: string };
  isFinal: boolean;
  length: number;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort?: () => void;
}

type RecognitionCtor = new () => SpeechRecognitionLike;

export function getRecognition(interim = false): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.lang = "en-US";
  rec.continuous = false;
  rec.interimResults = interim;
  return rec;
}

export function speechSupported(): boolean {
  return getRecognition() !== null;
}

export function ttsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

// ---- Voice selection (prefer a smooth English female voice) ----

let cachedVoices: SpeechSynthesisVoice[] = [];

function refreshVoices() {
  if (!ttsSupported()) return;
  const v = window.speechSynthesis.getVoices();
  if (v && v.length) cachedVoices = v;
}

if (ttsSupported()) {
  refreshVoices();
  try {
    window.speechSynthesis.onvoiceschanged = refreshVoices;
  } catch {
    /* ignore */
  }
}

// Ordered preferences: explicit high-quality female English voices first.
const FEMALE_VOICE_PATTERNS: RegExp[] = [
  /Google UK English Female/i,
  /Microsoft (Aria|Jenny|Michelle|Ava|Sonia|Libby|Zira)/i,
  /\bSamantha\b/i,
  /\bSerena\b/i,
  /\bAva\b/i,
  /\bAllison\b/i,
  /\bSusan\b/i,
  /\bKaren\b/i,
  /\bMoira\b/i,
  /\bTessa\b/i,
  /\bFiona\b/i,
  /\bVictoria\b/i,
  /female/i,
  /Google US English/i, // Chrome default US voice (soft, female-sounding)
];

export function getPreferredVoice(): SpeechSynthesisVoice | null {
  if (!ttsSupported()) return null;
  if (!cachedVoices.length) refreshVoices();
  const english = cachedVoices.filter((v) => /^en([-_]|$)/i.test(v.lang));
  const pool = english.length ? english : cachedVoices;
  for (const pattern of FEMALE_VOICE_PATTERNS) {
    const match = pool.find((v) => pattern.test(v.name));
    if (match) return match;
  }
  return pool[0] ?? null;
}

export function speak(
  text: string,
  companion: CompanionConfig,
  onEnd?: () => void,
  nameContext?: NameContext,
) {
  if (!ttsSupported()) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const clean = prepareTextForSpeech(
    text
      .replace(/[*_#`>~]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 600),
    nameContext ?? {},
  );
  if (!clean) {
    onEnd?.();
    return;
  }
  const utter = new SpeechSynthesisUtterance(clean);
  const voice = getPreferredVoice();
  if (voice) {
    utter.voice = voice;
    utter.lang = voice.lang;
  } else {
    utter.lang = "en-US";
  }
  // Smooth, gentle female delivery.
  utter.pitch = companion.voicePitch;
  utter.rate = companion.voiceRate;
  utter.volume = 1;
  utter.onend = () => onEnd?.();
  utter.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utter);
}

export function stopSpeaking() {
  if (ttsSupported()) window.speechSynthesis.cancel();
}

/** Parse a recognition event into interim + final transcript text. */
export function parseTranscript(e: SpeechRecognitionEventLike): {
  interim: string;
  final: string;
} {
  let interim = "";
  let final = "";
  for (let i = 0; i < e.results.length; i++) {
    const r = e.results[i];
    const t = r[0]?.transcript ?? "";
    if (r.isFinal) final += t;
    else interim += t;
  }
  return { interim: interim.trim(), final: final.trim() };
}
