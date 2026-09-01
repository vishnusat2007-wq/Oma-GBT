"use client";

import { LearningCorner } from "@/features/learn/learning-corner";
import { useAppStore } from "@/lib/store/app-store";
import { FeatureDisabled } from "@/components/app/feature-disabled";

export default function LearnPage() {
  const allowed = useAppStore((s) => s.permissions.learn);
  if (!allowed) return <FeatureDisabled feature="Learning Corner" />;
  return <LearningCorner />;
}
