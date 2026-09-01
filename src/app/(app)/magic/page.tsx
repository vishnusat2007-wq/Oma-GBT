"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/store/app-store";
import { FeatureDisabled } from "@/components/app/feature-disabled";
import { playSound } from "@/lib/sound";
import { NumberTrick } from "@/features/magic/number-trick";
import { MindReaderTrick } from "@/features/magic/mind-reader-trick";
import { VanishTrick } from "@/features/magic/vanish-trick";
import { MagicStoryTrick } from "@/features/magic/magic-story-trick";

type TrickId = "number" | "mind" | "vanish" | "story";

const TRICKS: {
  id: TrickId;
  title: string;
  emoji: string;
  desc: string;
  Component: React.ComponentType<{ onBack?: () => void }>;
}[] = [
  { id: "number", title: "Number Prediction", emoji: "🔮", desc: "I'll guess your final number.", Component: NumberTrick },
  { id: "mind", title: "Mind-Reading Cards", emoji: "🎴", desc: "I'll read your secret number.", Component: MindReaderTrick },
  { id: "vanish", title: "The Vanishing Star", emoji: "✨", desc: "Watch it disappear!", Component: VanishTrick },
  { id: "story", title: "Magic Story Reveal", emoji: "📜", desc: "A sealed prediction comes true.", Component: MagicStoryTrick },
];

export default function MagicPage() {
  const allowed = useAppStore((s) => s.permissions.magic);
  const soundOn = useAppStore((s) => s.preferences.soundOn);
  const [selected, setSelected] = React.useState<TrickId | null>(null);

  if (!allowed) return <FeatureDisabled feature="Magic Room" />;

  if (selected) {
    const trick = TRICKS.find((t) => t.id === selected)!;
    const Trick = trick.Component;
    return <Trick onBack={() => setSelected(null)} />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Magic Room 🪄</h1>
        <p className="text-muted-foreground">
          Amazing illusions and clever tricks. Psst — they&apos;re patterns and
          performances, not real powers!
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TRICKS.map((t, i) => (
          <motion.button
            key={t.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => {
              playSound("magic", soundOn);
              setSelected(t.id);
            }}
            className="text-left"
          >
            <Card className="h-full bg-gradient-to-br from-grape/25 to-sky/25 transition-transform hover:-translate-y-1 hover:shadow-xl">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="text-4xl">{t.emoji}</span>
                <div>
                  <p className="font-display text-lg font-extrabold leading-tight">{t.title}</p>
                  <p className="text-sm text-muted-foreground">{t.desc}</p>
                </div>
              </CardContent>
            </Card>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
