"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Download,
  Trash2,
  Plus,
  Check,
  X,
  ShieldCheck,
  KeyRound,
  Home,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/store/app-store";
import { isDemoMode, isSupabaseConfigured } from "@/lib/env";
import { TOOLS } from "@/lib/tools/registry";
import type { AgeRange, FeaturePermissions } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const AGE_RANGES: AgeRange[] = ["5-6", "7-8", "9-10", "11-12"];

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p className="font-bold">{label}</p>
        {desc && <p className="text-sm text-muted-foreground">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

export function ParentDashboard() {
  const store = useAppStore();
  const [aiConfigured, setAiConfigured] = React.useState<boolean | null>(null);
  const [newSite, setNewSite] = React.useState({ title: "", url: "" });
  const [pinForm, setPinForm] = React.useState({ current: "", next: "" });
  const [pinMsg, setPinMsg] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((d) => setAiConfigured(Boolean(d.aiConfigured)))
      .catch(() => setAiConfigured(false));
  }, []);

  const pendingTools = store.toolRequests.filter((t) => t.status === "pending");

  function exportData() {
    const blob = new Blob([store.exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "omagbt-data-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function changePin() {
    if (pinForm.current !== store.parent.pin) {
      setPinMsg("Current PIN is incorrect.");
      return;
    }
    if (!/^\d{4,8}$/.test(pinForm.next)) {
      setPinMsg("New PIN must be 4–8 digits.");
      return;
    }
    store.setParentPin(pinForm.next);
    setPinForm({ current: "", next: "" });
    setPinMsg("PIN updated!");
  }

  const feature = (key: keyof FeaturePermissions, label: string, desc: string) => (
    <Row label={label} desc={desc}>
      <Switch
        checked={store.permissions[key]}
        onCheckedChange={(v) => store.setPermissions({ [key]: v })}
        aria-label={label}
      />
    </Row>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Parent dashboard</h1>
          <p className="text-muted-foreground">You&apos;re in control of {store.profile.displayName}&apos;s experience.</p>
        </div>
        <Link href="/home" className={buttonVariants({ variant: "outline" })}>
          <Home className="h-4 w-4" /> Back to OmaGBT
        </Link>
      </div>

      {/* Emergency switch */}
      <Card className={cn("border-2", store.parent.emergencyOnlineDisable ? "border-destructive bg-destructive/10" : "border-border")}>
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className={cn("h-6 w-6", store.parent.emergencyOnlineDisable ? "text-destructive" : "text-muted-foreground")} />
            <div>
              <p className="font-bold">Emergency: disable all online tools</p>
              <p className="text-sm text-muted-foreground">
                Instantly blocks web search, weather, and opening websites.
              </p>
            </div>
          </div>
          <Switch
            checked={store.parent.emergencyOnlineDisable}
            onCheckedChange={(v) => store.setEmergencyDisable(v)}
            aria-label="Emergency disable online tools"
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="profile">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="time">Time</TabsTrigger>
          <TabsTrigger value="web">Websites</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        {/* PROFILE + AI config */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Child profile</CardTitle>
              <CardDescription>Only a nickname is used — no real name required.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="nick">Nickname</Label>
                <Input
                  id="nick"
                  value={store.profile.displayName}
                  onChange={(e) => store.setProfile({ displayName: e.target.value.slice(0, 40) })}
                  className="mt-1 max-w-xs"
                />
              </div>
              <div>
                <Label>Age range</Label>
                <div className="mt-2 flex gap-2">
                  {AGE_RANGES.map((a) => (
                    <Button
                      key={a}
                      size="sm"
                      variant={store.profile.ageRange === a ? "default" : "outline"}
                      onClick={() => store.setProfile({ ageRange: a })}
                    >
                      {a}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI &amp; environment</CardTitle>
              <CardDescription>Configured with server environment variables. Secrets are never shown here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Row label="Mode" desc="Demo mode uses safe, local mock responses.">
                <Badge variant={isDemoMode() ? "warning" : "success"}>{isDemoMode() ? "Demo" : "Live"}</Badge>
              </Row>
              <Row label="AI provider" desc="Set AI_API_KEY to enable real streaming AI.">
                <Badge variant={aiConfigured ? "success" : "outline"}>
                  {aiConfigured === null ? "…" : aiConfigured ? "Connected" : "Mock"}
                </Badge>
              </Row>
              <Row label="Supabase" desc="Set NEXT_PUBLIC_SUPABASE_URL & key to enable cloud storage.">
                <Badge variant={isSupabaseConfigured() ? "success" : "outline"}>
                  {isSupabaseConfigured() ? "Connected" : "Local only"}
                </Badge>
              </Row>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5" /> Change parent PIN
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Input
                  type="password"
                  placeholder="Current PIN"
                  value={pinForm.current}
                  onChange={(e) => setPinForm({ ...pinForm, current: e.target.value })}
                  className="max-w-40"
                />
                <Input
                  type="password"
                  placeholder="New PIN (4–8 digits)"
                  value={pinForm.next}
                  onChange={(e) => setPinForm({ ...pinForm, next: e.target.value })}
                  className="max-w-48"
                />
                <Button onClick={changePin}>Update PIN</Button>
              </div>
              {pinMsg && <p className="text-sm font-bold">{pinMsg}</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FEATURES */}
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Allowed features</CardTitle>
              <CardDescription>Turn areas on or off for your child.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {feature("chat", "Companion chat", "Talking with the AI friend.")}
              {feature("arcade", "Game arcade", "All six games.")}
              {feature("magic", "Magic room", "Interactive magic tricks.")}
              {feature("stories", "Story studio", "Creating and saving stories.")}
              {feature("learn", "Learning corner", "Lessons, flashcards, quizzes.")}
              {feature("onlineTools", "Online tools", "Web search, weather, opening approved sites.")}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TIME */}
        <TabsContent value="time">
          <Card>
            <CardHeader>
              <CardTitle>Daily limits &amp; quiet hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Daily time limit: {store.preferences.dailyLimitMinutes} minutes</Label>
                <Slider
                  min={10}
                  max={180}
                  step={5}
                  value={store.preferences.dailyLimitMinutes}
                  onValueChange={(v) => store.setPreferences({ dailyLimitMinutes: v })}
                  className="mt-3"
                  aria-label="Daily time limit"
                />
              </div>
              <Row label="Quiet hours" desc="A gentle reminder appears during these hours.">
                <Switch
                  checked={store.preferences.quietHours.enabled}
                  onCheckedChange={(v) =>
                    store.setPreferences({ quietHours: { ...store.preferences.quietHours, enabled: v } })
                  }
                  aria-label="Quiet hours"
                />
              </Row>
              {store.preferences.quietHours.enabled && (
                <div className="flex gap-3">
                  <div>
                    <Label htmlFor="qs">From</Label>
                    <Input
                      id="qs"
                      type="time"
                      value={store.preferences.quietHours.start}
                      onChange={(e) =>
                        store.setPreferences({ quietHours: { ...store.preferences.quietHours, start: e.target.value } })
                      }
                      className="mt-1 max-w-32"
                    />
                  </div>
                  <div>
                    <Label htmlFor="qe">Until</Label>
                    <Input
                      id="qe"
                      type="time"
                      value={store.preferences.quietHours.end}
                      onChange={(e) =>
                        store.setPreferences({ quietHours: { ...store.preferences.quietHours, end: e.target.value } })
                      }
                      className="mt-1 max-w-32"
                    />
                  </div>
                </div>
              )}
              <div>
                <Label>Conversation retention: {store.preferences.retentionDays} days</Label>
                <Slider
                  min={7}
                  max={365}
                  step={1}
                  value={store.preferences.retentionDays}
                  onValueChange={(v) => store.setPreferences({ retentionDays: v })}
                  className="mt-3"
                  aria-label="Retention days"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WEBSITES */}
        <TabsContent value="web">
          <Card>
            <CardHeader>
              <CardTitle>Approved websites</CardTitle>
              <CardDescription>Only these sites can be opened by the online tools.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Input
                  placeholder="Title"
                  value={newSite.title}
                  onChange={(e) => setNewSite({ ...newSite, title: e.target.value })}
                  className="max-w-40"
                />
                <Input
                  placeholder="https://…"
                  value={newSite.url}
                  onChange={(e) => setNewSite({ ...newSite, url: e.target.value })}
                  className="max-w-64"
                />
                <Button
                  onClick={() => {
                    try {
                      new URL(newSite.url);
                    } catch {
                      return;
                    }
                    if (newSite.title && newSite.url) {
                      store.addApprovedWebsite(newSite);
                      setNewSite({ title: "", url: "" });
                    }
                  }}
                >
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
              <ul className="space-y-2">
                {store.approvedWebsites.map((w) => (
                  <li key={w.id} className="flex items-center justify-between gap-2 rounded-xl border-2 border-border p-2">
                    <div className="min-w-0">
                      <p className="truncate font-bold">{w.title}</p>
                      <p className="truncate text-sm text-muted-foreground">{w.url}</p>
                    </div>
                    <Button size="icon" variant="ghost" aria-label="Remove" onClick={() => store.removeApprovedWebsite(w.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
                {store.approvedWebsites.length === 0 && (
                  <p className="text-sm text-muted-foreground">No approved sites yet.</p>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TOOLS */}
        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending approvals</CardTitle>
              <CardDescription>Actions your child asked a grown-up to approve.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {pendingTools.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing waiting for approval.</p>
              ) : (
                pendingTools.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-2 rounded-xl border-2 border-border p-2">
                    <span className="text-sm font-bold">
                      {TOOLS[t.tool].icon} {t.summary}
                    </span>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" aria-label="Approve" onClick={() => store.resolveTool(t.id, true)}>
                        <Check className="h-4 w-4 text-success" />
                      </Button>
                      <Button size="icon" variant="ghost" aria-label="Deny" onClick={() => store.resolveTool(t.id, false)}>
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tool audit log</CardTitle>
              <CardDescription>Every tool action, kept for your review.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="max-h-72 space-y-1 overflow-y-auto text-sm">
                {store.toolAudit.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-2 rounded-lg bg-muted px-2 py-1.5">
                    <span>
                      {TOOLS[e.tool].icon} {e.summary}
                    </span>
                    <Badge variant={e.outcome === "completed" ? "success" : e.outcome === "failed" ? "warning" : "outline"}>
                      {e.outcome}
                    </Badge>
                  </li>
                ))}
                {store.toolAudit.length === 0 && <p className="text-muted-foreground">No tool activity yet.</p>}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MEMORY */}
        <TabsContent value="memory">
          <Card>
            <CardHeader>
              <CardTitle>Remembered information</CardTitle>
              <CardDescription>Review and delete what the companion remembers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {store.memories.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing remembered.</p>
              ) : (
                store.memories.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-2 rounded-xl border-2 border-border p-2">
                    <div>
                      <p className="font-bold">
                        {m.key}: <span className="font-normal">{m.value}</span>
                      </p>
                      <Badge variant="secondary" className="mt-1">
                        {m.category}
                      </Badge>
                    </div>
                    <Button size="icon" variant="ghost" aria-label="Delete memory" onClick={() => store.removeMemory(m.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
              {store.memories.length > 0 && (
                <Button variant="destructive" onClick={store.clearMemories}>
                  Delete all memories
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SAFETY */}
        <TabsContent value="safety">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" /> Safety events
              </CardTitle>
              <CardDescription>
                When the safety layer redirected a conversation. No conversation content is stored here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm">
                {store.safetyEvents.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-2 rounded-lg bg-muted px-2 py-1.5">
                    <span className="font-bold">{e.category}</span>
                    <Badge variant="outline">{e.action}</Badge>
                  </li>
                ))}
                {store.safetyEvents.length === 0 && (
                  <p className="text-muted-foreground">No safety events — all clear. 🌟</p>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DATA */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sound &amp; voice</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              <Row label="Sound effects">
                <Switch checked={store.preferences.soundOn} onCheckedChange={(v) => store.setPreferences({ soundOn: v })} aria-label="Sound effects" />
              </Row>
              <Row label="Read-aloud (text to speech)">
                <Switch checked={store.preferences.ttsOn} onCheckedChange={(v) => store.setPreferences({ ttsOn: v })} aria-label="Read aloud" />
              </Row>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Data controls</CardTitle>
              <CardDescription>Export or permanently delete all of {store.profile.displayName}&apos;s data.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={exportData}>
                <Download className="h-4 w-4" /> Export data (JSON)
              </Button>
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-destructive">Are you sure?</span>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      store.deleteAllData();
                      setConfirmDelete(false);
                    }}
                  >
                    Yes, delete everything
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="h-4 w-4" /> Delete all data
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
