"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameShell } from "./game-shell";
import { Button } from "@/components/ui/button";
import { getNode, startNode, type AdventureNode } from "./logic/adventure";
import { useAppStore } from "@/lib/store/app-store";
import { celebrate } from "@/lib/celebrate";
import { playSound } from "@/lib/sound";

export function AdventureGame({ onBack }: { onBack?: () => void }) {
  const [node, setNode] = React.useState<AdventureNode>(() => startNode());
  const [path, setPath] = React.useState<string[]>([]);
  const recordGame = useAppStore((s) => s.recordGame);
  const soundOn = useAppStore((s) => s.preferences.soundOn);
  const endedRef = React.useRef(false);

  React.useEffect(() => {
    if (node.ending && !endedRef.current) {
      endedRef.current = true;
      recordGame({ game: "adventure", score: path.length, difficulty: null, result: "complete" });
      celebrate("big");
      playSound("win", soundOn);
    }
  }, [node, path.length, recordGame, soundOn]);

  function choose(next: string) {
    playSound("click", soundOn);
    setPath((p) => [...p, node.id]);
    setNode(getNode(next));
  }

  function restart() {
    setNode(startNode());
    setPath([]);
    endedRef.current = false;
  }

  return (
    <GameShell
      title="Choose Your Adventure"
      emoji="🗺️"
      instructions="Read the story and pick what happens next. Every path leads somewhere magical and kind. Let's explore together!"
      onReplay={restart}
      onBack={onBack}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={node.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className="text-center"
        >
          <div className="mb-3 text-6xl">{node.emoji}</div>
          <p className="mx-auto max-w-md text-lg font-bold leading-relaxed">{node.text}</p>
        </motion.div>
      </AnimatePresence>

      <div className="mt-5 flex flex-col items-center gap-2">
        {node.ending ? (
          <Button size="lg" onClick={restart}>
            Start a new adventure 🌟
          </Button>
        ) : (
          node.choices.map((choice) => (
            <Button
              key={choice.next}
              size="lg"
              variant="outline"
              className="w-full max-w-md"
              onClick={() => choose(choice.next)}
            >
              {choice.label}
            </Button>
          ))
        )}
      </div>
    </GameShell>
  );
}
