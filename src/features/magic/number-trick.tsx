"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { MagicShell } from "./magic-shell";
import { Button } from "@/components/ui/button";
import { PREDICTION_STEPS, MAGIC_RESULT, SECRET_EXPLANATION } from "./logic/number-prediction";
import { useAppStore } from "@/lib/store/app-store";
import { celebrate } from "@/lib/celebrate";
import { playSound } from "@/lib/sound";

export function NumberTrick({ onBack }: { onBack?: () => void }) {
  const [step, setStep] = React.useState(0);
  const [revealed, setRevealed] = React.useState(false);
  const unlock = useAppStore((s) => s.unlockAchievement);
  const soundOn = useAppStore((s) => s.preferences.soundOn);

  function next() {
    playSound("magic", soundOn);
    if (step < PREDICTION_STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      setRevealed(true);
      unlock("magician");
      celebrate("big");
      playSound("reward", soundOn);
    }
  }

  function restart() {
    setStep(0);
    setRevealed(false);
  }

  return (
    <MagicShell
      title="Number Prediction"
      emoji="🔮"
      intro="Think of a secret number and follow my steps. I already wrote down your final answer!"
      secret={SECRET_EXPLANATION}
      onReplay={restart}
      onBack={onBack}
    >
      <div className="rounded-2xl border-2 border-dashed border-primary/50 p-4 text-center">
        <p className="text-sm font-bold text-muted-foreground">My sealed prediction 🤫</p>
        <p className="font-display text-lg">A magic number awaits…</p>
      </div>

      <ol className="mt-4 space-y-2">
        {PREDICTION_STEPS.map((s, i) => (
          <li
            key={i}
            className={`rounded-2xl border-2 p-3 font-bold transition-colors ${
              i <= step ? "border-primary bg-primary/10" : "border-border opacity-40"
            }`}
          >
            {i + 1}. {s.instruction}
          </li>
        ))}
      </ol>

      {!revealed ? (
        <Button className="mt-4 w-full" size="lg" onClick={next}>
          {step < PREDICTION_STEPS.length - 1 ? "Next step ✨" : "Reveal your number!"}
        </Button>
      ) : (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-4 rounded-2xl bg-gradient-to-br from-grape/30 to-bubblegum/30 p-6 text-center"
        >
          <p className="font-bold">Your number is…</p>
          <p className="font-display text-6xl font-extrabold text-primary">{MAGIC_RESULT}</p>
          <p className="mt-2 font-bold">Was I right? 😄</p>
        </motion.div>
      )}
    </MagicShell>
  );
}
