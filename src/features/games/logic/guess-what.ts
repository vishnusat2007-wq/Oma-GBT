export interface GuessSubject {
  name: string;
  emoji: string;
  clues: string[];
}

export const GUESS_SUBJECTS: GuessSubject[] = [
  { name: "elephant", emoji: "🐘", clues: ["I am very big and gray.", "I have a long trunk.", "I have big flappy ears.", "I love peanuts and water."] },
  { name: "penguin", emoji: "🐧", clues: ["I am a bird but I cannot fly.", "I love cold, icy places.", "I waddle when I walk.", "I wear a black-and-white 'tuxedo'."] },
  { name: "sun", emoji: "☀️", clues: ["I am very, very hot.", "I am a giant star.", "I help plants grow.", "You see me during the day."] },
  { name: "banana", emoji: "🍌", clues: ["I am a yellow fruit.", "Monkeys love me.", "You peel me before eating.", "I am shaped like a curve."] },
  { name: "rocket", emoji: "🚀", clues: ["I blast off with fire.", "I can travel to space.", "Astronauts ride inside me.", "I go 3, 2, 1… liftoff!"] },
  { name: "octopus", emoji: "🐙", clues: ["I live in the ocean.", "I have eight arms.", "I can squirt ink.", "I am very clever."] },
];

export interface GuessState {
  subject: GuessSubject;
  cluesRevealed: number;
  solved: boolean;
  attempts: number;
}

export function startGuess(
  rng: () => number = Math.random,
): GuessState {
  const subject = GUESS_SUBJECTS[Math.floor(rng() * GUESS_SUBJECTS.length)];
  return { subject, cluesRevealed: 1, solved: false, attempts: 0 };
}

export function normalizeGuess(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z]/g, "");
}

export function checkGuess(state: GuessState, guess: string): boolean {
  return normalizeGuess(guess) === normalizeGuess(state.subject.name);
}

/** Points: more points for guessing with fewer clues. */
export function guessScore(cluesRevealed: number): number {
  return Math.max(1, 5 - (cluesRevealed - 1));
}
