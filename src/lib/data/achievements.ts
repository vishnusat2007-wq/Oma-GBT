import type { Achievement } from "./types";

export interface AchievementDef {
  key: string;
  title: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { key: "first-hello", title: "First Hello", description: "Say hi to your companion.", icon: "👋" },
  { key: "chatterbox", title: "Chatterbox", description: "Send 10 messages.", icon: "💬" },
  { key: "tic-tac-champ", title: "Tic-Tac Champ", description: "Win a game of tic-tac-toe.", icon: "❌" },
  { key: "memory-master", title: "Memory Master", description: "Finish a memory match game.", icon: "🧠" },
  { key: "quick-hands", title: "Quick Hands", description: "Win rock-paper-scissors.", icon: "✊" },
  { key: "animal-detective", title: "Animal Detective", description: "Win Guess What.", icon: "🔎" },
  { key: "quiz-whiz", title: "Quiz Whiz", description: "Score 3+ in a trivia round.", icon: "🎯" },
  { key: "storyteller", title: "Storyteller", description: "Finish a choose-your-adventure.", icon: "📖" },
  { key: "magician", title: "Little Magician", description: "Complete a magic trick.", icon: "✨" },
  { key: "secret-keeper", title: "Secret Learner", description: "Learn how a trick works.", icon: "🔮" },
  { key: "author", title: "Author", description: "Save a story in Story Studio.", icon: "✍️" },
  { key: "curious-mind", title: "Curious Mind", description: "Finish a Learning Corner quiz.", icon: "🎓" },
  { key: "streak-3", title: "On a Roll", description: "Visit 3 days in a row.", icon: "🔥" },
];

export function buildAchievements(unlockedKeys: string[] = []): Achievement[] {
  return ACHIEVEMENTS.map((def) => ({
    id: def.key,
    key: def.key,
    title: def.title,
    description: def.description,
    icon: def.icon,
    unlockedAt: unlockedKeys.includes(def.key) ? new Date().toISOString() : null,
    progress: unlockedKeys.includes(def.key) ? 1 : 0,
  }));
}
