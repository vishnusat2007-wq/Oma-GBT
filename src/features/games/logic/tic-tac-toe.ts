export type Cell = "X" | "O" | null;
export type Board = Cell[];
export type Difficulty = "easy" | "medium" | "hard";

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function emptyBoard(): Board {
  return Array(9).fill(null);
}

export function winner(board: Board): Cell | "draw" | null {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every((c) => c !== null)) return "draw";
  return null;
}

export function emptyIndices(board: Board): number[] {
  return board.reduce<number[]>((acc, c, i) => (c === null ? [...acc, i] : acc), []);
}

function minimax(
  board: Board,
  player: "X" | "O",
  ai: "X" | "O",
  depth: number,
): { score: number; index: number } {
  const result = winner(board);
  const human = ai === "X" ? "O" : "X";
  if (result === ai) return { score: 10 - depth, index: -1 };
  if (result === human) return { score: depth - 10, index: -1 };
  if (result === "draw") return { score: 0, index: -1 };

  const moves = emptyIndices(board).map((index) => {
    const next = [...board];
    next[index] = player;
    const { score } = minimax(next, player === "X" ? "O" : "X", ai, depth + 1);
    return { score, index };
  });

  return moves.reduce((best, move) =>
    player === ai
      ? move.score > best.score
        ? move
        : best
      : move.score < best.score
        ? move
        : best,
  );
}

export function bestMove(
  board: Board,
  ai: "X" | "O",
  difficulty: Difficulty,
  rng: () => number = Math.random,
): number {
  const options = emptyIndices(board);
  if (options.length === 0) return -1;

  if (difficulty === "easy") {
    return options[Math.floor(rng() * options.length)];
  }

  if (difficulty === "medium") {
    const human: "X" | "O" = ai === "X" ? "O" : "X";
    // Win if possible, else block, else prefer center/corners.
    const marks: ("X" | "O")[] = [ai, human];
    for (const mark of marks) {
      for (const i of options) {
        const test = [...board];
        test[i] = mark;
        if (winner(test) === mark) return i;
      }
    }
    if (options.includes(4)) return 4;
    const corners = [0, 2, 6, 8].filter((c) => options.includes(c));
    if (corners.length) return corners[Math.floor(rng() * corners.length)];
    return options[Math.floor(rng() * options.length)];
  }

  return minimax(board, ai, ai, 0).index;
}
