# OmaGBT — Architecture overview

## High-level

OmaGBT is a Next.js 16 (App Router) application written in TypeScript. It is organized by
**feature** rather than by technical layer, so each area of the product (chat, games,
magic, stories, learn, parent) owns its components and logic.

```
Browser (React 19, Client Components)
  │
  ├─ Zustand store  ── localStorage cache + /api/sync → Supabase (cloud memory)
  │
  ├─ /api/chat      ── safety gate → AI provider (mock | OpenAI-compatible) → text stream
  └─ /api/tools     ── Zod validation → parent-approval gate → server tool execution
```

## Rendering strategy

- The root layout (`src/app/layout.tsx`) is a Server Component that loads fonts and mounts
  the theme + store providers.
- Feature pages are **Client Components** because the product is highly interactive
  (real-time games, streaming chat, live customization). Route handlers under `src/app/api`
  keep all secret-touching logic on the server.
- The `(app)` route group shares one frame (`AppFrame`) that renders the responsive nav,
  hydration gate, and page transitions. `/parent` lives in the same group but gates behind a
  PIN component.

## Key modules

| Area | Location | Notes |
| --- | --- | --- |
| Domain types | `src/lib/data/types.ts` | All entity shapes. |
| Data layer | `src/lib/store/app-store.tsx` | Zustand + `persist` (device cache). |
| Cloud memory | `src/lib/cloud/*`, `/api/sync` | Supabase RPCs; memories also stored in `cloud_memories`. |
| Seed data | `src/lib/demo/seed.ts` | Fresh household defaults (Jesvitha + Pip, empty chats). |
| AI abstraction | `src/lib/ai/*` | `AiProvider` interface; `mock` and `openai` adapters; `getAiProvider()` selects based on env. |
| Safety | `src/lib/safety/moderation.ts` | Input/output checks + untrusted-text sanitization. |
| Tools | `src/lib/tools/*` | Zod schemas, registry, intent detection (`registry.ts`), server execution (`server.ts`). |
| Env | `src/lib/env.ts` | Zod-validated env; `isAiConfigured` / `isSupabaseConfigured`. |
| Supabase | `src/lib/supabase/*`, `src/lib/cloud/server.ts` | Anon key + household-secret RPCs (tables are RLS-locked). |

## Chat data flow

1. `useCompanionChat` (`src/features/chat/use-chat.ts`) adds the child message to the store,
   extracts safe memories, and detects a possible tool proposal (never auto-runs).
2. It `POST`s the conversation + companion context to `/api/chat`.
3. The route rate-limits, runs the **server-side safety gate** on the child's input, and —
   if safe — streams the reply from the selected provider as plain UTF-8 text.
4. The client reads the stream incrementally (mascot shows a “thinking” mood), then commits
   the final assistant message to the store.

## Tool system

Tools follow a strict, safe flow: the AI (or a deterministic intent detector) **proposes** a
tool → the child sees a **ToolApprovalCard** → sensitive/online tools require the **parent
PIN** → `/api/tools` validates args with Zod, enforces the approval gate, executes
server-side (in demo, returns safe mock data), and every step is written to the **audit
log**. The registry is data-driven so new capabilities can be added later.

## State & persistence

Zustand still caches the household on the device (`omagbt.appdata.v3`). After sign-in,
`CloudSync` loads `/api/sync` (Supabase `family_snapshots` + `cloud_memories`) and
debounce-saves later changes. Parent **Delete all data** wipes both the cloud snapshot
and localStorage, then restores empty defaults — it does not reseed fake demo chats.
See `supabase/migrations/0002_cloud_family_memory.sql`.

## Accessibility & UX

Semantic roles/labels on interactive controls, visible focus rings, keyboard-operable
dialogs/tabs/switches, `prefers-reduced-motion` handling (CSS + Framer `useReducedMotion`),
high-contrast light/dark themes, and responsive layouts (sidebar on desktop, bottom nav on
mobile).
