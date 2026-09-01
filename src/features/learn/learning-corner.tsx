"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Lightbulb, GraduationCap, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { LEARNING_TOPICS, type LearningTopic, type Flashcard } from "./logic/content";
import { pickQuestions, scoreToStars, type TriviaQuestion } from "@/features/games/logic/trivia";
import { useAppStore } from "@/lib/store/app-store";
import { celebrate } from "@/lib/celebrate";
import { playSound } from "@/lib/sound";
import { cn } from "@/lib/utils";

const CATEGORY_MAP: Record<string, TriviaQuestion["category"]> = {
  space: "space",
  math: "math",
  nature: "animals",
  words: "words",
};

function FlashcardDeck({ cards }: { cards: Flashcard[] }) {
  const [index, setIndex] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const soundOn = useAppStore((s) => s.preferences.soundOn);
  const card = cards[index];

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={() => {
          setFlipped((f) => !f);
          playSound("flip", soundOn);
        }}
        className="w-full max-w-sm"
        aria-label="Flip card"
      >
        <motion.div
          key={`${index}-${flipped}`}
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          className={cn(
            "flex min-h-40 items-center justify-center rounded-3xl border-2 p-6 text-center text-xl font-bold shadow-md",
            flipped ? "border-accent bg-accent/15" : "border-border bg-card",
          )}
        >
          {flipped ? card.back : card.front}
        </motion.div>
      </button>
      <p className="text-sm text-muted-foreground">
        {flipped ? "Answer" : "Question"} · tap to flip · {index + 1}/{cards.length}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setIndex((i) => (i - 1 + cards.length) % cards.length);
            setFlipped(false);
          }}
        >
          ← Prev
        </Button>
        <Button
          onClick={() => {
            setIndex((i) => (i + 1) % cards.length);
            setFlipped(false);
          }}
        >
          Next →
        </Button>
      </div>
    </div>
  );
}

function TopicQuiz({ topic }: { topic: LearningTopic }) {
  const category = CATEGORY_MAP[topic.id] ?? "science";
  const [questions] = React.useState<TriviaQuestion[]>(() => {
    const filtered = pickQuestions(4, "mixed").filter((q) => q.category === category);
    return filtered.length >= 3 ? filtered : pickQuestions(4, "mixed");
  });
  const [index, setIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [correct, setCorrect] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const unlock = useAppStore((s) => s.unlockAchievement);
  const soundOn = useAppStore((s) => s.preferences.soundOn);
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
        setDone(true);
        unlock("curious-mind");
        if ((right ? correct + 1 : correct) >= Math.ceil(questions.length / 2)) celebrate("small");
      } else {
        setIndex((n) => n + 1);
        setSelected(null);
      }
    }, 800);
  }

  if (done) {
    return (
      <div className="py-4 text-center">
        <p className="font-display text-3xl">{"⭐".repeat(scoreToStars(correct, questions.length))}</p>
        <p className="mt-1 font-bold">
          {correct}/{questions.length} correct — great learning!
        </p>
      </div>
    );
  }

  return (
    <div>
      <Progress value={((index) / questions.length) * 100} className="mb-3" />
      <p className="mb-3 font-display text-lg font-bold">{q.question}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {q.options.map((opt, i) => {
          const show = selected !== null;
          const isCorrect = i === q.answerIndex;
          const chosen = selected === i;
          return (
            <Button
              key={i}
              variant="outline"
              size="lg"
              disabled={show}
              onClick={() => answer(i)}
              className={cn(
                "justify-start",
                show && isCorrect && "border-success bg-success/20",
                show && chosen && !isCorrect && "border-destructive bg-destructive/15",
              )}
            >
              {opt}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

export function LearningCorner() {
  const [topicId, setTopicId] = React.useState<string | null>(null);
  const [simple, setSimple] = React.useState(true);
  const topic = LEARNING_TOPICS.find((t) => t.id === topicId);

  if (!topic) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Learning Corner 🎓</h1>
          <p className="text-muted-foreground">Explore, flip flashcards, and take friendly quizzes!</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {LEARNING_TOPICS.map((t, i) => (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => {
                setTopicId(t.id);
                setSimple(true);
              }}
              className="text-left"
            >
              <Card className="h-full transition-transform hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="flex items-center gap-3 p-4">
                  <span className="text-4xl">{t.emoji}</span>
                  <div>
                    <p className="font-display text-lg font-extrabold leading-tight">{t.title}</p>
                    <p className="text-sm text-muted-foreground">{t.summary}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.button>
          ))}
        </div>

        <Card className="bg-accent/10">
          <CardContent className="flex items-start gap-3 p-4">
            <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-bold">Homework helper</p>
              <p className="text-sm text-muted-foreground">
                Need a hand with homework? Your companion gives <b>hints and steps</b> to
                help you understand — it won&apos;t just do it all for you. Head to Chat and
                ask for a hint!
              </p>
              <Link href="/chat" className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "mt-2")}>
                Ask for a hint in Chat
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardContent className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Button size="icon" variant="ghost" aria-label="Back" onClick={() => setTopicId(null)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="text-3xl">{topic.emoji}</span>
          <h1 className="font-display text-2xl font-extrabold">{topic.title}</h1>
        </div>

        <Tabs defaultValue="explain">
          <TabsList className="mb-4">
            <TabsTrigger value="explain">
              <GraduationCap className="mr-1 h-4 w-4" /> Explain
            </TabsTrigger>
            <TabsTrigger value="cards">Flashcards</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
          </TabsList>

          <TabsContent value="explain">
            <div className="rounded-2xl border-2 border-border p-4">
              <p className="text-lg leading-relaxed">{simple ? topic.simple : topic.deeper}</p>
              <div className="mt-3 flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => setSimple((s) => !s)}>
                  <Lightbulb className="h-4 w-4" />
                  {simple ? "Tell me more" : "Explain it simpler"}
                </Button>
                <Badge variant="outline">{simple ? "Simple" : "Deeper"}</Badge>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                If your companion isn&apos;t sure about something, it will say so honestly —
                and suggest asking a trusted grown-up or looking it up together.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="cards">
            <FlashcardDeck cards={topic.flashcards} />
          </TabsContent>

          <TabsContent value="quiz">
            <TopicQuiz topic={topic} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
