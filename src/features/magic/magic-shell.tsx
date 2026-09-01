"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw, Lightbulb, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store/app-store";

export function MagicShell({
  title,
  emoji,
  intro,
  secret,
  onReplay,
  onBack,
  children,
}: {
  title: string;
  emoji: string;
  intro: string;
  secret: string;
  onReplay?: () => void;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  const [showSecret, setShowSecret] = React.useState(false);
  const unlock = useAppStore((s) => s.unlockAchievement);

  return (
    <Card className="mx-auto max-w-2xl">
      <CardContent className="p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {onBack && (
              <Button size="icon" variant="ghost" aria-label="Back to magic room" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <span className="text-3xl">{emoji}</span>
            <h2 className="font-display text-2xl font-extrabold">{title}</h2>
          </div>
          {onReplay && (
            <Button size="icon" variant="ghost" aria-label="Try again" onClick={onReplay}>
              <RotateCcw className="h-5 w-5" />
            </Button>
          )}
        </div>

        <div className="mb-4 flex items-start gap-2 rounded-2xl bg-muted p-3 text-sm">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{intro} <span className="font-bold">These are fun illusions and clever patterns — not real magic powers.</span></p>
        </div>

        {children}

        <div className="mt-5 border-t-2 border-border pt-4">
          {showSecret ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-accent/15 p-3">
              <Badge variant="accent" className="mb-1">
                <Lightbulb className="h-3 w-3" /> The secret
              </Badge>
              <p className="text-sm font-bold">{secret}</p>
            </motion.div>
          ) : (
            <Button
              variant="secondary"
              onClick={() => {
                setShowSecret(true);
                unlock("secret-keeper");
              }}
            >
              <Lightbulb className="h-5 w-5" /> Learn the secret
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
