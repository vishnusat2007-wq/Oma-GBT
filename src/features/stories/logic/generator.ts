import { seededRandom, pickRandom } from "@/lib/utils";

export type StoryMood = "cozy" | "exciting" | "funny" | "brave" | "dreamy";
export type StoryLength = "short" | "medium" | "long";

export const LENGTH_STEPS: Record<StoryLength, number> = {
  short: 3,
  medium: 5,
  long: 7,
};

export interface StoryConfig {
  hero: string;
  setting: string;
  mood: StoryMood;
  length: StoryLength;
}

export interface StorySegment {
  text: string;
  choices: string[];
  ending: boolean;
}

const OPENERS: Record<StoryMood, string[]> = {
  cozy: ["On a soft, sleepy afternoon,", "Wrapped in a warm blanket of clouds,"],
  exciting: ["With a WHOOSH and a sparkle,", "Faster than a shooting star,"],
  funny: ["On a very giggly morning,", "In a land where socks tell jokes,"],
  brave: ["When the big adventure began,", "With a deep, brave breath,"],
  dreamy: ["In a shimmering daydream,", "Where the moon hums lullabies,"],
};

const EVENTS = [
  "discovered a door that glowed like honey",
  "met a tiny, kind creature with sparkly eyes",
  "found a map drawn in starlight",
  "heard a gentle song floating on the breeze",
  "spotted a bridge made of rainbows",
  "came upon a garden of giggling flowers",
];

const CHOICE_POOL = [
  "Peek inside carefully",
  "Call out a friendly hello",
  "Follow the twinkling lights",
  "Share a snack and make a friend",
  "Take the sparkly path",
  "Ask a clever question",
  "Give a brave little wave",
  "Look for a hidden clue",
];

const ENDINGS: Record<StoryMood, string> = {
  cozy: "And so, warm and happy, everyone snuggled up as the stars winked goodnight. The end. 💛",
  exciting: "With one last joyful cheer, the adventure sparkled to a wonderful finish! The end. ✨",
  funny: "Everyone laughed so hard they snorted — what a silly, splendid day! The end. 😄",
  brave: "With a proud, brave heart, our hero knew they could do anything. The end. 🦁",
  dreamy: "As the daydream gently faded, a soft smile remained. The end. 🌙",
};

function twoChoices(rng: () => number): string[] {
  const a = pickRandom(CHOICE_POOL, rng);
  let b = pickRandom(CHOICE_POOL, rng);
  let guard = 0;
  while (b === a && guard++ < 5) b = pickRandom(CHOICE_POOL, rng);
  return [a, b];
}

export function generateOpening(config: StoryConfig, seed = Date.now()): StorySegment {
  const rng = seededRandom(seed + config.hero.length);
  const opener = pickRandom(OPENERS[config.mood], rng);
  const event = pickRandom(EVENTS, rng);
  return {
    text: `${opener} ${config.hero} set off into ${config.setting} and ${event}. 🌟`,
    choices: twoChoices(rng),
    ending: false,
  };
}

export function generateContinuation(
  config: StoryConfig,
  choice: string,
  stepIndex: number,
  seed = Date.now(),
): StorySegment {
  const totalSteps = LENGTH_STEPS[config.length];
  const rng = seededRandom(seed + stepIndex * 7 + choice.length);
  const isEnding = stepIndex >= totalSteps - 1;

  if (isEnding) {
    return {
      text: `${config.hero} decided to ${choice.toLowerCase()}. ${ENDINGS[config.mood]}`,
      choices: [],
      ending: true,
    };
  }

  const event = pickRandom(EVENTS, rng);
  return {
    text: `${config.hero} chose to ${choice.toLowerCase()}. Then, in ${config.setting}, they ${event}. 💫`,
    choices: twoChoices(rng),
    ending: false,
  };
}
