"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { GameShell, DifficultyPicker } from "./game-shell";
import { Badge } from "@/components/ui/badge";
import {
  emptyBoard,
  winner,
  bestMove,
  type Board,
  type Difficulty,
} from "./logic/tic-tac-toe";
import { useAppStore } from "@/lib/store/app-store";
import { celebrate } from "@/lib/celebrate";
import { playSound } from "@/lib/sound";
import { cn } from "@/lib/utils";

const PLAYER = "X" as const;
const AI = "O" as const;

export function TicTacToeGame({ onBack }: { onBack?: () => void }) {
  const [board, setBoard] = React.useState<Board>(emptyBoard);
  const [difficulty, setDifficulty] = React.useState<Difficulty>("medium");
  const [busy, setBusy] = React.useState(false);
  const recordGame = useAppStore((s) => s.recordGame);
  const soundOn = useAppStore((s) => s.preferences.soundOn);
  const result = winner(board);
  const recordedRef = React.useRef(false);

  const reset = React.useCallback(() => {
    setBoard(emptyBoard());
    setBusy(false);
    recordedRef.current = false;
  }, []);

  React.useEffect(() => {
    if (result && !recordedRef.current) {
      recordedRef.current = true;
      const outcome = result === PLAYER ? "win" : result === AI ? "lose" : "draw";
      recordGame({ game: "tic-tac-toe", score: outcome === "win" ? 1 : 0, difficulty, result: outcome });
      if (outcome === "win") {
        celebrate("big");
        playSound("win", soundOn);
      } else if (outcome === "lose") {
        playSound("lose", soundOn);
      } else {
        playSound("pop", soundOn);
      }
    }
  }, [result, difficulty, recordGame, soundOn]);

  function play(i: number) {
    if (board[i] || result || busy) return;
    const next = [...board];
    next[i] = PLAYER;
    setBoard(next);
    playSound("click", soundOn);
    if (winner(next)) return;
    setBusy(true);
    setTimeout(() => {
      const move = bestMove(next, AI, difficulty);
      if (move >= 0) {
        const after = [...next];
        after[move] = AI;
        setBoard(after);
        playSound("pop", soundOn);
      }
      setBusy(false);
    }, 380);
  }

  const status = result
    ? result === "draw"
      ? "It's a tie! 🤝"
      : result === PLAYER
        ? "You win! 🎉"
        : "I win this time! 🤖"
    : busy
      ? "Hmm, my turn…"
      : "Your turn! You're ❌";

  return (
    <GameShell
      title="Tic-Tac-Toe"
      emoji="⭕"
      instructions="Take turns placing your mark. Get three in a row across, down, or diagonally to win. You are X and go first!"
      onReplay={reset}
      onBack={onBack}
      toolbar={<DifficultyPicker value={difficulty} options={["easy", "medium", "hard"] as const} onChange={(d) => { setDifficulty(d); reset(); }} />}
      score={<Badge variant="secondary">{difficulty}</Badge>}
    >
      <p className="mb-3 text-center font-display text-lg font-bold" aria-live="polite">
        {status}
      </p>
      <div className="mx-auto grid w-full max-w-xs grid-cols-3 gap-2">
        {board.map((cell, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.9 }}
            onClick={() => play(i)}
            disabled={Boolean(cell) || Boolean(result)}
            aria-label={`Square ${i + 1}${cell ? `, ${cell}` : ", empty"}`}
            className={cn(
              "flex aspect-square items-center justify-center rounded-2xl border-2 border-border bg-card text-4xl font-extrabold transition-colors hover:bg-muted disabled:hover:bg-card",
              cell === "X" && "text-primary",
              cell === "O" && "text-accent-foreground",
            )}
          >
            {cell}
          </motion.button>
        ))}
      </div>
    </GameShell>
  );
}
