/**
 * "Think of a number" prediction. For any starting number n:
 *   n → ×2 → +10 → ÷2 → −n  ==> always 5.
 * The result never depends on the secret number, so we can "predict" it. The
 * "Learn the secret" mode shows the algebra: (2n + 10) / 2 − n = 5.
 */

export const MAGIC_RESULT = 5;

export interface PredictionStep {
  instruction: string;
  apply: (value: number) => number;
}

export const PREDICTION_STEPS: PredictionStep[] = [
  { instruction: "Think of any whole number (keep it secret!).", apply: (v) => v },
  { instruction: "Double it (×2).", apply: (v) => v * 2 },
  { instruction: "Add 10.", apply: (v) => v + 10 },
  { instruction: "Cut it in half (÷2).", apply: (v) => v / 2 },
  { instruction: "Subtract the number you first thought of.", apply: (v) => v },
];

export function computeFinal(start: number): number {
  // (2n + 10)/2 - n
  return (start * 2 + 10) / 2 - start;
}

export const SECRET_EXPLANATION =
  "It's algebra, not magic! If your number is n: doubling gives 2n, adding 10 gives 2n+10, halving gives n+5, and subtracting your n leaves exactly 5 — every single time.";
