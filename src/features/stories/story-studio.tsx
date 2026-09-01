"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { BookOpen, Heart, Play, Printer, Save, Trash2, Volume2, Wand2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store/app-store";
import { speak, ttsSupported } from "@/features/chat/speech";
import { celebrate } from "@/lib/celebrate";
import { playSound } from "@/lib/sound";
import { randomId } from "@/lib/utils";
import {
  generateOpening,
  generateContinuation,
  LENGTH_STEPS,
  type StoryConfig,
  type StoryLength,
  type StoryMood,
} from "./logic/generator";
import type { StoryPage } from "@/lib/data/types";

const MOODS: StoryMood[] = ["cozy", "exciting", "funny", "brave", "dreamy"];
const LENGTHS: StoryLength[] = ["short", "medium", "long"];

type View = "menu" | "create" | "play";

export function StoryStudio() {
  const stories = useAppStore((s) => s.stories);
  const saveStory = useAppStore((s) => s.saveStory);
  const updateStory = useAppStore((s) => s.updateStory);
  const deleteStory = useAppStore((s) => s.deleteStory);
  const companion = useAppStore((s) => s.companion);
  const soundOn = useAppStore((s) => s.preferences.soundOn);

  const [view, setView] = React.useState<View>("menu");
  const [config, setConfig] = React.useState<StoryConfig>({
    hero: "a curious little star",
    setting: "the Cloud Kingdom",
    mood: "cozy",
    length: "short",
  });
  const [pages, setPages] = React.useState<StoryPage[]>([]);
  const [choices, setChoices] = React.useState<string[]>([]);
  const [ended, setEnded] = React.useState(false);
  const [seed] = React.useState(() => Date.now());
  const [currentStoryId, setCurrentStoryId] = React.useState<string | null>(null);

  function startStory() {
    const opening = generateOpening(config, seed);
    setPages([{ id: randomId("p"), text: opening.text }]);
    setChoices(opening.choices);
    setEnded(false);
    setCurrentStoryId(null);
    setView("play");
    playSound("magic", soundOn);
  }

  function choose(choice: string) {
    const stepIndex = pages.length;
    const seg = generateContinuation(config, choice, stepIndex, seed);
    setPages((p) => [...p, { id: randomId("p"), text: seg.text, choiceTaken: choice }]);
    setChoices(seg.choices);
    playSound("pop", soundOn);
    if (seg.ending) {
      setEnded(true);
      celebrate("small");
    }
  }

  function handleSave(favorite: boolean) {
    const title = `${config.hero.replace(/^a |^an |^the /i, "")} in ${config.setting}`
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .slice(0, 60);
    if (currentStoryId) {
      updateStory(currentStoryId, { pages, complete: ended, favorite });
    } else {
      const id = saveStory({
        title,
        characters: [config.hero],
        setting: config.setting,
        mood: config.mood,
        pages,
        favorite,
        complete: ended,
      });
      setCurrentStoryId(id);
    }
    playSound("reward", soundOn);
  }

  function continueStory(storyId: string) {
    const story = stories.find((s) => s.id === storyId);
    if (!story) return;
    setPages(story.pages);
    setConfig((c) => ({ ...c, hero: story.characters[0] ?? c.hero, setting: story.setting, mood: (story.mood as StoryMood) ?? c.mood }));
    setCurrentStoryId(storyId);
    setEnded(story.complete);
    // regenerate choices for the next step if not complete
    if (!story.complete) {
      const seg = generateContinuation(config, "continue the journey", story.pages.length, seed);
      setChoices(seg.choices);
    } else {
      setChoices([]);
    }
    setView("play");
  }

  function printStory() {
    if (typeof window === "undefined") return;
    const w = window.open("", "_blank", "width=700,height=800");
    if (!w) return;
    const body = pages.map((p) => `<p>${p.text.replace(/</g, "&lt;")}</p>`).join("");
    w.document.write(
      `<html><head><title>My OmaGBT Story</title><style>body{font-family:Georgia,serif;max-width:600px;margin:40px auto;padding:0 20px;line-height:1.7}h1{color:#7c3aed}.tag{color:#888;font-size:12px}</style></head><body><h1>My OmaGBT Story</h1><p class="tag">A story made with ${companion.name} — created by OmaGBT (AI-assisted)</p>${body}</body></html>`,
    );
    w.document.close();
    w.print();
  }

  if (view === "menu") {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Story Studio 📖</h1>
          <p className="text-muted-foreground">Create magical tales together — you choose what happens!</p>
        </div>
        <Button size="lg" onClick={() => setView("create")}>
          <Wand2 className="h-5 w-5" /> Create a new story
        </Button>

        <div>
          <h2 className="mb-2 font-display text-xl font-bold">Your saved stories</h2>
          {stories.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No stories yet. Create your first adventure! ✨
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {stories.map((s) => (
                <Card key={s.id}>
                  <CardContent className="p-4">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="font-display font-bold">{s.title}</p>
                      {s.favorite && <Heart className="h-4 w-4 fill-bubblegum text-bubblegum" />}
                    </div>
                    <div className="mb-2 flex flex-wrap gap-1">
                      <Badge variant="secondary">{s.mood}</Badge>
                      <Badge variant="outline">{s.pages.length} pages</Badge>
                      {s.complete && <Badge variant="success">complete</Badge>}
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => continueStory(s.id)}>
                        <Play className="h-4 w-4" /> {s.complete ? "Reread" : "Continue"}
                      </Button>
                      <Button size="sm" variant="ghost" aria-label="Delete story" onClick={() => deleteStory(s.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === "create") {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="space-y-4 p-5">
          <h1 className="font-display text-2xl font-extrabold">Build your story ✨</h1>
          <p className="text-sm text-muted-foreground">
            Tip: use fun made-up characters — no real names or private details needed!
          </p>
          <div>
            <Label htmlFor="hero">Main character</Label>
            <Input id="hero" value={config.hero} onChange={(e) => setConfig({ ...config, hero: e.target.value.slice(0, 40) })} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="setting">Where does it happen?</Label>
            <Input id="setting" value={config.setting} onChange={(e) => setConfig({ ...config, setting: e.target.value.slice(0, 40) })} className="mt-1" />
          </div>
          <div>
            <Label>Mood</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <Button key={m} size="sm" variant={config.mood === m ? "default" : "outline"} onClick={() => setConfig({ ...config, mood: m })}>
                  {m}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label>Length</Label>
            <div className="mt-2 flex gap-2">
              {LENGTHS.map((l) => (
                <Button key={l} size="sm" variant={config.length === l ? "default" : "outline"} onClick={() => setConfig({ ...config, length: l })}>
                  {l} ({LENGTH_STEPS[l]})
                </Button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" size="lg" onClick={startStory}>
              <BookOpen className="h-5 w-5" /> Begin!
            </Button>
            <Button variant="ghost" onClick={() => setView("menu")}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardContent className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="font-display text-2xl font-extrabold">Your Story 📖</h1>
          <Badge variant="secondary">{config.mood}</Badge>
        </div>

        <div className="space-y-3">
          {pages.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {p.choiceTaken && (
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  You chose: {p.choiceTaken}
                </p>
              )}
              <p className="text-lg leading-relaxed">{p.text}</p>
              {i < pages.length - 1 && <hr className="mt-3 border-border" />}
            </motion.div>
          ))}
        </div>

        {!ended ? (
          <div className="mt-5 space-y-2">
            <p className="font-bold">What happens next?</p>
            {choices.map((c) => (
              <Button key={c} variant="outline" size="lg" className="w-full" onClick={() => choose(c)}>
                {c}
              </Button>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-center font-display text-lg font-bold">The End! 🌟 Great storytelling!</p>
        )}

        <div className="mt-5 flex flex-wrap gap-2 border-t-2 border-border pt-4">
          <Button size="sm" onClick={() => handleSave(false)}>
            <Save className="h-4 w-4" /> Save
          </Button>
          <Button size="sm" variant="secondary" onClick={() => handleSave(true)}>
            <Heart className="h-4 w-4" /> Save as favorite
          </Button>
          {ttsSupported() && (
            <Button size="sm" variant="outline" onClick={() => speak(pages.map((p) => p.text).join(" "), companion)}>
              <Volume2 className="h-4 w-4" /> Read aloud
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={printStory}>
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setView("menu")}>
            Done
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
