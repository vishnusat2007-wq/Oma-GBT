export interface AdventureChoice {
  label: string;
  next: string;
}

export interface AdventureNode {
  id: string;
  text: string;
  emoji: string;
  choices: AdventureChoice[];
  ending?: boolean;
}

/**
 * A small, kind, collaborative choose-your-own-adventure. Fully local so it
 * plays without any AI request. Every path reaches a warm, safe ending.
 */
export const ADVENTURE: Record<string, AdventureNode> = {
  start: {
    id: "start",
    emoji: "🌲",
    text: "You and your companion find a glowing path in the Whispering Woods. Two ways sparkle ahead.",
    choices: [
      { label: "Follow the golden lights", next: "meadow" },
      { label: "Peek into the cozy cave", next: "cave" },
    ],
  },
  meadow: {
    id: "meadow",
    emoji: "🌼",
    text: "The lights lead to a meadow where friendly fireflies spell out a riddle in the air.",
    choices: [
      { label: "Solve the riddle together", next: "riddle" },
      { label: "Ask the fireflies to play", next: "dance" },
    ],
  },
  cave: {
    id: "cave",
    emoji: "🪨",
    text: "Inside the cave, a tiny sleepy dragon yawns and offers you a shiny, kind-hearted gem.",
    choices: [
      { label: "Thank the dragon and share a snack", next: "friend" },
      { label: "Ask the dragon for a story", next: "story" },
    ],
  },
  riddle: {
    id: "riddle",
    emoji: "🧩",
    text: "You solve it: 'A star that hums!' The meadow blooms with music. What a team!",
    choices: [{ label: "Celebrate!", next: "endHappy" }],
  },
  dance: {
    id: "dance",
    emoji: "💫",
    text: "You dance with the fireflies until the whole meadow glows like a night sky.",
    choices: [{ label: "Take a bow", next: "endHappy" }],
  },
  friend: {
    id: "friend",
    emoji: "🐉",
    text: "The little dragon becomes your friend and flies you home on its soft, warm back.",
    choices: [{ label: "Wave goodbye", next: "endHappy" }],
  },
  story: {
    id: "story",
    emoji: "📖",
    text: "The dragon tells a tale of brave, kind heroes — and you realise the hero is YOU.",
    choices: [{ label: "Smile", next: "endHappy" }],
  },
  endHappy: {
    id: "endHappy",
    emoji: "🏡",
    text: "You head home, hearts full of wonder. What a magical adventure — let's do it again soon!",
    choices: [],
    ending: true,
  },
};

export function startNode(): AdventureNode {
  return ADVENTURE.start;
}

export function getNode(id: string): AdventureNode {
  return ADVENTURE[id] ?? ADVENTURE.start;
}
