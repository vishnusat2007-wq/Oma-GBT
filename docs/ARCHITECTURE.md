# OmaGBT — Architecture overview

## High-level

OmaGBT is a Next.js 16 (App Router) application written in TypeScript. It is organized by
**feature** rather than by technical layer, so each area of the product (chat, games,
magic, stories, learn, parent) owns its components and logic.

```
Browser (React 19, Client Components)
  │
  ├─ Zustand store  ── localStorage (demo data layer, single source of truth)
  │
  ├─ /api/chat      ── safety gate → AI provider (mock | Gemini | OpenAI-compatible) → text stream
  └─ /api/tools     ── Zod validation → parent-approval gate → server tool execution
                                                    │
                                          Supabase (optional: auth, DB, RLS)
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
| Data layer (demo) | `src/lib/store/app-store.tsx` | Zustand + `persist`. The runtime source of truth. |
| Seed data | `src/lib/demo/seed.ts` | Fictional child, conversations, achievements. |
| AI abstraction | `src/lib/ai/*` | `AiProvider` interface; `mock`, **Gemini (Google AI Studio)**, and `openai` adapters; `getAiProvider()` prefers Gemini when `GOOGLE_GENERATIVE_AI_API_KEY` or `GEMINI_API_KEY` is set. |
| Safety | `src/lib/safety/moderation.ts` | Input/output checks + untrusted-text sanitization. |
| Tools | `src/lib/tools/*` | Zod schemas, registry, intent detection (`registry.ts`), server execution (`server.ts`). |
| Env | `src/lib/env.ts` | Zod-validated env; `isDemoMode` / `isAiConfigured` / `isSupabaseConfigured`. |
| Supabase | `src/lib/supabase/*` | Browser & server clients (null when unconfigured). |

## Chat data flow

1. `useCompanionChat` (`src/features/chat/use-chat.ts`) adds the child message to the store,
   extracts safe memories, and detects a possible tool proposal (never auto-runs).
2. It `POST`s the conversation + companion context to `/api/chat`.
3. The route rate-limits, runs the **server-side safety gate** on the child's input, and —
   if safe — streams the reply from the selected provider as plain UTF-8 text. Gemini calls
   also send child-safe `safetySettings` (`BLOCK_LOW_AND_ABOVE` for hate, harassment,
   sexual, dangerous, and civic-integrity categories).
4. `GET /api/chat` returns a secret-free status (`aiConfigured`, `aiProvider`, `aiModel`)
   used by the parent dashboard and chat header so you can confirm Gemini is live.
5. The client reads the stream incrementally (mascot shows a “thinking” mood), then commits
   the final assistant message to the store.

## Tool system

Tools follow a strict, safe flow: the AI (or a deterministic intent detector) **proposes** a
tool → the child sees a **ToolApprovalCard** → sensitive/online tools require the **parent
PIN** → `/api/tools` validates args with Zod, enforces the approval gate, executes
server-side (in demo, returns safe mock data), and every step is written to the **audit
log**. The registry is data-driven so new capabilities can be added later.

## State & persistence

Demo mode persists to `localStorage` under `omgbt.appdata.v1`. Production persistence uses
Supabase with Row Level Security (see `supabase/migrations/0001_init.sql`); the schema
mirrors the domain types and cascades deletes from parent → child → content.

## Accessibility & UX

Semantic roles/labels on interactive controls, visible focus rings, keyboard-operable
dialogs/tabs/switches, `prefers-reduced-motion` handling (CSS + Framer `useReducedMotion`),
high-contrast light/dark themes, and responsive layouts (sidebar on desktop, bottom nav on
mobile).
