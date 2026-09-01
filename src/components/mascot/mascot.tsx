"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import type {
  CompanionConfig,
  MascotAccessory,
  MascotColor,
  MascotShape,
} from "@/lib/data/types";
import { cn } from "@/lib/utils";

export type MascotMood = "idle" | "happy" | "thinking" | "excited" | "sad" | "wave";

const COLOR_VARS: Record<MascotColor, string> = {
  grape: "var(--grape)",
  sky: "var(--sky)",
  bubblegum: "var(--bubblegum)",
  sunshine: "var(--sunshine)",
  mint: "var(--mint)",
};

const BODY_PATHS: Record<MascotShape, string> = {
  round: "M100 20 C150 20 175 60 175 105 C175 155 145 185 100 185 C55 185 25 155 25 105 C25 60 50 20 100 20 Z",
  bean: "M100 22 C145 22 170 55 168 100 C166 150 150 184 100 184 C58 184 34 150 32 108 C30 58 55 22 100 22 Z",
  star: "M100 15 L122 65 L177 70 L135 108 L148 165 L100 135 L52 165 L65 108 L23 70 L78 65 Z",
};

function Mouth({ mood }: { mood: MascotMood }) {
  switch (mood) {
    case "excited":
      return <path d="M80 128 Q100 158 120 128 Q100 142 80 128 Z" fill="#7f1d1d" />;
    case "happy":
    case "wave":
      return <path d="M82 130 Q100 150 118 130" stroke="#7f1d1d" strokeWidth="5" fill="none" strokeLinecap="round" />;
    case "thinking":
      return <path d="M86 136 Q100 130 114 136" stroke="#7f1d1d" strokeWidth="5" fill="none" strokeLinecap="round" />;
    case "sad":
      return <path d="M84 142 Q100 126 116 142" stroke="#7f1d1d" strokeWidth="5" fill="none" strokeLinecap="round" />;
    default:
      return <path d="M84 132 Q100 144 116 132" stroke="#7f1d1d" strokeWidth="5" fill="none" strokeLinecap="round" />;
  }
}

function Accessory({ accessory }: { accessory: MascotAccessory }) {
  switch (accessory) {
    case "crown":
      return (
        <g>
          <path d="M62 40 L74 62 L100 44 L126 62 L138 40 L134 70 L66 70 Z" fill="#facc15" stroke="#eab308" strokeWidth="2" />
          <circle cx="62" cy="40" r="5" fill="#f472b6" />
          <circle cx="100" cy="34" r="5" fill="#38bdf8" />
          <circle cx="138" cy="40" r="5" fill="#34d399" />
        </g>
      );
    case "bow":
      return (
        <g transform="translate(100 38)">
          <path d="M0 0 L-26 -12 L-26 12 Z" fill="#f472b6" />
          <path d="M0 0 L26 -12 L26 12 Z" fill="#f472b6" />
          <circle r="7" fill="#ec4899" />
        </g>
      );
    case "cap":
      return (
        <g>
          <path d="M58 58 Q100 18 142 58 Z" fill="#38bdf8" />
          <rect x="96" y="24" width="8" height="14" rx="4" fill="#0284c7" />
          <path d="M142 58 Q160 58 160 66 L142 66 Z" fill="#0ea5e9" />
        </g>
      );
    case "glasses":
      return (
        <g stroke="#334155" strokeWidth="4" fill="rgba(255,255,255,0.35)">
          <circle cx="76" cy="98" r="18" />
          <circle cx="124" cy="98" r="18" />
          <line x1="94" y1="98" x2="106" y2="98" />
        </g>
      );
    default:
      return null;
  }
}

interface MascotProps {
  companion: CompanionConfig;
  mood?: MascotMood;
  size?: number;
  className?: string;
  animate?: boolean;
}

export function Mascot({
  companion,
  mood = "idle",
  size = 180,
  className,
  animate = true,
}: MascotProps) {
  const reduce = useReducedMotion();
  const shouldAnimate = animate && !reduce;
  const bob =
    mood === "excited" ? [-10, 6, -10] : mood === "sad" ? [0, 3, 0] : [-6, 4, -6];

  return (
    <motion.div
      className={cn("select-none", className)}
      style={{ width: size, height: size, color: COLOR_VARS[companion.color] }}
      animate={shouldAnimate ? { y: bob } : undefined}
      transition={
        shouldAnimate
          ? { duration: mood === "excited" ? 0.8 : 3, repeat: Infinity, ease: "easeInOut" }
          : undefined
      }
      role="img"
      aria-label={`${companion.name}, your ${mood} companion`}
    >
      <svg viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <radialGradient id="mascot-body" cx="40%" cy="35%" r="75%">
            <stop offset="0%" stopColor="white" stopOpacity="0.5" />
            <stop offset="55%" stopColor="currentColor" />
            <stop offset="100%" stopColor="currentColor" />
          </radialGradient>
        </defs>
        <ellipse cx="100" cy="188" rx="52" ry="9" fill="rgba(0,0,0,0.12)" />
        <path d={BODY_PATHS[companion.shape]} fill="url(#mascot-body)" stroke="rgba(0,0,0,0.08)" strokeWidth="2" />
        {/* cheeks */}
        <circle cx="66" cy="118" r="10" fill="#fb7185" opacity="0.5" />
        <circle cx="134" cy="118" r="10" fill="#fb7185" opacity="0.5" />
        {/* eyes */}
        <motion.g
          animate={shouldAnimate ? { scaleY: [1, 1, 0.1, 1] } : undefined}
          transition={shouldAnimate ? { duration: 4, repeat: Infinity, times: [0, 0.92, 0.96, 1] } : undefined}
          style={{ transformOrigin: "100px 98px" }}
        >
          <circle cx="78" cy="98" r="12" fill="white" />
          <circle cx="122" cy="98" r="12" fill="white" />
          <circle cx={mood === "thinking" ? 82 : 80} cy="100" r="6" fill="#1f2937" />
          <circle cx={mood === "thinking" ? 126 : 124} cy="100" r="6" fill="#1f2937" />
          <circle cx="82" cy="97" r="2" fill="white" />
          <circle cx="126" cy="97" r="2" fill="white" />
        </motion.g>
        <Mouth mood={mood} />
        <Accessory accessory={companion.accessory} />
        {mood === "excited" && (
          <g fill="#facc15">
            <path d="M40 60 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" />
            <path d="M160 70 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" />
          </g>
        )}
      </svg>
    </motion.div>
  );
}
