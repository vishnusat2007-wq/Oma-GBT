import { seededRandom, pickRandom } from "@/lib/utils";

/**
 * The Magic Story trick shows a sealed "prediction" up front, lets the child
 * make choices, and every path leads to the predicted treasure — so the reveal
 * always matches. It's clever writing, not real fortune-telling (see the secret).
 */

export const PREDICTION = { item: "a golden key", emoji: "🔑" };

export interface MagicStoryChoice {
  hero: string;
  place: string;
  helper: string;
}

const OPENERS = [
  "Long ago, in a land of soft clouds,",
  "Once upon a sparkling morning,",
  "Deep in a valley of giggling rivers,",
];

export function generateMagicStory(
  choice: MagicStoryChoice,
  seed = Date.now(),
): { paragraphs: string[]; reveal: string } {
  const rng = seededRandom(seed);
  const opener = pickRandom(OPENERS, rng);

  const paragraphs = [
    `${opener} ${choice.hero} set off toward the ${choice.place}, humming a happy tune. 🌈`,
    `Along the way, ${choice.helper} appeared and said, "Follow your kind heart — it always knows the way."`,
    `They wandered past twinkling trees and a bridge made of laughter. No matter which turn they took, a warm glow kept guiding them onward.`,
    `At last, beneath a very old, friendly tree, something shiny was waiting just for ${choice.hero}…`,
  ];

  const reveal = `…and it was ${PREDICTION.item}! ${PREDICTION.emoji} Exactly what the sealed prediction said. ✨`;

  return { paragraphs, reveal };
}

export const MAGIC_STORY_SECRET =
  "No fortune-telling here! The story is written so that every choice still leads to the same treasure. That's why the sealed prediction always matches — it's clever storytelling, a fun performance.";
