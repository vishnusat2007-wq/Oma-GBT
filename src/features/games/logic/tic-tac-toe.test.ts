import { describe, it, expect } from "vitest";
import {
  emptyBoard,
  winner,
  bestMove,
  emptyIndices,
  type Board,
} from "./tic-tac-toe";

describe("tic-tac-toe", () => {
  it("detects a row win", () => {
    const b: Board = ["X", "X", "X", null, null, null, null, null, null];
    expect(winner(b)).toBe("X");
  });

  it("detects a diagonal win", () => {
    const b: Board = ["O", null, null, null, "O", null, null, null, "O"];
    expect(winner(b)).toBe("O");
  });

  it("detects a draw", () => {
    const b: Board = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
    expect(winner(b)).toBe("draw");
  });

  it("returns null for an in-progress game", () => {
    expect(winner(emptyBoard())).toBeNull();
  });

  it("hard AI takes an immediate winning move", () => {
    const b: Board = ["O", "O", null, null, "X", null, null, "X", null];
    expect(bestMove(b, "O", "hard")).toBe(2);
  });

  it("hard AI blocks the opponent's winning move", () => {
    const b: Board = ["X", "X", null, null, "O", null, null, null, null];
    expect(bestMove(b, "O", "hard")).toBe(2);
  });

  it("hard AI never loses when going second (random opponent trials)", () => {
    for (let trial = 0; trial < 40; trial++) {
      const board = emptyBoard();
      let turn: "X" | "O" = "X"; // human first
      while (!winner(board)) {
        if (turn === "X") {
          const opts = emptyIndices(board);
          board[opts[Math.floor(Math.random() * opts.length)]] = "X";
        } else {
          const move = bestMove(board, "O", "hard");
          board[move] = "O";
        }
        turn = turn === "X" ? "O" : "X";
      }
      expect(winner(board)).not.toBe("X");
    }
  });
});
