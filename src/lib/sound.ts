"use client";

type SoundName = "pop" | "win" | "lose" | "click" | "magic" | "reward" | "flip";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = "sine", gain = 0.12) {
  const audio = getCtx();
  if (!audio) return;
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, audio.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, audio.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + start + duration);
  osc.connect(g);
  g.connect(audio.destination);
  osc.start(audio.currentTime + start);
  osc.stop(audio.currentTime + start + duration);
}

const RECIPES: Record<SoundName, () => void> = {
  click: () => tone(440, 0, 0.08, "triangle", 0.08),
  pop: () => tone(660, 0, 0.1, "sine", 0.1),
  flip: () => {
    tone(520, 0, 0.06, "square", 0.05);
    tone(720, 0.05, 0.08, "square", 0.05);
  },
  win: () => {
    tone(523, 0, 0.12, "triangle");
    tone(659, 0.12, 0.12, "triangle");
    tone(784, 0.24, 0.18, "triangle");
  },
  reward: () => {
    tone(659, 0, 0.1, "sine");
    tone(880, 0.1, 0.1, "sine");
    tone(1047, 0.2, 0.22, "sine");
  },
  magic: () => {
    tone(880, 0, 0.1, "sine", 0.08);
    tone(1175, 0.08, 0.1, "sine", 0.08);
    tone(1568, 0.16, 0.2, "sine", 0.08);
  },
  lose: () => {
    tone(392, 0, 0.16, "sawtooth", 0.07);
    tone(294, 0.16, 0.24, "sawtooth", 0.07);
  },
};

export function playSound(name: SoundName, enabled = true) {
  if (!enabled) return;
  try {
    const audio = getCtx();
    if (audio?.state === "suspended") void audio.resume();
    RECIPES[name]?.();
  } catch {
    /* audio not available; ignore */
  }
}
