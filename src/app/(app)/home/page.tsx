"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessageCircleHeart,
  Gamepad2,
  Wand2,
  BookOpenText,
  GraduationCap,
  Sparkles,
  Trophy,
  Palette,
  Flame,
} from "lucide-react";
import { Mascot, type MascotMood } from "@/components/mascot/mascot";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/app-store";
import { buildAchievements } from "@/lib/data/achievements";
import { getDailySurprise, greetingForTime } from "@/features/home/daily-surprise";
import { CustomizeDialog } from "@/features/home/customize-dialog";
import { celebrate } from "@/lib/celebrate";
import { playSound } from "@/lib/sound";
import { cn } from "@/lib/utils";

const ROOMS = [
  { href: "/chat", label: "Chat", desc: "Talk with your friend", icon: MessageCircleHeart, color: "from-grape/40 to-bubblegum/40", key: "chat" },
  { href: "/arcade", label: "Game Arcade", desc: "Six fun games", icon: Gamepad2, color: "from-sky/40 to-mint/40", key: "arcade" },
  { href: "/magic", label: "Magic Room", desc: "Amazing tricks", icon: Wand2, color: "from-bubblegum/40 to-grape/40", key: "magic" },
  { href: "/stories", label: "Story Studio", desc: "Make a tale", icon: BookOpenText, color: "from-sunshine/40 to-accent/40", key: "stories" },
  { href: "/learn", label: "Learning Corner", desc: "Discover things", icon: GraduationCap, color: "from-mint/40 to-sky/40", key: "learn" },
] as const;

export default function HomePage() {
  const profile = useAppStore((s) => s.profile);
  const companion = useAppStore((s) => s.companion);
  const streak = useAppStore((s) => s.streakDays);
  const permissions = useAppStore((s) => s.permissions);
  const conversations = useAppStore((s) => s.conversations);
  const unlockedAchievements = useAppStore((s) => s.unlockedAchievements);
  const achievements = React.useMemo(
    () => buildAchievements(unlockedAchievements),
    [unlockedAchievements],
  );
  const soundOn = useAppStore((s) => s.preferences.soundOn);

  const [customizeOpen, setCustomizeOpen] = React.useState(false);
  const [mood, setMood] = React.useState<MascotMood>("happy");
  const [surpriseOpen, setSurpriseOpen] = React.useState(false);
  const surprise = getDailySurprise();
  const unlocked = achievements.filter((a) => a.unlockedAt).length;
  const activeConvo = conversations.find((c) => !c.archived);

  return (
    <div className="space-y-5">
      {/* Hero */}
      <Card className="overflow-visible border-0 bg-card/80 backdrop-blur">
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-center sm:gap-6">
          <button
            onClick={() => {
              setMood("excited");
              playSound("magic", soundOn);
              celebrate("small");
              setTimeout(() => setMood("happy"), 1200);
            }}
            aria-label={`Give ${companion.name} a boop`}
            className="mx-auto w-[min(42vw,9.5rem)] shrink-0 overflow-visible sm:mx-0 sm:w-[150px]"
          >
            <Mascot companion={companion} mood={mood} className="h-auto w-full" />
          </button>
          <div className="min-w-0 text-center sm:text-left">
            <div className="mb-1 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Badge variant="success">
                <Flame className="h-3 w-3" /> {streak}-day streak
              </Badge>
            </div>
            <h1 className="font-display text-3xl font-extrabold sm:text-4xl">
              {greetingForTime()}, {profile.displayName}!
            </h1>
            <p className="mt-1 text-muted-foreground">
              I&apos;m <span className="font-bold text-foreground">{companion.name}</span>. What
              should we do together today? (Tap me for a surprise!)
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              {activeConvo && permissions.chat && (
                <Link
                  href="/chat"
                  onClick={() => playSound("click", soundOn)}
                  className={buttonVariants({ variant: "default" })}
                >
                  <MessageCircleHeart className="h-5 w-5" /> Continue chat
                </Link>
              )}
              <Button variant="secondary" onClick={() => setSurpriseOpen((v) => !v)}>
                <Sparkles className="h-5 w-5" /> Daily surprise
              </Button>
              <Button variant="outline" onClick={() => setCustomizeOpen(true)}>
                <Palette className="h-5 w-5" /> Customize
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {surpriseOpen && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-accent bg-accent/15">
            <CardContent className="flex items-center gap-3 p-4">
              <span className="text-3xl">{surprise.emoji}</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Today&apos;s {surprise.kind}
                </p>
                <p className="font-bold">{surprise.text}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Rooms */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
        {ROOMS.filter((r) => permissions[r.key as keyof typeof permissions]).map(
          (room, i) => {
            const Icon = room.icon;
            return (
              <motion.div
                key={room.href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={room.href}
                  onClick={() => playSound("click", soundOn)}
                  className="group block h-full"
                >
                  <Card
                    className={cn(
                      "h-full bg-gradient-to-br transition-transform group-hover:-translate-y-1 group-hover:shadow-xl",
                      room.color,
                    )}
                  >
                    <CardContent className="flex flex-col items-start gap-2 p-4">
                      <span className="rounded-2xl bg-card/70 p-2.5">
                        <Icon className="h-6 w-6 text-primary" />
                      </span>
                      <p className="font-display text-lg font-extrabold leading-tight">
                        {room.label}
                      </p>
                      <p className="text-sm text-foreground/70">{room.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          },
        )}

        <Link href="#achievements" className="group block h-full" onClick={() => playSound("click", soundOn)}>
          <Card className="h-full bg-gradient-to-br from-accent/40 to-sunshine/40 transition-transform group-hover:-translate-y-1">
            <CardContent className="flex flex-col items-start gap-2 p-4">
              <span className="rounded-2xl bg-card/70 p-2.5">
                <Trophy className="h-6 w-6 text-primary" />
              </span>
              <p className="font-display text-lg font-extrabold leading-tight">Achievements</p>
              <p className="text-sm text-foreground/70">
                {unlocked} of {achievements.length} unlocked
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Achievements strip */}
      <Card id="achievements">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">Your achievements</h2>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {achievements.map((a) => (
              <div
                key={a.key}
                title={`${a.title} — ${a.description}`}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl border-2 p-2 text-center",
                  a.unlockedAt
                    ? "border-accent bg-accent/10"
                    : "border-dashed border-border opacity-50 grayscale",
                )}
              >
                <span className="text-2xl">{a.icon}</span>
                <span className="text-[10px] font-bold leading-tight">{a.title}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <CustomizeDialog open={customizeOpen} onOpenChange={setCustomizeOpen} />
    </div>
  );
}
