"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MagicShell } from "./magic-shell";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/app-store";
import { celebrate } from "@/lib/celebrate";
import { playSound } from "@/lib/sound";
import { cn } from "@/lib/utils";

const SECRET =
  "It's misdirection and a quick swap! On a real stage, magicians move your attention away for a split second. Here, the app simply hides the star under a cup and shuffles — the 'vanish' is a fun animation, not a real disappearance.";

type Phase = "ready" | "shuffling" | "reveal";

export function VanishTrick({ onBack }: { onBack?: () => void }) {
  const [phase, setPhase] = React.useState<Phase>("ready");
  const [starUnder, setStarUnder] = React.useState(1);
  const [lifted, setLifted] = React.useState<number | null>(null);
  const [vanished, setVanished] = React.useState(false);
  const unlock = useAppStore((s) => s.unlockAchievement);
  const soundOn = useAppStore((s) => s.preferences.soundOn);

  function start() {
    setPhase("shuffling");
    setLifted(null);
    setVanished(false);
    playSound("magic", soundOn);
    let ticks = 0;
    const iv = setInterval(() => {
      setStarUnder(Math.floor(Math.random() * 3));
      ticks++;
      if (ticks > 8) {
        clearInterval(iv);
        setPhase("reveal");
      }
    }, 180);
  }

  function lift(cup: number) {
    if (phase !== "reveal" || lifted !== null) return;
    setLifted(cup);
    playSound("magic", soundOn);
    // The star has magically vanished!
    setVanished(true);
    setTimeout(() => {
      unlock("magician");
      celebrate("small");
      playSound("reward", soundOn);
    }, 400);
  }

  function reset() {
    setPhase("ready");
    setLifted(null);
    setVanished(false);
  }

  return (
    <MagicShell
      title="The Vanishing Star"
      emoji="✨"
      intro="Watch the star go under a cup. I'll shuffle them… then POOF! Lift a cup to see the magic."
      secret={SECRET}
      onReplay={reset}
      onBack={onBack}
    >
      <div className="flex items-end justify-center gap-4 py-6" style={{ minHeight: 160 }}>
        {[0, 1, 2].map((cup) => (
          <div key={cup} className="flex flex-col items-center gap-2">
            <motion.button
              onClick={() => lift(cup)}
              animate={lifted === cup ? { y: -60, rotate: -10 } : { y: 0, rotate: 0 }}
              whileHover={phase === "reveal" && lifted === null ? { y: -8 } : {}}
              className={cn(
                "flex h-24 w-20 items-end justify-center rounded-t-[2.5rem] rounded-b-lg bg-gradient-to-b from-grape to-bubblegum shadow-lg",
                phase === "reveal" && lifted === null && "cursor-pointer",
              )}
              aria-label={`Cup ${cup + 1}`}
              disabled={phase !== "reveal" || lifted !== null}
            >
              <span className="mb-2 text-2xl">🥤</span>
            </motion.button>
            <div className="h-8 text-3xl">
              <AnimatePresence>
                {lifted === cup && !vanished && starUnder === cup && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    ⭐
                  </motion.span>
                )}
                {lifted === cup && vanished && (
                  <motion.span initial={{ scale: 1, opacity: 1 }} animate={{ scale: 0, opacity: 0 }}>
                    💨
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      {phase === "ready" && (
        <Button className="w-full" size="lg" onClick={start}>
          Start the trick ✨
        </Button>
      )}
      {phase === "shuffling" && (
        <p className="text-center font-display text-lg font-bold">Shuffling… watch closely! 👀</p>
      )}
      {phase === "reveal" && lifted === null && (
        <p className="text-center font-display text-lg font-bold">Now lift a cup to find the star!</p>
      )}
      {vanished && (
        <p className="text-center font-display text-lg font-bold">Whoa! The star vanished! 💫 Where did it go?</p>
      )}
    </MagicShell>
  );
}
