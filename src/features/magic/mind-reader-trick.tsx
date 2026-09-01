"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { MagicShell } from "./magic-shell";
import { Button } from "@/components/ui/button";
import { allCards, revealFromCards, MAX_NUMBER } from "./logic/binary-cards";
import { useAppStore } from "@/lib/store/app-store";
import { celebrate } from "@/lib/celebrate";
import { playSound } from "@/lib/sound";

const SECRET =
  "It's binary numbers! Each card shows numbers that have a certain 'bit' switched on. The smallest number on each card is 1, 2, 4, 8, 16, or 32. Adding the smallest number from every card you said 'yes' to always rebuilds your secret number.";

export function MindReaderTrick({ onBack }: { onBack?: () => void }) {
  const cards = React.useMemo(() => allCards(), []);
  const [index, setIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<number[]>([]);
  const [revealed, setRevealed] = React.useState(false);
  const [started, setStarted] = React.useState(false);
  const unlock = useAppStore((s) => s.unlockAchievement);
  const soundOn = useAppStore((s) => s.preferences.soundOn);

  function answer(hasNumber: boolean) {
    playSound("flip", soundOn);
    const nextSelected = hasNumber ? [...selected, index] : selected;
    if (hasNumber) setSelected(nextSelected);
    if (index < cards.length - 1) {
      setIndex((i) => i + 1);
    } else {
      setRevealed(true);
      unlock("magician");
      celebrate("big");
      playSound("reward", soundOn);
    }
  }

  function restart() {
    setIndex(0);
    setSelected([]);
    setRevealed(false);
    setStarted(false);
  }

  const result = revealFromCards(selected);

  return (
    <MagicShell
      title="Mind-Reading Cards"
      emoji="🎴"
      intro={`Think of a secret number from 1 to ${MAX_NUMBER}. I'll show you cards — just tell me if your number is on each one. Then I'll read your mind!`}
      secret={SECRET}
      onReplay={restart}
      onBack={onBack}
    >
      {!started ? (
        <Button className="w-full" size="lg" onClick={() => setStarted(true)}>
          I&apos;ve got my number! Start 🎴
        </Button>
      ) : revealed ? (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-2xl bg-gradient-to-br from-sky/30 to-grape/30 p-6 text-center"
        >
          <p className="font-bold">Your secret number is…</p>
          <p className="font-display text-6xl font-extrabold text-primary">{result || "?"}</p>
          <p className="mt-2 font-bold">🔮 Am I right?</p>
        </motion.div>
      ) : (
        <div>
          <p className="mb-2 text-center font-bold">
            Card {index + 1} of {cards.length}: Is your number here?
          </p>
          <div className="mb-4 grid grid-cols-4 gap-1.5 rounded-2xl border-2 border-border bg-muted p-3 sm:grid-cols-6">
            {cards[index].map((n) => (
              <span
                key={n}
                className="rounded-lg bg-card py-1 text-center text-sm font-bold"
              >
                {n}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => answer(true)}>
              Yes, it&apos;s here ✅
            </Button>
            <Button className="flex-1" variant="outline" onClick={() => answer(false)}>
              Nope ❌
            </Button>
          </div>
        </div>
      )}
    </MagicShell>
  );
}
