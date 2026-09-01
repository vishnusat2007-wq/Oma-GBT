"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createDemoData, type AppData } from "@/lib/demo/seed";
import { buildAchievements } from "@/lib/data/achievements";
import { randomId } from "@/lib/utils";
import type {
  Achievement,
  ApprovedWebsite,
  ChildProfile,
  CompanionConfig,
  FeaturePermissions,
  GameSession,
  Memory,
  Message,
  AppPreferences,
  SafetyEvent,
  SavedStory,
  ToolApprovalRequest,
  ToolAuditEvent,
} from "@/lib/data/types";

interface AppActions {
  hydrated: boolean;
  markHydrated: () => void;
  resetDemo: () => void;

  setProfile: (patch: Partial<ChildProfile>) => void;
  setCompanion: (patch: Partial<CompanionConfig>) => void;

  addConversation: (title?: string) => string;
  renameConversation: (id: string, title: string) => void;
  archiveConversation: (id: string, archived: boolean) => void;
  deleteConversation: (id: string) => void;
  addMessage: (msg: Omit<Message, "id" | "createdAt">) => Message;

  addMemory: (m: Omit<Memory, "id" | "createdAt">) => void;
  removeMemory: (id: string) => void;
  clearMemories: () => void;

  saveStory: (s: Omit<SavedStory, "id" | "createdAt">) => string;
  updateStory: (id: string, patch: Partial<SavedStory>) => void;
  deleteStory: (id: string) => void;

  recordGame: (g: Omit<GameSession, "id" | "createdAt">) => void;
  unlockAchievement: (key: string) => boolean;

  addReminder: (title: string, when: string) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;

  addNote: (title: string, body: string) => void;
  deleteNote: (id: string) => void;

  setPermissions: (patch: Partial<FeaturePermissions>) => void;
  addApprovedWebsite: (site: Omit<ApprovedWebsite, "id">) => void;
  removeApprovedWebsite: (id: string) => void;

  requestTool: (
    req: Omit<ToolApprovalRequest, "id" | "requestedAt" | "status">,
  ) => string;
  resolveTool: (id: string, approved: boolean) => void;
  completeTool: (id: string) => void;
  addAudit: (e: Omit<ToolAuditEvent, "id" | "at">) => void;
  addSafetyEvent: (e: Omit<SafetyEvent, "id" | "at">) => void;

  setPreferences: (patch: Partial<AppPreferences>) => void;
  setParentPin: (pin: string) => void;
  setEmergencyDisable: (v: boolean) => void;

  registerVisit: () => void;
  exportData: () => string;
  deleteAllData: () => void;

  achievements: () => Achievement[];
  onlineToolsEnabled: () => boolean;
}

export type AppStore = AppData & AppActions;

