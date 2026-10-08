"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Mascot } from "@/components/mascot/mascot";
import { useAppStore } from "@/lib/store/app-store";
import { playSound } from "@/lib/sound";
import { cn } from "@/lib/utils";
import type {
  MascotAccessory,
  MascotColor,
  MascotShape,
  PersonalityTrait,
} from "@/lib/data/types";

const COLORS: MascotColor[] = ["grape", "sky", "bubblegum", "sunshine", "mint"];
const SHAPES: MascotShape[] = ["round", "star", "bean"];
const ACCESSORIES: MascotAccessory[] = ["none", "bow", "cap", "crown", "glasses"];
const TRAITS: PersonalityTrait[] = ["silly", "curious", "gentle", "brave", "creative", "sporty"];

export function CustomizeDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const companion = useAppStore((s) => s.companion);
  const setCompanion = useAppStore((s) => s.setCompanion);
  const soundOn = useAppStore((s) => s.preferences.soundOn);
  const [interestDraft, setInterestDraft] = React.useState("");

  const toggleTrait = (trait: PersonalityTrait) => {
    const has = companion.personality.includes(trait);
    const next = has
      ? companion.personality.filter((t) => t !== trait)
      : [...companion.personality, trait].slice(0, 4);
    setCompanion({ personality: next });
    playSound("pop", soundOn);
  };

  const addInterest = () => {
    const val = interestDraft.trim();
    if (!val) return;
    if (!companion.interests.includes(val)) {
      setCompanion({ interests: [...companion.interests, val].slice(0, 10) });
    }
    setInterestDraft("");
    playSound("pop", soundOn);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Customize your friend"
      description="Make your companion truly yours!"
      className="max-w-xl"
    >
      <div className="flex flex-col items-center gap-3">
        <Mascot companion={companion} mood="happy" className="h-auto w-[min(40vw,8rem)]" />
        <Input
          aria-label="Companion name"
          value={companion.name}
          onChange={(e) => setCompanion({ name: e.target.value.slice(0, 20) })}
          className="max-w-56 text-center font-display text-lg"
        />
      </div>

      <div className="mt-5 space-y-5">
        <div>
          <Label>Color</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                aria-label={c}
                onClick={() => {
                  setCompanion({ color: c });
                  playSound("pop", soundOn);
                }}
                className={cn(
                  "h-10 w-10 rounded-full border-4 transition-transform hover:scale-110",
                  companion.color === c ? "border-foreground" : "border-transparent",
                )}
                style={{ background: `var(--${c})` }}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Shape</Label>
            <div className="mt-2 flex gap-2">
              {SHAPES.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={companion.shape === s ? "default" : "outline"}
                  onClick={() => {
                    setCompanion({ shape: s });
                    playSound("pop", soundOn);
                  }}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label>Accessory</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {ACCESSORIES.map((a) => (
                <Button
                  key={a}
                  size="sm"
                  variant={companion.accessory === a ? "default" : "outline"}
                  onClick={() => {
                    setCompanion({ accessory: a });
                    playSound("pop", soundOn);
                  }}
                >
                  {a}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <Label>Personality (pick up to 4)</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {TRAITS.map((t) => (
              <button key={t} onClick={() => toggleTrait(t)}>
                <Badge variant={companion.personality.includes(t) ? "default" : "outline"}>
                  {t}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="interest">Interests</Label>
          <div className="mt-2 flex gap-2">
            <Input
              id="interest"
              value={interestDraft}
              onChange={(e) => setInterestDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addInterest()}
              placeholder="e.g. dinosaurs"
            />
            <Button onClick={addInterest} type="button">
              Add
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {companion.interests.map((i) => (
              <button
                key={i}
                onClick={() =>
                  setCompanion({ interests: companion.interests.filter((x) => x !== i) })
                }
              >
                <Badge variant="secondary">{i} ✕</Badge>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Voice pitch</Label>
            <Slider
              aria-label="Voice pitch"
              min={0.5}
              max={2}
              step={0.1}
              value={companion.voicePitch}
              onValueChange={(v) => setCompanion({ voicePitch: v })}
              className="mt-3"
            />
          </div>
          <div>
            <Label>Voice speed</Label>
            <Slider
              aria-label="Voice speed"
              min={0.5}
              max={2}
              step={0.1}
              value={companion.voiceRate}
              onValueChange={(v) => setCompanion({ voiceRate: v })}
              className="mt-3"
            />
          </div>
        </div>
      </div>

      <Button className="mt-6 w-full" size="lg" onClick={() => onOpenChange(false)}>
        All done! ✨
      </Button>
    </Dialog>
  );
}
