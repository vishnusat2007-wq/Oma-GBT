"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { GameShell, DifficultyPicker } from "./game-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { pickQuestions, scoreToStars, type TriviaQuestion } from "./logic/trivia";
import { useAppStore } from "@/lib/store/app-store";
import { celebrate } from "@/lib/celebrate";
import { playSound } from "@/lib/sound";
import { cn } from "@/lib/utils";

type Level = "easy" | "medium" | "hard" | "mixed";
const ROUND = 5;

export function TriviaGame({ onBack }: { onBack?: () => void }) {
  const [level, setLevel] = React.useState<Level>("mixed");
  const [questions, setQuestions] = React.useState<TriviaQuestion[]>(() => pickQuestions(ROUND, "mixed"));
  const [index, setIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [correct, setCorrect] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const recordGame = useAppStore((s) => s.recordGame);
  const soundOn = useAppStore((s) => s.preferences.soundOn);

  function restart(l: Level) {
    setQuestions(pickQuestions(ROUND, l === "mixed" ? "mixed" : l));
    setIndex(0);
    setSelected(null);
    setCorrect(0);
    setDone(false);
  }

  const q = questions[index];

  function answer(i: number) {
    if (selected !== null) return;
    setSelected(i);
    const right = i === q.answerIndex;
    if (right) {
      setCorrect((c) => c + 1);
      playSound("pop", soundOn);
    } else {
      playSound("lose", soundOn);
    }
    setTimeout(() => {
      if (index + 1 >= questions.length) {
        const finalCorrect = right ? correct + 1 : correct;
        setDone(true);
        recordGame({ game: "trivia", score: finalCorrect, difficulty: level === "mixed" ? "medium" : level, result: "complete" });
        if (finalCorrect >= 3) {
          celebrate("big");
          playSound("win", soundOn);
        }
      } else {
        setIndex((n) => n + 1);
        setSelected(null);
      }
    }, 900);
  }

  if (done) {
    return (
      <GameShell title="Trivia Quiz" emoji="🎯" instructions="" onReplay={() => restart(level)} onBack={onBack}>
        <div className="py-6 text-center">
          <p className="font-display text-3xl font-extrabold">{"⭐".repeat(scoreToStars(correct, questions.length))}</p>
          <p className="mt-2 text-xl font-bold">
            You got {correct} of {questions.length} right!
          </p>
          <Button className="mt-4" onClick={() => restart(level)}>
            Play again
          </Button>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell
      title="Trivia Quiz"
      emoji="🎯"
      instructions="Answer the multiple-choice questions. Get 3 or more right to earn a celebration!"
      onBack={onBack}
      toolbar={
        <DifficultyPicker
          value={level}
          options={["easy", "medium", "hard", "mixed"] as const}
          onChange={(l) => {
            setLevel(l);
            restart(l);
          }}
        />
      }
      score={
        <Badge variant="secondary">
          {index + 1}/{questions.length} · ⭐ {correct}
        </Badge>
      }
    >
      <motion.div key={q.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <p className="mb-4 text-center font-display text-xl font-bold">{q.question}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {q.options.map((opt, i) => {
            const isCorrect = i === q.answerIndex;
            const chosen = selected === i;
            const show = selected !== null;
            return (
              <Button
                key={i}
                variant="outline"
                size="lg"
                onClick={() => answer(i)}
                disabled={show}
                className={cn(
                  "justify-start text-left",
                  show && isCorrect && "border-success bg-success/20",
                  show && chosen && !isCorrect && "border-destructive bg-destructive/15",
                )}
              >
                {opt}
                {show && isCorrect && " ✅"}
                {show && chosen && !isCorrect && " ❌"}
              </Button>
            );
          })}
        </div>
      </motion.div>
    </GameShell>
  );
}
