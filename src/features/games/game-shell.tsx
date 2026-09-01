"use client";

import * as React from "react";
import { Info, RotateCcw, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function GameShell({
  title,
  emoji,
  instructions,
  onReplay,
  onBack,
  score,
  toolbar,
  children,
}: {
  title: string;
  emoji: string;
  instructions: string;
  onReplay?: () => void;
  onBack?: () => void;
  score?: React.ReactNode;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [showHelp, setShowHelp] = React.useState(false);
  return (
    <Card className="mx-auto max-w-2xl">
      <CardContent className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {onBack && (
              <Button size="icon" variant="ghost" aria-label="Back to arcade" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <span className="text-3xl">{emoji}</span>
            <h2 className="font-display text-2xl font-extrabold">{title}</h2>
          </div>
          <div className="flex items-center gap-1">
            {score}
            <Button size="icon" variant="ghost" aria-label="How to play" onClick={() => setShowHelp((v) => !v)}>
              <Info className="h-5 w-5" />
            </Button>
            {onReplay && (
              <Button size="icon" variant="ghost" aria-label="Play again" onClick={onReplay}>
                <RotateCcw className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {showHelp && (
          <div className="mb-4 rounded-2xl bg-muted p-3 text-sm">
            <Badge className="mb-1">How to play</Badge>
            <p>{instructions}</p>
          </div>
        )}

        {toolbar && <div className="mb-4 flex flex-wrap gap-2">{toolbar}</div>}

        {children}
      </CardContent>
    </Card>
  );
}

export function DifficultyPicker<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1.5">
      {options.map((opt) => (
        <Button
          key={opt}
          size="sm"
          variant={value === opt ? "default" : "outline"}
          onClick={() => onChange(opt)}
        >
          {opt}
        </Button>
      ))}
    </div>
  );
}
