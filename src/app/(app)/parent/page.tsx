"use client";

import * as React from "react";
import { PinGate } from "@/features/parent/pin-gate";
import { ParentDashboard } from "@/features/parent/parent-dashboard";

export default function ParentPage() {
  const [unlocked, setUnlocked] = React.useState(false);
  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />;
  return <ParentDashboard />;
}
