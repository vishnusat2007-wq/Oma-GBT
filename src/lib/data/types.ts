export type AgeRange = "5-6" | "7-8" | "9-10" | "11-12";

export type MascotColor = "grape" | "sky" | "bubblegum" | "sunshine" | "mint";
export type MascotShape = "round" | "star" | "bean";
export type MascotAccessory = "none" | "bow" | "cap" | "crown" | "glasses";
export type PersonalityTrait =
  | "silly"
  | "curious"
  | "gentle"
  | "brave"
  | "creative"
  | "sporty";

export interface CompanionConfig {
  name: string;
  color: MascotColor;
  shape: MascotShape;
  accessory: MascotAccessory;
  personality: PersonalityTrait[];
  interests: string[];
  voicePitch: number; // 0.5 - 2
  voiceRate: number; // 0.5 - 2
}

export interface ChildProfile {
  id: string;
  displayName: string;
  ageRange: AgeRange;
  createdAt: string;
}

export type MessageRole = "user" | "assistant" | "system";

export type MessageKind =
  | "text"
  | "story-card"
  | "quiz"
  | "game-invite"
  | "choices"
  | "tool-proposal";

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  kind: MessageKind;
  createdAt: string;
  meta?: Record<string, unknown>;
  aiGenerated?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export type MemoryCategory =
  | "favorite"
  | "hobby"
  | "character"
  | "learning"
  | "other";

export interface Memory {
  id: string;
  key: string;
  value: string;
  category: MemoryCategory;
  createdAt: string;
  source: "child" | "companion";
}

export interface StoryPage {
  id: string;
  text: string;
  choiceTaken?: string;
}

export interface SavedStory {
  id: string;
  title: string;
  characters: string[];
  setting: string;
  mood: string;
  pages: StoryPage[];
  createdAt: string;
  favorite: boolean;
  complete: boolean;
}

export type GameId =
  | "tic-tac-toe"
  | "memory"
  | "rock-paper-scissors"
  | "guess-what"
  | "trivia"
  | "adventure";

export interface GameSession {
  id: string;
  game: GameId;
  score: number;
  difficulty: "easy" | "medium" | "hard" | null;
  result: "win" | "lose" | "draw" | "complete";
  createdAt: string;
}

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  progress: number; // 0..1
}

export interface Reminder {
  id: string;
  title: string;
  when: string;
  createdAt: string;
  done: boolean;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

export interface FeaturePermissions {
  chat: boolean;
  arcade: boolean;
  magic: boolean;
  stories: boolean;
  learn: boolean;
  onlineTools: boolean;
}

export interface ApprovedWebsite {
  id: string;
  title: string;
  url: string;
}

export type ToolName =
  | "web_search"
  | "check_weather"
  | "create_reminder"
  | "save_note"
  | "start_game"
  | "open_website";

export type ToolStatus = "pending" | "approved" | "denied" | "completed";

export interface ToolApprovalRequest {
  id: string;
  tool: ToolName;
  summary: string;
  args: Record<string, unknown>;
  status: ToolStatus;
  requiresApproval: boolean;
  requestedAt: string;
  resolvedAt?: string;
}

export interface ToolAuditEvent {
  id: string;
  tool: ToolName;
  summary: string;
  outcome: "completed" | "denied" | "failed" | "requested";
  requiredApproval: boolean;
  at: string;
}

export type SafetyCategory =
  | "bullying"
  | "sexual"
  | "grooming"
  | "self-harm"
  | "violence"
  | "substances"
  | "illegal"
  | "personal-info"
  | "dangerous-challenge"
  | "medical";

export interface SafetyEvent {
  id: string;
  category: SafetyCategory;
  action: "redirected" | "refused" | "encouraged-adult";
  at: string;
}

export interface QuietHours {
  enabled: boolean;
  start: string; // "20:00"
  end: string; // "07:00"
}

export interface AppPreferences {
  soundOn: boolean;
  ttsOn: boolean;
  reducedMotion: boolean;
  dailyLimitMinutes: number;
  quietHours: QuietHours;
  retentionDays: number;
  onlineToolsMasterSwitch: boolean;
}

export interface ParentSettings {
  pin: string;
  emergencyOnlineDisable: boolean;
}
