"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { GameShell } from "./game-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MOVES,
  MOVE_EMOJI,
  judge,
  randomMove,
  type Move,
  type Outcome,
} from "./logic/rps";
import { useAppStore } from "@/lib/store/app-store";
import { celebrate } from "@/lib/celebrate";
import { playSound } from "@/lib/sound";

export function RpsGame({ onBack }: { onBack?: () => void }) {
  const [playerMove, setPlayerMove] = React.useState<Move | null>(null);
  const [aiMove, setAiMove] = React.useState<Move | null>(null);
  const [outcome, setOutcome] = React.useState<Outcome | null>(null);
  const [wins, setWins] = React.useState(0);
  const [losses, setLosses] = React.useState(0);
  const [rolling, setRolling] = React.useState(false);
  const recordGame = useAppStore((s) => s.recordGame);
  const soundOn = useAppStore((s) => s.preferences.soundOn);

  function play(move: Move) {
    if (rolling) return;
    setRolling(true);
    setPlayerMove(move);
    setOutcome(null);
    playSound("click", soundOn);
    let ticks = 0;
    const interval = setInterval(() => {
      setAiMove(randomMove());
      ticks++;
      if (ticks > 6) {
        clearInterval(interval);
        const finalAi = randomMove();
        setAiMove(finalAi);
        const res = judge(move, finalAi);
        setOutcome(res);
        setRolling(false);
        if (res === "win") {
          setWins((w) => w + 1);
          recordGame({ game: "rock-paper-scissors", score: 1, difficulty: null, result: "win" });
          celebrate("small");
          playSound("win", soundOn);
        } else if (res === "lose") {
          setLosses((l) => l + 1);
          playSound("lose", soundOn);
        } else {
          playSound("pop", soundOn);
        }
      }
    }, 90);
  }

  const message = outcome
    ? outcome === "win"
      ? "You win! 🎉"
      : outcome === "lose"
        ? "I got you! 🤖"
        : "Great minds! It's a tie 🤝"
    : "Pick your move!";

  return (
    <GameShell
      title="Rock · Paper · Scissors"
      emoji="✊"
      instructions="Rock beats scissors, scissors beats paper, and paper beats rock. Pick one and see who wins!"
      onReplay={() => {
        setPlayerMove(null);
        setAiMove(null);
        setOutcome(null);
      }}
      onBack={onBack}
      score={
        <Badge variant="secondary">
          You {wins} · Me {losses}
        </Badge>
      }
    >
      <div className="mb-4 flex items-center justify-center gap-8">
        <div className="text-center">
          <p className="mb-1 text-sm font-bold text-muted-foreground">You</p>
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-border bg-card text-5xl">
            {playerMove ? MOVE_EMOJI[playerMove] : "❔"}
          </div>
        </div>
        <span className="font-display text-2xl font-bold">vs</span>
        <div className="text-center">
          <p className="mb-1 text-sm font-bold text-muted-foreground">Me</p>
          <motion.div
            animate={rolling ? { rotate: [0, -10, 10, 0] } : {}}
            transition={{ repeat: rolling ? Infinity : 0, duration: 0.3 }}
            className="flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-border bg-card text-5xl"
          >
            {aiMove ? MOVE_EMOJI[aiMove] : "❔"}
          </motion.div>
        </div>
      </div>
      <p className="mb-4 text-center font-display text-lg font-bold" aria-live="polite">
        {message}
      </p>
      <div className="flex justify-center gap-3">
        {MOVES.map((m) => (
          <Button key={m} size="lg" variant="outline" onClick={() => play(m)} disabled={rolling} className="text-3xl">
            {MOVE_EMOJI[m]}
          </Button>
        ))}
      </div>
    </GameShell>
  );
}
