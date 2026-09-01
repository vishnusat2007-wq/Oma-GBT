"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { MagicShell } from "./magic-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  generateMagicStory,
  PREDICTION,
  MAGIC_STORY_SECRET,
} from "./logic/magic-story";
import { useAppStore } from "@/lib/store/app-store";
import { celebrate } from "@/lib/celebrate";
import { playSound } from "@/lib/sound";

export function MagicStoryTrick({ onBack }: { onBack?: () => void }) {
  const [hero, setHero] = React.useState("a brave little fox");
  const [place, setPlace] = React.useState("Whispering Woods");
  const [helper, setHelper] = React.useState("a giggling firefly");
  const [story, setStory] = React.useState<ReturnType<typeof generateMagicStory> | null>(null);
  const [showReveal, setShowReveal] = React.useState(false);
  const unlock = useAppStore((s) => s.unlockAchievement);
  const soundOn = useAppStore((s) => s.preferences.soundOn);

  function tell() {
    const result = generateMagicStory({ hero, place, helper });
    setStory(result);
    setShowReveal(false);
    playSound("magic", soundOn);
  }

  function reveal() {
    setShowReveal(true);
    unlock("magician");
    celebrate("big");
    playSound("reward", soundOn);
  }

  function restart() {
    setStory(null);
    setShowReveal(false);
  }

  return (
    <MagicShell
      title="Magic Story Reveal"
      emoji="📜"
      intro="Make your own story! But first — I've sealed a prediction about how it ends…"
      secret={MAGIC_STORY_SECRET}
      onReplay={restart}
      onBack={onBack}
    >
      {!story ? (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-dashed border-primary/50 p-3 text-center">
            <p className="text-sm font-bold text-muted-foreground">Sealed prediction 🤫</p>
            <p className="font-display">I predict the hero will find… something shiny!</p>
          </div>
          <div>
            <Label htmlFor="hero">Your hero</Label>
            <Input id="hero" value={hero} onChange={(e) => setHero(e.target.value.slice(0, 40))} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="place">A magical place</Label>
            <Input id="place" value={place} onChange={(e) => setPlace(e.target.value.slice(0, 40))} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="helper">A helpful friend</Label>
            <Input id="helper" value={helper} onChange={(e) => setHelper(e.target.value.slice(0, 40))} className="mt-1" />
          </div>
          <Button className="w-full" size="lg" onClick={tell}>
            Tell my magic story ✨
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {story.paragraphs.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.3 }}
              className="text-lg leading-relaxed"
            >
              {p}
            </motion.p>
          ))}
          {!showReveal ? (
            <Button className="w-full" size="lg" onClick={reveal}>
              What did they find? 👀
            </Button>
          ) : (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-2xl bg-gradient-to-br from-sunshine/40 to-accent/30 p-5 text-center"
            >
              <p className="text-4xl">{PREDICTION.emoji}</p>
              <p className="mt-1 text-lg font-bold">{story.reveal}</p>
            </motion.div>
          )}
        </div>
      )}
    </MagicShell>
  );
}
