"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/store/app-store";
import { FeatureDisabled } from "@/components/app/feature-disabled";
import { playSound } from "@/lib/sound";
import { TicTacToeGame } from "@/features/games/tic-tac-toe-game";
import { MemoryGame } from "@/features/games/memory-game";
import { RpsGame } from "@/features/games/rps-game";
import { GuessGame } from "@/features/games/guess-game";
import { TriviaGame } from "@/features/games/trivia-game";
import { AdventureGame } from "@/features/games/adventure-game";
import type { GameId } from "@/lib/data/types";

const GAMES: {
  id: GameId;
  title: string;
  emoji: string;
  desc: string;
  Component: React.ComponentType<{ onBack?: () => void }>;
}[] = [
  { id: "tic-tac-toe", title: "Tic-Tac-Toe", emoji: "⭕", desc: "Beat me to three in a row!", Component: TicTacToeGame },
  { id: "memory", title: "Memory Match", emoji: "🧠", desc: "Find the matching pairs.", Component: MemoryGame },
  { id: "rock-paper-scissors", title: "Rock Paper Scissors", emoji: "✊", desc: "Best of luck!", Component: RpsGame },
  { id: "guess-what", title: "Guess What!", emoji: "🔎", desc: "Guess from clues.", Component: GuessGame },
  { id: "trivia", title: "Trivia Quiz", emoji: "🎯", desc: "Test what you know.", Component: TriviaGame },
  { id: "adventure", title: "Choose Adventure", emoji: "🗺️", desc: "Make a story together.", Component: AdventureGame },
];

function ArcadeContent() {
  const searchParams = useSearchParams();
  const soundOn = useAppStore((s) => s.preferences.soundOn);
  const [selected, setSelected] = React.useState<GameId | null>(null);

  React.useEffect(() => {
    const param = searchParams.get("game") as GameId | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (param && GAMES.some((g) => g.id === param)) setSelected(param);
  }, [searchParams]);

  if (selected) {
    const game = GAMES.find((g) => g.id === selected)!;
    const Game = game.Component;
    return <Game onBack={() => setSelected(null)} />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Game Arcade 🎮</h1>
        <p className="text-muted-foreground">Pick a game — they all work offline!</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {GAMES.map((g, i) => (
          <motion.button
            key={g.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => {
              playSound("pop", soundOn);
              setSelected(g.id);
            }}
            className="text-left"
          >
            <Card className="h-full transition-transform hover:-translate-y-1 hover:shadow-xl">
              <CardContent className="flex flex-col items-start gap-1 p-4">
                <span className="text-4xl">{g.emoji}</span>
                <p className="font-display text-lg font-extrabold leading-tight">{g.title}</p>
                <p className="text-sm text-muted-foreground">{g.desc}</p>
              </CardContent>
            </Card>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default function ArcadePage() {
  const allowed = useAppStore((s) => s.permissions.arcade);
  if (!allowed) return <FeatureDisabled feature="Game Arcade" />;
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading games…</div>}>
      <ArcadeContent />
    </Suspense>
  );
}
