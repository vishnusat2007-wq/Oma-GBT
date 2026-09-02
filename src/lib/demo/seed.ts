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

/**
 * Default parent PIN for a fresh household. Parents should change this in the
 * dashboard. It is not a secret and is never shown in the child-facing UI.
 */
export const DEMO_PIN = "1234";

export function createInitialData(): AppData {
  const now = new Date().toISOString();
  return {
    profile: {
      id: "child_jesvitha",
      displayName: "Jesvitha",
      ageRange: "7-8",
      createdAt: now,
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
    conversations: [],
    messages: [],
    memories: [],
    stories: [],
    games: [],
    unlockedAchievements: [],
    reminders: [],
    notes: [],
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
    toolAudit: [],
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
    streakDays: 0,
    lastVisit: null,
  };
}

/** @deprecated Use createInitialData — kept so older imports keep typechecking. */
export const createDemoData = createInitialData;

export const DEMO_ACHIEVEMENTS = buildAchievements([]);
