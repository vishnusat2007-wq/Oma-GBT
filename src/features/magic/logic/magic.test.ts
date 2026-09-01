import { describe, it, expect } from "vitest";
import {
  allCards,
  cardNumbers,
  revealFromCards,
  MAX_NUMBER,
  CARD_COUNT,
} from "./binary-cards";
import { computeFinal, MAGIC_RESULT } from "./number-prediction";

describe("binary mind-reading cards", () => {
  it("reveals every number 1..63 correctly", () => {
    const cards = allCards();
    for (let secret = 1; secret <= MAX_NUMBER; secret++) {
      const selected: number[] = [];
      for (let i = 0; i < CARD_COUNT; i++) {
        if (cards[i].includes(secret)) selected.push(i);
      }
      expect(revealFromCards(selected)).toBe(secret);
    }
  });
  it("card i contains numbers with bit i set", () => {
    expect(cardNumbers(0)).toContain(1);
    expect(cardNumbers(0)).not.toContain(2);
    expect(cardNumbers(1)).toContain(2);
  });
});

describe("number prediction", () => {
  it("always resolves to the magic result for any start", () => {
    for (const n of [0, 1, 7, 42, 100, 999]) {
      expect(computeFinal(n)).toBe(MAGIC_RESULT);
    }
  });
});
