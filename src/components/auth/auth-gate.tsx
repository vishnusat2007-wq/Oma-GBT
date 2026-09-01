"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { LogIn, Eye, EyeOff, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mascot, type MascotMood } from "@/components/mascot/mascot";
import { verifyCredentials, isSignedIn, setSignedIn } from "@/lib/auth";
import { celebrate } from "@/lib/celebrate";
import type { CompanionConfig } from "@/lib/data/types";

const LOGIN_MASCOT: CompanionConfig = {
  name: "Oma",
  color: "grape",
  shape: "round",
  accessory: "crown",
  personality: ["gentle", "silly"],
  interests: [],
  voicePitch: 1.3,
  voiceRate: 1,
};

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [attempts, setAttempts] = React.useState(0);
  const [mood, setMood] = React.useState<MascotMood>("happy");
  const locked = attempts >= 6;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || locked) return;
    setBusy(true);
    setError(null);
    setMood("thinking");
    const ok = await verifyCredentials(username, password);
    if (ok) {
      setSignedIn(true);
      setMood("excited");
      celebrate("big");
      setTimeout(onSuccess, 500);
    } else {
      setAttempts((a) => a + 1);
      setError("Hmm, that username or password isn't right. Try again!");
      setPassword("");
      setMood("sad");
      setBusy(false);
    }
  }

  return (
    <div className="omgbt-aurora flex min-h-dvh items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="w-full max-w-sm"
      >
        <Card className="border-0 bg-card/85 shadow-2xl backdrop-blur">
          <CardContent className="flex flex-col items-center gap-4 p-7 text-center">
            <Mascot companion={LOGIN_MASCOT} mood={mood} size={130} />
            <div>
              <h1 className="font-display text-3xl font-extrabold">OmaGBT</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Jesvitha&apos;s very own AI friend 💜
              </p>
            </div>

            <form onSubmit={submit} className="w-full space-y-3 text-left">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError(null);
                  }}
                  placeholder="Your username"
                  autoComplete="username"
                  autoFocus
                  disabled={locked}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={show ? "text" : "password"}
                    inputMode="numeric"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Your secret password"
                    autoComplete="current-password"
                    disabled={locked}
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                  >
                    {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && !locked && (
                <p className="text-sm font-bold text-destructive" role="alert">
                  {error}
                </p>
              )}
              {locked && (
                <p className="text-sm font-bold text-destructive" role="alert">
                  Too many tries. Please reload the page and try again.
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={busy || locked || !username || !password}
              >
                <LogIn className="h-5 w-5" />
                {busy ? "Checking…" : "Let me in!"}
              </Button>
            </form>

            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Heart className="h-3 w-3 fill-bubblegum text-bubblegum" /> Made with love, just for you
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<{ mounted: boolean; authed: boolean }>({
    mounted: false,
    authed: false,
  });

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ mounted: true, authed: isSignedIn() });
  }, []);

  if (!state.mounted) {
    return <div className="omgbt-aurora min-h-dvh" />;
  }

  if (!state.authed) {
    return <LoginScreen onSuccess={() => setState({ mounted: true, authed: true })} />;
  }

  return <>{children}</>;
}