const useAppStoreBase = create<AppStore>()(
  persist(
    (set, get) => ({
      ...createDemoData(),
      hydrated: false,

      markHydrated: () => set({ hydrated: true }),
      resetDemo: () => set({ ...createDemoData(), hydrated: true }),

      setProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
      setCompanion: (patch) => set((s) => ({ companion: { ...s.companion, ...patch } })),

      addConversation: (title = "New chat") => {
        const id = randomId("conv");
        const nowIso = new Date().toISOString();
        set((s) => ({
          conversations: [
            { id, title, createdAt: nowIso, updatedAt: nowIso, archived: false },
            ...s.conversations,
          ],
        }));
        return id;
      },
      renameConversation: (id, title) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, title } : c,
          ),
        })),
      archiveConversation: (id, archived) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, archived } : c,
          ),
        })),
      deleteConversation: (id) =>
        set((s) => ({
          conversations: s.conversations.filter((c) => c.id !== id),
          messages: s.messages.filter((m) => m.conversationId !== id),
        })),
      addMessage: (msg) => {
        const full: Message = {
          ...msg,
          id: randomId("msg"),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          messages: [...s.messages, full],
          conversations: s.conversations.map((c) =>
            c.id === msg.conversationId
              ? { ...c, updatedAt: full.createdAt }
              : c,
          ),
        }));
        const userMsgs = get().messages.filter((m) => m.role === "user").length;
        if (userMsgs >= 1) get().unlockAchievement("first-hello");
        if (userMsgs >= 10) get().unlockAchievement("chatterbox");
        return full;
      },

      addMemory: (m) =>
        set((s) => ({
          memories: [
            { ...m, id: randomId("mem"), createdAt: new Date().toISOString() },
            ...s.memories,
          ],
        })),
      removeMemory: (id) =>
        set((s) => ({ memories: s.memories.filter((m) => m.id !== id) })),
      clearMemories: () => set({ memories: [] }),

      saveStory: (story) => {
        const id = randomId("story");
        set((s) => ({
          stories: [
            { ...story, id, createdAt: new Date().toISOString() },
            ...s.stories,
          ],
        }));
        get().unlockAchievement("author");
        return id;
      },
      updateStory: (id, patch) =>
        set((s) => ({
          stories: s.stories.map((st) => (st.id === id ? { ...st, ...patch } : st)),
        })),
      deleteStory: (id) =>
        set((s) => ({ stories: s.stories.filter((st) => st.id !== id) })),

      recordGame: (g) => {
        set((s) => ({
          games: [
            { ...g, id: randomId("gs"), createdAt: new Date().toISOString() },
            ...s.games,
          ],
        }));
        const map: Record<string, string> = {
          "tic-tac-toe": "tic-tac-champ",
          memory: "memory-master",
          "rock-paper-scissors": "quick-hands",
          "guess-what": "animal-detective",
          trivia: "quiz-whiz",
          adventure: "storyteller",
        };
        if (g.result === "win" || g.result === "complete") {
          const key = map[g.game];
          if (key) get().unlockAchievement(key);
        }
      },
      unlockAchievement: (key) => {
        if (get().unlockedAchievements.includes(key)) return false;
        set((s) => ({ unlockedAchievements: [...s.unlockedAchievements, key] }));
        return true;
      },

      addReminder: (title, when) =>
        set((s) => ({
          reminders: [
            { id: randomId("rem"), title, when, createdAt: new Date().toISOString(), done: false },
            ...s.reminders,
          ],
        })),
      toggleReminder: (id) =>
        set((s) => ({
          reminders: s.reminders.map((r) =>
            r.id === id ? { ...r, done: !r.done } : r,
          ),
        })),
      deleteReminder: (id) =>
        set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) })),

      addNote: (title, body) =>
        set((s) => ({
          notes: [
            { id: randomId("note"), title, body, createdAt: new Date().toISOString() },
            ...s.notes,
          ],
        })),
      deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      setPermissions: (patch) =>
        set((s) => ({ permissions: { ...s.permissions, ...patch } })),
      addApprovedWebsite: (site) =>
        set((s) => ({
          approvedWebsites: [{ ...site, id: randomId("site") }, ...s.approvedWebsites],
        })),
      removeApprovedWebsite: (id) =>
        set((s) => ({
          approvedWebsites: s.approvedWebsites.filter((w) => w.id !== id),
        })),

      requestTool: (req) => {
        const id = randomId("tool");
        const request: ToolApprovalRequest = {
          ...req,
          id,
          status: "pending",
          requestedAt: new Date().toISOString(),
        };
        set((s) => ({ toolRequests: [request, ...s.toolRequests] }));
        get().addAudit({
          tool: req.tool,
          summary: req.summary,
          outcome: "requested",
          requiredApproval: req.requiresApproval,
        });
        return id;
      },
      resolveTool: (id, approved) =>
        set((s) => ({
          toolRequests: s.toolRequests.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: approved ? "approved" : "denied",
                  resolvedAt: new Date().toISOString(),
                }
              : t,
          ),
        })),
      completeTool: (id) =>
        set((s) => ({
          toolRequests: s.toolRequests.map((t) =>
            t.id === id ? { ...t, status: "completed" } : t,
          ),
        })),
      addAudit: (e) =>
        set((s) => ({
          toolAudit: [
            { ...e, id: randomId("aud"), at: new Date().toISOString() },
            ...s.toolAudit,
          ].slice(0, 200),
        })),
      addSafetyEvent: (e) =>
        set((s) => ({
          safetyEvents: [
            { ...e, id: randomId("safe"), at: new Date().toISOString() },
            ...s.safetyEvents,
          ].slice(0, 200),
        })),

      setPreferences: (patch) =>
        set((s) => ({ preferences: { ...s.preferences, ...patch } })),
      setParentPin: (pin) => set((s) => ({ parent: { ...s.parent, pin } })),
      setEmergencyDisable: (v) =>
        set((s) => ({ parent: { ...s.parent, emergencyOnlineDisable: v } })),

      registerVisit: () => {
        const last = get().lastVisit;
        const today = new Date().toDateString();
        if (last && new Date(last).toDateString() === today) return;
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const continued = last && new Date(last).toDateString() === yesterday;
        set((s) => ({
          lastVisit: new Date().toISOString(),
          streakDays: continued ? s.streakDays + 1 : 1,
        }));
        if (get().streakDays >= 3) get().unlockAchievement("streak-3");
      },
      exportData: () => {
        const s = get();
        const { hydrated: _h, ...data } = s as AppStore;
        void _h;
        const serializable = Object.fromEntries(
          Object.entries(data).filter(([, v]) => typeof v !== "function"),
        );
        return JSON.stringify(serializable, null, 2);
      },
      deleteAllData: () => set({ ...createDemoData(), hydrated: true }),

      achievements: () => buildAchievements(get().unlockedAchievements),
      onlineToolsEnabled: () => {
        const s = get();
        return (
          s.permissions.onlineTools &&
          s.preferences.onlineToolsMasterSwitch &&
          !s.parent.emergencyOnlineDisable
        );
      },
    }),
    {
      name: "omagbt.appdata.v3",
      partialize: (state) => {
        const entries = Object.entries(state).filter(
          ([k, v]) => typeof v !== "function" && k !== "hydrated",
        );
        return Object.fromEntries(entries) as AppStore;
      },
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);

export const useAppStore = useAppStoreBase;

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
