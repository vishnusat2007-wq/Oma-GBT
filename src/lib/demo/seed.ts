import { buildAchievements } from "@/lib/data/achievements";
import type {
  ApprovedWebsite,
  ChildProfile,
  CompanionConfig,
  Conversation,
  FeaturePermissions,
  GameSession,
  Memory,
  Message,
  Note,
  ParentSettings,
  AppPreferences,
  Reminder,
  SafetyEvent,
  SavedStory,
  ToolApprovalRequest,
  ToolAuditEvent,
} from "@/lib/data/types";

export interface AppData {
  demoMode: boolean;
  profile: ChildProfile;
  companion: CompanionConfig;
  conversations: Conversation[];
  messages: Message[];
  memories: Memory[];
  stories: SavedStory[];
  games: GameSession[];
  unlockedAchievements: string[];
  reminders: Reminder[];
  notes: Note[];
  permissions: FeaturePermissions;
  approvedWebsites: ApprovedWebsite[];
  toolRequests: ToolApprovalRequest[];
  toolAudit: ToolAuditEvent[];
  safetyEvents: SafetyEvent[];
  preferences: AppPreferences;
  parent: ParentSettings;
  streakDays: number;
  lastVisit: string | null;
}

const now = new Date();
const iso = (daysAgo = 0) =>
  new Date(now.getTime() - daysAgo * 86400000).toISOString();

/**
 * DEMO_PIN is a well-known placeholder for local demo mode only. In live mode the
 * parent sets a real PIN which is never committed. This is not a secret.
 */
export const DEMO_PIN = "1234";

export function createDemoData(): AppData {
  const conversationId = "conv_demo_1";
  return {
    demoMode: true,
    profile: {
      id: "child_demo",
      displayName: "Jesvitha",
      ageRange: "7-8",
      createdAt: iso(20),
    },
    companion: {
      name: "Pip",
      color: "grape",
      shape: "round",
      accessory: "crown",
      personality: ["silly", "curious", "gentle"],
      interests: ["space", "dinosaurs", "drawing"],
      voicePitch: 1.05,
      voiceRate: 1,
    },
    conversations: [
      {
        id: conversationId,
        title: "Space adventures",
        createdAt: iso(2),
        updatedAt: iso(0),
        archived: false,
      },
      {
        id: "conv_demo_2",
        title: "Dinosaur facts",
        createdAt: iso(5),
        updatedAt: iso(4),
        archived: false,
      },
    ],
    messages: [
      {
        id: "msg_1",
        conversationId,
        role: "assistant",
        content:
          "Hi Jesvitha! I'm Pip. 🌟 Want to hear a fun fact about space, or should we make up a story together?",
        kind: "text",
        createdAt: iso(2),
        aiGenerated: true,
      },
      {
        id: "msg_2",
        conversationId,
        role: "user",
        content: "Tell me a space fact!",
        kind: "text",
        createdAt: iso(2),
      },
      {
        id: "msg_3",
        conversationId,
        role: "assistant",
        content:
          "Okay! 🚀 A day on Venus is longer than its whole year — it spins *super* slowly. Isn't that wild? Want another one?",
        kind: "text",
        createdAt: iso(2),
        aiGenerated: true,
      },
    ],
    memories: [
      { id: "mem_1", key: "Favorite color", value: "purple", category: "favorite", createdAt: iso(18), source: "child" },
      { id: "mem_2", key: "Loves", value: "dinosaurs and space", category: "hobby", createdAt: iso(15), source: "companion" },
      { id: "mem_3", key: "Favorite character", value: "a friendly dragon named Ember", category: "character", createdAt: iso(9), source: "child" },
      { id: "mem_4", key: "Learning goal", value: "practicing times tables", category: "learning", createdAt: iso(6), source: "child" },
    ],
    stories: [
      {
        id: "story_1",
        title: "The Dragon Who Loved Stars",
        characters: ["Ember the dragon", "Jesvitha"],
        setting: "a mountain that touches the sky",
        mood: "cozy",
        pages: [
          { id: "p1", text: "Ember the dragon curled up on the tallest mountain, counting the stars one by one." },
          { id: "p2", text: "Suddenly, a shooting star zoomed past! Ember and Jesvitha decided to chase it together.", choiceTaken: "Chase the star" },
        ],
        createdAt: iso(7),
        favorite: true,
        complete: false,
      },
    ],
    games: [
      { id: "gs_1", game: "tic-tac-toe", score: 1, difficulty: "medium", result: "win", createdAt: iso(1) },
      { id: "gs_2", game: "trivia", score: 4, difficulty: "easy", result: "complete", createdAt: iso(3) },
    ],
    unlockedAchievements: ["first-hello", "chatterbox", "tic-tac-champ", "quiz-whiz"],
    reminders: [
      { id: "rem_1", title: "Read a chapter before bed", when: "Tonight, 8:00 PM", createdAt: iso(1), done: false },
    ],
    notes: [
      { id: "note_1", title: "Story idea", body: "A dragon and a robot become best friends.", createdAt: iso(4) },
    ],
    permissions: {
      chat: true,
      arcade: true,
      magic: true,
      stories: true,
      learn: true,
      onlineTools: true,
    },
    approvedWebsites: [
      { id: "site_1", title: "NASA Kids' Club", url: "https://www.nasa.gov/kidsclub/index.html" },
      { id: "site_2", title: "National Geographic Kids", url: "https://kids.nationalgeographic.com/" },
    ],
    toolRequests: [],
    toolAudit: [
      { id: "aud_1", tool: "save_note", summary: "Saved note: Story idea", outcome: "completed", requiredApproval: false, at: iso(4) },
    ],
    safetyEvents: [],
    preferences: {
      soundOn: true,
      ttsOn: false,
      reducedMotion: false,
      dailyLimitMinutes: 45,
      quietHours: { enabled: true, start: "20:30", end: "07:00" },
      retentionDays: 90,
      onlineToolsMasterSwitch: true,
    },
    parent: {
      pin: DEMO_PIN,
      emergencyOnlineDisable: false,
    },
    streakDays: 3,
    lastVisit: iso(0),
  };
}

export const DEMO_ACHIEVEMENTS = buildAchievements(
  createDemoData().unlockedAchievements,
);
