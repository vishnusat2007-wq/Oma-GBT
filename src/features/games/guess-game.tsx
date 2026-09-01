"use client";

import * as React from "react";
import { GameShell } from "./game-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  startGuess,
  checkGuess,
  guessScore,
  type GuessState,
} from "./logic/guess-what";
import { useAppStore } from "@/lib/store/app-store";
import { celebrate } from "@/lib/celebrate";
import { playSound } from "@/lib/sound";

export function GuessGame({ onBack }: { onBack?: () => void }) {
  const [state, setState] = React.useState<GuessState>(() => startGuess());
  const [guess, setGuess] = React.useState("");
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [score, setScore] = React.useState(0);
  const recordGame = useAppStore((s) => s.recordGame);
  const soundOn = useAppStore((s) => s.preferences.soundOn);

  function newRound() {
    setState(startGuess());
    setGuess("");
    setFeedback(null);
  }

  function submit() {
    if (!guess.trim() || state.solved) return;
    if (checkGuess(state, guess)) {
      const points = guessScore(state.cluesRevealed);
      setScore((s) => s + points);
      setState((s) => ({ ...s, solved: true }));
      setFeedback(`Yes! It was ${state.subject.emoji} ${state.subject.name}! +${points} points`);
      recordGame({ game: "guess-what", score: points, difficulty: null, result: "win" });
      celebrate("small");
      playSound("win", soundOn);
    } else {
      const nextClues = Math.min(state.cluesRevealed + 1, state.subject.clues.length);
      setState((s) => ({ ...s, cluesRevealed: nextClues, attempts: s.attempts + 1 }));
      setGuess("");
      if (nextClues >= state.subject.clues.length) {
        setFeedback(`So close! Here's the last clue. It was ${state.subject.name}? Try once more or start a new round.`);
      } else {
        setFeedback("Not quite — here's another clue! 🔍");
      }
      playSound("pop", soundOn);
    }
  }

  return (
    <GameShell
      title="Guess What!"
      emoji="🔎"
      instructions="I'm thinking of an animal or object. Read the clues and type your guess. The fewer clues you need, the more points you earn!"
      onReplay={newRound}
      onBack={onBack}
      score={<Badge variant="secondary">Score: {score}</Badge>}
    >
      <div className="space-y-2">
        {state.subject.clues.slice(0, state.cluesRevealed).map((clue, i) => (
          <div key={i} className="rounded-2xl border-2 border-border bg-muted p-3 font-bold">
            Clue {i + 1}: {clue}
          </div>
        ))}
      </div>

      {feedback && (
        <p className="mt-3 text-center font-display text-lg font-bold" aria-live="polite">
          {feedback}
        </p>
      )}

      {state.solved ? (
        <Button className="mt-4 w-full" onClick={newRound}>
          Next round →
        </Button>
      ) : (
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Input
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Your guess…"
            aria-label="Your guess"
          />
          <Button type="submit" disabled={!guess.trim()}>
            Guess
          </Button>
        </form>
      )}
    </GameShell>
  );
}
