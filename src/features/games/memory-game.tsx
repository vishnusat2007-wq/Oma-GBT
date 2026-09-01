"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { GameShell, DifficultyPicker } from "./game-shell";
import { Badge } from "@/components/ui/badge";
import {
  buildDeck,
  isMatch,
  starRating,
  PAIRS_BY_DIFFICULTY,
  type MemoryCard,
  type MemoryDifficulty,
} from "./logic/memory";
import { useAppStore } from "@/lib/store/app-store";
import { celebrate } from "@/lib/celebrate";
import { playSound } from "@/lib/sound";
import { cn } from "@/lib/utils";

export function MemoryGame({ onBack }: { onBack?: () => void }) {
  const [difficulty, setDifficulty] = React.useState<MemoryDifficulty>("easy");
  const [deck, setDeck] = React.useState<MemoryCard[]>(() => buildDeck("easy"));
  const [flipped, setFlipped] = React.useState<number[]>([]);
  const [moves, setMoves] = React.useState(0);
  const [locked, setLocked] = React.useState(false);
  const recordGame = useAppStore((s) => s.recordGame);
  const soundOn = useAppStore((s) => s.preferences.soundOn);

  const pairs = PAIRS_BY_DIFFICULTY[difficulty];
  const matchedCount = deck.filter((c) => c.matched).length / 2;
  const won = matchedCount === pairs && deck.length > 0;
  const wonRef = React.useRef(false);

  const reset = React.useCallback(
    (d: MemoryDifficulty) => {
      setDeck(buildDeck(d));
      setFlipped([]);
      setMoves(0);
      setLocked(false);
      wonRef.current = false;
    },
    [],
  );

  React.useEffect(() => {
    if (won && !wonRef.current) {
      wonRef.current = true;
      recordGame({ game: "memory", score: starRating(pairs, moves), difficulty, result: "complete" });
      celebrate("big");
      playSound("win", soundOn);
    }
  }, [won, pairs, moves, difficulty, recordGame, soundOn]);

  function flip(index: number) {
    if (locked || deck[index].matched || flipped.includes(index)) return;
    playSound("flip", soundOn);
    const next = [...flipped, index];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      setLocked(true);
      const [a, b] = next;
      if (isMatch(deck[a], deck[b])) {
        setTimeout(() => {
          setDeck((d) => d.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c)));
          setFlipped([]);
          setLocked(false);
          playSound("pop", soundOn);
        }, 500);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 900);
      }
    }
  }

  const cols = pairs <= 4 ? "grid-cols-4" : pairs <= 6 ? "grid-cols-4" : "grid-cols-4";

  return (
    <GameShell
      title="Memory Match"
      emoji="🧠"
      instructions="Flip two cards at a time to find matching pairs. Remember where they are! Match them all with as few moves as possible."
      onReplay={() => reset(difficulty)}
      onBack={onBack}
      toolbar={
        <DifficultyPicker
          value={difficulty}
          options={["easy", "medium", "hard"] as const}
          onChange={(d) => {
            setDifficulty(d);
            reset(d);
          }}
        />
      }
      score={<Badge variant="secondary">Moves: {moves}</Badge>}
    >
      {won && (
        <p className="mb-3 text-center font-display text-lg font-bold" aria-live="polite">
          You matched them all! {"⭐".repeat(starRating(pairs, moves))}
        </p>
      )}
      <div className={cn("mx-auto grid max-w-md gap-2", cols)}>
        {deck.map((card, i) => {
          const isShown = card.matched || flipped.includes(i);
          return (
            <motion.button
              key={card.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => flip(i)}
              aria-label={isShown ? `Card ${card.emoji}` : "Hidden card"}
              className={cn(
                "flex aspect-square items-center justify-center rounded-2xl border-2 text-3xl transition-colors",
                isShown ? "border-accent bg-card" : "border-border bg-primary/80",
                card.matched && "opacity-60",
              )}
            >
              {isShown ? card.emoji : ""}
            </motion.button>
          );
        })}
      </div>
    </GameShell>
  );
}
