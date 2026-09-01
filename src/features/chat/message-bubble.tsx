"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { Volume2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Message } from "@/lib/data/types";

export function MessageBubble({
  message,
  companionName,
  onSpeak,
}: {
  message: Message;
  companionName: string;
  onSpeak?: (text: string) => void;
}) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div className={cn("max-w-[85%] space-y-1", isUser && "items-end")}>
        {!isUser && (
          <div className="flex items-center gap-1.5 px-1 text-xs font-bold text-muted-foreground">
            {companionName}
            {message.aiGenerated && (
              <Badge variant="secondary" className="px-1.5 py-0 text-[9px]">
                <Sparkles className="h-2.5 w-2.5" /> AI
              </Badge>
            )}
          </div>
        )}
        <div
          className={cn(
            "rounded-3xl px-4 py-2.5 shadow-sm",
            isUser
              ? "rounded-br-md bg-primary text-primary-foreground"
              : "rounded-bl-md bg-card text-card-foreground",
          )}
        >
          <div className="prose-omgbt space-y-2 text-[15px] leading-relaxed [&_a]:underline [&_code]:rounded [&_code]:bg-black/10 [&_code]:px-1 [&_ul]:list-disc [&_ul]:pl-5">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        </div>
        {!isUser && onSpeak && (
          <button
            onClick={() => onSpeak(message.content)}
            className="flex items-center gap-1 px-1 text-xs font-bold text-muted-foreground hover:text-foreground"
            aria-label="Read this aloud"
          >
            <Volume2 className="h-3.5 w-3.5" /> Read aloud
          </button>
        )}
      </div>
    </motion.div>
  );
}
