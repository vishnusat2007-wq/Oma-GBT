/**
 * The classic binary "mind reading" trick. Numbers 1..63 are shown across 6
 * cards; a number appears on card i when bit i of the number is set. Adding the
 * smallest number (the bit value) of every card the child says "yes" to reveals
 * their number. It's math, not magic — see "Learn the secret".
 */

export const CARD_COUNT = 6;
export const MAX_NUMBER = 63;

export function cardNumbers(cardIndex: number): number[] {
  const bit = 1 << cardIndex;
  const nums: number[] = [];
  for (let n = 1; n <= MAX_NUMBER; n++) {
    if (n & bit) nums.push(n);
  }
  return nums;
}

export function allCards(): number[][] {
  return Array.from({ length: CARD_COUNT }, (_, i) => cardNumbers(i));
}

export function revealFromCards(selectedCardIndexes: number[]): number {
  return selectedCardIndexes.reduce((sum, i) => sum + (1 << i), 0);
}

export function cardBitValue(cardIndex: number): number {
  return 1 << cardIndex;
}
