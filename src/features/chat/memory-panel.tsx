"use client";

import * as React from "react";
import { Brain, Trash2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store/app-store";

export function MemoryPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const memories = useAppStore((s) => s.memories);
  const removeMemory = useAppStore((s) => s.removeMemory);
  const clearMemories = useAppStore((s) => s.clearMemories);
  const companion = useAppStore((s) => s.companion);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={`What ${companion.name} remembers`}
      description="You're in charge! Remove anything you don't want remembered."
    >
      {memories.length === 0 ? (
        <p className="rounded-2xl bg-muted p-4 text-center text-muted-foreground">
          Nothing remembered yet. As you chat, I&apos;ll remember fun things like your
          favourite colour. 🎨
        </p>
      ) : (
        <ul className="space-y-2">
          {memories.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between gap-2 rounded-2xl border-2 border-border p-3"
            >
              <div className="min-w-0">
                <p className="truncate font-bold">
                  {m.key}: <span className="font-normal">{m.value}</span>
                </p>
                <Badge variant="secondary" className="mt-1">
                  {m.category}
                </Badge>
              </div>
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Forget ${m.key}`}
                onClick={() => removeMemory(m.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      {memories.length > 0 && (
        <Button variant="destructive" className="mt-4 w-full" onClick={clearMemories}>
          <Brain className="h-4 w-4" /> Forget everything
        </Button>
      )}
    </Dialog>
  );
}
