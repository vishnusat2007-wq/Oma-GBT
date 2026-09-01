import { shuffle } from "@/lib/utils";

export interface MemoryCard {
  id: number;
  emoji: string;
  matched: boolean;
}

const EMOJI_POOL = [
  "🐶", "🐱", "🦊", "🐼", "🦁", "🐸", "🐙", "🦄",
  "🐝", "🦋", "🌵", "🍩", "🚀", "⭐", "🎈", "🍉",
];

export type MemoryDifficulty = "easy" | "medium" | "hard";

export const PAIRS_BY_DIFFICULTY: Record<MemoryDifficulty, number> = {
  easy: 4,
  medium: 6,
  hard: 8,
};

export function buildDeck(
  difficulty: MemoryDifficulty,
  rng: () => number = Math.random,
): MemoryCard[] {
  const pairs = PAIRS_BY_DIFFICULTY[difficulty];
  const chosen = EMOJI_POOL.slice(0, pairs);
  const deck = shuffle([...chosen, ...chosen], rng).map((emoji, id) => ({
    id,
    emoji,
    matched: false,
  }));
  return deck;
}

export function isMatch(a: MemoryCard, b: MemoryCard): boolean {
  return a.id !== b.id && a.emoji === b.emoji;
}

/** Simple star rating based on efficiency (fewer moves = more stars). */
export function starRating(pairs: number, moves: number): number {
  if (moves <= pairs + 2) return 3;
  if (moves <= pairs * 2) return 2;
  return 1;
}
