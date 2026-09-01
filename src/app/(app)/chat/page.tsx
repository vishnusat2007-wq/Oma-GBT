"use client";

import { ChatView } from "@/features/chat/chat-view";
import { useAppStore } from "@/lib/store/app-store";
import { FeatureDisabled } from "@/components/app/feature-disabled";

export default function ChatPage() {
  const allowed = useAppStore((s) => s.permissions.chat);
  if (!allowed) return <FeatureDisabled feature="Chat" />;
  return <ChatView />;
}
