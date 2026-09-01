"use client";

import confetti from "canvas-confetti";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function celebrate(intensity: "small" | "big" = "small") {
  if (prefersReducedMotion()) return;
  const count = intensity === "big" ? 160 : 70;
  confetti({
    particleCount: count,
    spread: intensity === "big" ? 100 : 70,
    origin: { y: 0.6 },
    colors: ["#a855f7", "#38bdf8", "#f472b6", "#facc15", "#34d399"],
    disableForReducedMotion: true,
  });
  if (intensity === "big") {
    setTimeout(
      () =>
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 80,
          origin: { x: 0, y: 0.7 },
          disableForReducedMotion: true,
        }),
      150,
    );
    setTimeout(
      () =>
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 80,
          origin: { x: 1, y: 0.7 },
          disableForReducedMotion: true,
        }),
      300,
    );
  }
}
