"use client";

import * as React from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store/app-store";
import { DEMO_PIN } from "@/lib/demo/seed";
import { playSound } from "@/lib/sound";

export function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const parentPin = useAppStore((s) => s.parent.pin);
  const demoMode = useAppStore((s) => s.demoMode);
  const soundOn = useAppStore((s) => s.preferences.soundOn);
  const [pin, setPin] = React.useState("");
  const [error, setError] = React.useState(false);
  const [attempts, setAttempts] = React.useState(0);
  const locked = attempts >= 5;

  function submit() {
    if (locked) return;
    if (pin === parentPin) {
      playSound("reward", soundOn);
      onUnlock();
    } else {
      setError(true);
      setAttempts((a) => a + 1);
      setPin("");
      playSound("lose", soundOn);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <span className="rounded-full bg-primary/15 p-4">
            <Lock className="h-8 w-8 text-primary" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-extrabold">Parents area</h1>
            <p className="text-sm text-muted-foreground">Enter the parent PIN to continue.</p>
          </div>
          <Input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="••••"
            aria-label="Parent PIN"
            className="text-center text-2xl tracking-[0.5em]"
            disabled={locked}
            autoFocus
          />
          {error && !locked && <p className="text-sm font-bold text-destructive">Incorrect PIN. Try again.</p>}
          {locked && (
            <p className="text-sm font-bold text-destructive">
              Too many attempts. Please reload the page to try again.
            </p>
          )}
          <Button className="w-full" size="lg" onClick={submit} disabled={locked}>
            <ShieldCheck className="h-5 w-5" /> Unlock
          </Button>
          {demoMode && (
            <p className="rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
              Demo mode PIN: <span className="font-bold">{DEMO_PIN}</span>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
