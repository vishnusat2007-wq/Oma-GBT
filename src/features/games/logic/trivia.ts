export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  category: "animals" | "space" | "science" | "words" | "math";
  difficulty: "easy" | "medium" | "hard";
}

export const TRIVIA: TriviaQuestion[] = [
  { id: "t1", question: "Which animal is the tallest in the world?", options: ["Elephant", "Giraffe", "Horse", "Bear"], answerIndex: 1, category: "animals", difficulty: "easy" },
  { id: "t2", question: "What do bees make?", options: ["Milk", "Honey", "Bread", "Silk"], answerIndex: 1, category: "animals", difficulty: "easy" },
  { id: "t3", question: "Which planet is closest to the Sun?", options: ["Earth", "Mars", "Mercury", "Jupiter"], answerIndex: 2, category: "space", difficulty: "medium" },
  { id: "t4", question: "How many legs does a spider have?", options: ["6", "8", "10", "4"], answerIndex: 1, category: "animals", difficulty: "easy" },
  { id: "t5", question: "What is H2O more commonly known as?", options: ["Salt", "Water", "Air", "Sugar"], answerIndex: 1, category: "science", difficulty: "medium" },
  { id: "t6", question: "What is 7 × 6?", options: ["36", "42", "48", "40"], answerIndex: 1, category: "math", difficulty: "medium" },
  { id: "t7", question: "Which is a primary color?", options: ["Green", "Orange", "Blue", "Purple"], answerIndex: 2, category: "science", difficulty: "easy" },
  { id: "t8", question: "What do we call a baby dog?", options: ["Kitten", "Cub", "Puppy", "Foal"], answerIndex: 2, category: "animals", difficulty: "easy" },
  { id: "t9", question: "Which shape has three sides?", options: ["Square", "Triangle", "Circle", "Pentagon"], answerIndex: 1, category: "math", difficulty: "easy" },
  { id: "t10", question: "What is the opposite of 'brave'?", options: ["Bold", "Scared", "Strong", "Happy"], answerIndex: 1, category: "words", difficulty: "medium" },
  { id: "t11", question: "Our galaxy is called the…", options: ["Milky Way", "Andromeda", "Sombrero", "Whirlpool"], answerIndex: 0, category: "space", difficulty: "hard" },
  { id: "t12", question: "How many days are in a week?", options: ["5", "6", "7", "8"], answerIndex: 2, category: "math", difficulty: "easy" },
];

export function pickQuestions(
  count: number,
  difficulty: TriviaQuestion["difficulty"] | "mixed",
  rng: () => number = Math.random,
): TriviaQuestion[] {
  const pool =
    difficulty === "mixed"
      ? [...TRIVIA]
      : TRIVIA.filter((q) => q.difficulty === difficulty);
  const source = pool.length >= count ? pool : [...TRIVIA];
  const shuffled = [...source].sort(() => rng() - 0.5);
  return shuffled.slice(0, count);
}

export function scoreToStars(correct: number, total: number): number {
  const ratio = total === 0 ? 0 : correct / total;
  if (ratio >= 0.85) return 3;
  if (ratio >= 0.5) return 2;
  return 1;
}
