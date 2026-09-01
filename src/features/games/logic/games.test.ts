import { describe, it, expect } from "vitest";
import { judge, MOVES } from "./rps";
import { buildDeck, starRating, PAIRS_BY_DIFFICULTY, isMatch } from "./memory";
import { pickQuestions, scoreToStars, TRIVIA } from "./trivia";
import { startGuess, checkGuess, guessScore, normalizeGuess } from "./guess-what";
import { getNode, startNode, ADVENTURE } from "./adventure";
import { seededRandom } from "@/lib/utils";

describe("rock-paper-scissors", () => {
  it("draws on identical moves", () => {
    for (const m of MOVES) expect(judge(m, m)).toBe("draw");
  });
  it("resolves classic rules", () => {
    expect(judge("rock", "scissors")).toBe("win");
    expect(judge("scissors", "paper")).toBe("win");
    expect(judge("paper", "rock")).toBe("win");
    expect(judge("rock", "paper")).toBe("lose");
  });
});

describe("memory", () => {
  it("builds a deck with the right number of pairs", () => {
    const deck = buildDeck("medium", seededRandom(1));
    expect(deck).toHaveLength(PAIRS_BY_DIFFICULTY.medium * 2);
    const counts = new Map<string, number>();
    for (const c of deck) counts.set(c.emoji, (counts.get(c.emoji) ?? 0) + 1);
    for (const n of counts.values()) expect(n).toBe(2);
  });
  it("matches identical emojis with different ids", () => {
    const deck = buildDeck("easy", seededRandom(2));
    const [a] = deck;
    const b = deck.find((c) => c.emoji === a.emoji && c.id !== a.id)!;
    expect(isMatch(a, b)).toBe(true);
    expect(isMatch(a, a)).toBe(false);
  });
  it("awards more stars for fewer moves", () => {
    expect(starRating(6, 8)).toBe(3);
    expect(starRating(6, 20)).toBe(1);
  });
});

describe("trivia", () => {
  it("picks the requested number of questions", () => {
    expect(pickQuestions(5, "mixed", seededRandom(3))).toHaveLength(5);
  });
  it("every question has a valid answer index", () => {
    for (const q of TRIVIA) {
      expect(q.answerIndex).toBeGreaterThanOrEqual(0);
      expect(q.answerIndex).toBeLessThan(q.options.length);
    }
  });
  it("scores stars by ratio", () => {
    expect(scoreToStars(5, 5)).toBe(3);
    expect(scoreToStars(3, 5)).toBe(2);
    expect(scoreToStars(1, 5)).toBe(1);
  });
});

describe("guess-what", () => {
  it("normalizes guesses", () => {
    expect(normalizeGuess(" An Elephant! ")).toBe("anelephant");
  });
  it("checks a correct guess", () => {
    const state = startGuess(seededRandom(4));
    expect(checkGuess(state, state.subject.name)).toBe(true);
    expect(checkGuess(state, "definitely-wrong")).toBe(false);
  });
  it("rewards guessing with fewer clues", () => {
    expect(guessScore(1)).toBeGreaterThan(guessScore(4));
  });
});

describe("adventure", () => {
  it("starts at the start node and always reaches an ending", () => {
    expect(startNode().id).toBe("start");
    for (const node of Object.values(ADVENTURE)) {
      if (node.ending) continue;
      expect(node.choices.length).toBeGreaterThan(0);
      for (const choice of node.choices) {
        expect(getNode(choice.next)).toBeDefined();
      }
    }
  });
});
