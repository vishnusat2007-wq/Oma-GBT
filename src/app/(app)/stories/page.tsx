"use client";

import { StoryStudio } from "@/features/stories/story-studio";
import { useAppStore } from "@/lib/store/app-store";
import { FeatureDisabled } from "@/components/app/feature-disabled";

export default function StoriesPage() {
  const allowed = useAppStore((s) => s.permissions.stories);
  if (!allowed) return <FeatureDisabled feature="Story Studio" />;
  return <StoryStudio />;
}
