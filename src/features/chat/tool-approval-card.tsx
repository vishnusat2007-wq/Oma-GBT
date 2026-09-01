"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, X, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TOOLS, type ToolProposal } from "@/lib/tools/registry";
import { useAppStore } from "@/lib/store/app-store";
import { playSound } from "@/lib/sound";

type Phase = "offer" | "pin" | "result" | "denied";

export function ToolApprovalCard({
  proposal,
  onResolved,
}: {
  proposal: ToolProposal;
  onResolved: (assistantMessage?: string) => void;
}) {
  const def = TOOLS[proposal.tool];
  const router = useRouter();
  const parentPin = useAppStore((s) => s.parent.pin);
  const approvedWebsites = useAppStore((s) => s.approvedWebsites);
  const soundOn = useAppStore((s) => s.preferences.soundOn);
  const addReminder = useAppStore((s) => s.addReminder);
  const addNote = useAppStore((s) => s.addNote);
  const requestTool = useAppStore((s) => s.requestTool);
  const addAudit = useAppStore((s) => s.addAudit);

  const [phase, setPhase] = React.useState<Phase>("offer");
  const [pin, setPin] = React.useState("");
  const [pinError, setPinError] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [resultText, setResultText] = React.useState("");

  async function execute(approved: boolean) {
    setBusy(true);
    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: proposal.tool,
          args: proposal.args,
          approved,
          allowlist: approvedWebsites.map((w) => w.url),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error ?? "That didn't work.";
        setResultText(msg);
        setPhase("result");
        addAudit({ tool: proposal.tool, summary: proposal.summary, outcome: "failed", requiredApproval: def.requiresApproval });
        onResolved(msg);
        return;
      }

      const display: string = data.result?.display ?? "Done!";
      // In-app side effects.
      if (proposal.tool === "create_reminder") {
        addReminder(String(proposal.args.title), String(proposal.args.when ?? "later"));
      } else if (proposal.tool === "save_note") {
        addNote(String(proposal.args.title ?? "Note"), String(proposal.args.body));
      } else if (proposal.tool === "start_game") {
        router.push(`/arcade?game=${proposal.args.game}`);
      } else if (proposal.tool === "open_website" && data.result?.ok) {
        if (typeof window !== "undefined") window.open(String(proposal.args.url), "_blank", "noopener,noreferrer");
      }

      addAudit({ tool: proposal.tool, summary: proposal.summary, outcome: "completed", requiredApproval: def.requiresApproval });
      playSound("reward", soundOn);
      setResultText(display);
      setPhase("result");
      onResolved(display);
    } catch {
      const msg = "Something went wrong. Let's try again later.";
      setResultText(msg);
      setPhase("result");
      onResolved(msg);
    } finally {
      setBusy(false);
    }
  }

  function handleApprove() {
    if (def.requiresApproval) {
      setPhase("pin");
    } else {
      void execute(true);
    }
  }

  function submitPin() {
    if (pin === parentPin) {
      setPinError(false);
      void execute(true);
    } else {
      setPinError(true);
      playSound("lose", soundOn);
    }
  }

  function askLater() {
    requestTool({
      tool: proposal.tool,
      summary: proposal.summary,
      args: proposal.args,
      requiresApproval: def.requiresApproval,
    });
    const msg = "I've sent that to a grown-up to look at. We can do it once they say yes! 👍";
    setResultText(msg);
    setPhase("denied");
    onResolved(msg);
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-start">
      <Card className="max-w-[85%] border-accent bg-accent/10">
        <CardContent className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl">{def.icon}</span>
            <div>
              <p className="font-display font-bold leading-tight">{def.title}</p>
              <div className="flex gap-1">
                {def.online && <Badge variant="warning">online</Badge>}
                {def.requiresApproval && (
                  <Badge variant="outline">
                    <Lock className="h-2.5 w-2.5" /> needs grown-up
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <p className="text-sm">
            I&apos;d like to: <span className="font-bold">{proposal.summary}</span>
          </p>

          {phase === "offer" && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={handleApprove} disabled={busy}>
                <Check className="h-4 w-4" />
                {def.requiresApproval ? "Approve" : "Yes, do it"}
              </Button>
              {def.requiresApproval && (
                <Button size="sm" variant="secondary" onClick={askLater} disabled={busy}>
                  Ask a grown-up later
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => onResolved()} disabled={busy}>
                <X className="h-4 w-4" /> No thanks
              </Button>
            </div>
          )}

          {phase === "pin" && (
            <div className="mt-3 space-y-2">
              <p className="flex items-center gap-1 text-sm font-bold">
                <ShieldCheck className="h-4 w-4" /> Grown-up PIN needed
              </p>
              <div className="flex gap-2">
                <Input
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitPin()}
                  placeholder="PIN"
                  aria-label="Parent PIN"
                  className="max-w-32"
                  autoFocus
                />
                <Button size="sm" onClick={submitPin} disabled={busy}>
                  Approve
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setPhase("offer")}>
                  Cancel
                </Button>
              </div>
              {pinError && <p className="text-sm font-bold text-destructive">That PIN isn&apos;t right.</p>}
            </div>
          )}

          {(phase === "result" || phase === "denied") && (
            <p className="mt-3 rounded-xl bg-card p-2 text-sm font-bold">{resultText || "Okay!"}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
