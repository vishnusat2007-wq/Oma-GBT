export type Move = "rock" | "paper" | "scissors";
export type Outcome = "win" | "lose" | "draw";

export const MOVES: Move[] = ["rock", "paper", "scissors"];

export const MOVE_EMOJI: Record<Move, string> = {
  rock: "✊",
  paper: "✋",
  scissors: "✌️",
};

const BEATS: Record<Move, Move> = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper",
};

export function judge(player: Move, opponent: Move): Outcome {
  if (player === opponent) return "draw";
  return BEATS[player] === opponent ? "win" : "lose";
}

export function randomMove(rng: () => number = Math.random): Move {
  return MOVES[Math.floor(rng() * MOVES.length)];
}
