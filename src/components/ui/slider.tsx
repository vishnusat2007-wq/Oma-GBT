"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onValueChange: (value: number) => void;
  id?: string;
  className?: string;
  "aria-label"?: string;
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  onValueChange,
  id,
  className,
  ...aria
}: SliderProps) {
  return (
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onValueChange(Number(e.target.value))}
      className={cn(
        "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary",
        className,
      )}
      {...aria}
    />
  );
}
