"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  MessageCircleHeart,
  Gamepad2,
  Wand2,
  BookOpenText,
  GraduationCap,
  Lock,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  LogOut,
} from "lucide-react";
import { setSignedIn } from "@/lib/auth";
import { useAppStore } from "@/lib/store/app-store";
import { useTheme } from "@/components/theme/theme-provider";
import { Mascot } from "@/components/mascot/mascot";
import { cn } from "@/lib/utils";
import { playSound } from "@/lib/sound";

const NAV = [
  { href: "/home", label: "Home", icon: Home, key: "chat" as const, always: true },
  { href: "/chat", label: "Chat", icon: MessageCircleHeart, key: "chat" as const },
  { href: "/arcade", label: "Arcade", icon: Gamepad2, key: "arcade" as const },
  { href: "/magic", label: "Magic", icon: Wand2, key: "magic" as const },
  { href: "/stories", label: "Stories", icon: BookOpenText, key: "stories" as const },
  { href: "/learn", label: "Learn", icon: GraduationCap, key: "learn" as const },
];

function Splash({ companionName }: { companionName: string }) {
  return (
    <div className="omgbt-aurora flex min-h-dvh flex-col items-center justify-center gap-4">
      <div className="animate-pulse">
        <div className="h-32 w-32 rounded-full bg-primary/30" />
      </div>
      <p className="font-display text-xl font-bold text-foreground/80">
        Waking up {companionName}…
      </p>
    </div>
  );
}

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hydrated = useAppStore((s) => s.hydrated);
  const companion = useAppStore((s) => s.companion);
  const permissions = useAppStore((s) => s.permissions);
  const soundOn = useAppStore((s) => s.preferences.soundOn);
  const setPreferences = useAppStore((s) => s.setPreferences);
  const registerVisit = useAppStore((s) => s.registerVisit);
  const { theme, toggleTheme } = useTheme();

  const signOut = React.useCallback(() => {
    setSignedIn(false);
    void fetch("/api/session", { method: "DELETE", credentials: "include" }).finally(() => {
      window.location.reload();
    });
  }, []);

  React.useEffect(() => {
    if (hydrated) registerVisit();
  }, [hydrated, registerVisit]);

  if (!hydrated) return <Splash companionName={companion.name} />;

  const visibleNav = NAV.filter(
    (item) => item.always || permissions[item.key as keyof typeof permissions],
  );

  return (
    <div className="omgbt-aurora min-h-dvh">
      <div className="mx-auto flex min-h-dvh max-w-6xl gap-4 p-3 md:p-5">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-5 hidden h-[calc(100dvh-2.5rem)] w-56 shrink-0 flex-col rounded-3xl border-2 border-border bg-card/80 p-4 backdrop-blur md:flex">
          <Link href="/home" className="mb-4 flex items-center gap-2 px-2">
            <Mascot companion={companion} size={44} animate={false} />
            <span className="font-display text-2xl font-extrabold tracking-tight">
              OmaGBT
            </span>
          </Link>
          <nav className="flex flex-1 flex-col gap-1">
            {visibleNav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => playSound("click", soundOn)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-2.5 font-bold transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-2 flex flex-col gap-2 border-t-2 border-border pt-3">
            <div className="flex gap-2">
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="flex h-10 flex-1 items-center justify-center rounded-xl border-2 border-border hover:bg-muted"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={() => {
                  setPreferences({ soundOn: !soundOn });
                  playSound("click", true);
                }}
                aria-label={soundOn ? "Mute sounds" : "Unmute sounds"}
                className="flex h-10 flex-1 items-center justify-center rounded-xl border-2 border-border hover:bg-muted"
              >
                {soundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </button>
            </div>
            <Link
              href="/parent"
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-border px-3 py-2 text-sm font-bold hover:bg-muted"
            >
              <Lock className="h-4 w-4" /> Parents
            </Link>
            <button
              onClick={signOut}
              className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-muted-foreground hover:bg-muted"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col pb-24 md:pb-0">
          {/* Mobile top bar */}
          <div className="mb-3 flex items-center justify-between rounded-2xl border-2 border-border bg-card/80 px-3 py-2 backdrop-blur md:hidden">
            <Link href="/home" className="flex min-w-0 items-center gap-2 overflow-visible">
              <span className="inline-flex h-9 w-9 shrink-0 overflow-visible">
                <Mascot companion={companion} size={34} animate={false} className="h-9 w-9" />
              </span>
              <span className="font-display text-xl font-extrabold">OmaGBT</span>
            </Link>
            <div className="flex gap-1.5">
              <button onClick={toggleTheme} aria-label="Toggle theme" className="rounded-xl border-2 border-border p-2">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setPreferences({ soundOn: !soundOn })}
                aria-label={soundOn ? "Mute" : "Unmute"}
                className="rounded-xl border-2 border-border p-2"
              >
                {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
              <Link href="/parent" aria-label="Parents area" className="rounded-xl border-2 border-border p-2">
                <Lock className="h-4 w-4" />
              </Link>
              <button onClick={signOut} aria-label="Sign out" className="rounded-xl border-2 border-border p-2">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            {children}
          </motion.main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t-2 border-border bg-card/95 px-1 py-1.5 backdrop-blur md:hidden">
        {visibleNav.slice(0, 6).map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => playSound("click", soundOn)}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[10px] font-bold",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
