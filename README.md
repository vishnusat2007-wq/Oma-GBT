# OmaGBT 🌟

**OmaGBT** is a private, playful, and safe AI companion made for one child — **Jesvitha**.
It blends a streaming AI friend, a game arcade, a magic room, a story studio, and a
learning corner into one delightful, kid-friendly experience — with a robust parent
dashboard and a dedicated safety layer.

The app opens with a friendly **sign-in screen** (username + password), so it stays
private to Jesvitha.

> Chats, memories, and parent settings sync to **Supabase** after sign-in. Without an AI
> key the companion still replies with the friendly local mock so the app is always usable.

---

## ✨ Features

- **Magical home screen** — animated mascot, personalized greeting, daily surprise, room
  navigation, streaks, achievements, and one-tap companion customization.
- **AI companion chat** — streaming replies, suggested starters, Markdown, speech-to-text
  (browser), text-to-speech, safe long-term memory (viewable/removable), conversation
  rename/archive/delete, stop & regenerate, and friendly error/retry states.
- **Game arcade** — six genuinely playable games (Tic-Tac-Toe with a minimax AI, Memory
  Match, Rock-Paper-Scissors, Guess What!, Trivia, and a Choose-Your-Adventure). All logic
  runs locally — no AI request per move.
- **Magic room** — four safe illusions (Number Prediction, Binary Mind-Reading Cards, the
  Vanishing Star, and a Magic Story Reveal), each with a “Learn the secret” explainer.
- **Story studio** — build branching stories (characters, setting, mood, length), make
  choices, save/continue favorites, read-aloud, and print.
- **Learning corner** — age-appropriate explanations with a “simpler / deeper” toggle,
  flashcards, quizzes, honest uncertainty language, and hint-based homework help.
- **Safe tool system** — permission-based tools (web search, weather, reminders, notes,
  start game, open approved website). Sensitive/online actions require a **parent PIN**,
  are validated with **Zod**, run server-side, and are recorded in a **parent audit log**.
- **Parent dashboard** — PIN-protected: profile & age range, feature toggles, time limits
  & quiet hours, website allowlist, memory review, tool audit, safety events, data export,
  full data deletion, sound/voice controls, and an **emergency online-tools kill switch**.

## 🧱 Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion ·
Zustand · Vercel AI SDK (`ai`) with an OpenAI-compatible provider · Supabase (auth, DB,
RLS) · Zod · Vitest (unit) · Playwright (e2e).

---

## 🚀 Quick start

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. You'll be greeted by the sign-in screen.

**Sign in**
- Username: `VlovesJ`
- Password: `105441`

After signing in, Jesvitha's profile and Pip load from the cloud when Supabase is
configured (otherwise a local cache is used). Mock AI chat and games work without an
AI key. The **parent PIN defaults to `1234`** until a grown-up changes it.

### Changing the sign-in credentials

The password is **never stored in the repo** — only a SHA-256 hash of `username:password`
is kept (`src/lib/auth.ts`). To change it, generate a new hash and set it via
`NEXT_PUBLIC_AUTH_HASH` (or replace `DEFAULT_AUTH_HASH`):

```bash
node -e "const c=require('crypto');console.log(c.createHash('sha256').update('NEWUSER:NEWPASS').digest('hex'))"
```

Sign-in is a client-side gate suited to a personal device (matching the demo-first design).
For an internet-facing deployment, use a real identity provider — the Supabase Auth clients
are already included.

## 🔧 Configuration & modes

Copy `.env.example` to `.env.local` and set values. Only `NEXT_PUBLIC_*` variables reach
the browser; everything else is server-only.

| Variable | Where | Purpose |
| --- | --- | --- |
| `AI_API_KEY` | server | Enables real streaming AI (OpenAI-compatible). |
| `AI_BASE_URL` | server | Optional base URL for an OpenAI-compatible endpoint. |
| `AI_MODEL` | server | Model name (default `gpt-4o-mini`). |
| `NEXT_PUBLIC_SUPABASE_URL` | browser / server | Dedicated OmaGBT Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser / server | Supabase anon key (RPCs only; tables are RLS-locked). |
| `OMAGBT_HOUSEHOLD_SECRET` | server | Shared secret for `omagbt_load` / `omagbt_save` / `omagbt_wipe`. |
| `PARENT_PIN` | server | Optional default parent PIN. |

Cloud memory uses security-definer RPCs in `supabase/migrations/0002_cloud_family_memory.sql`.
Hash `OMAGBT_HOUSEHOLD_SECRET` with SHA-256 and store it in `public.household_auth`.
Parent **Delete all data** wipes the cloud snapshot and the device cache.

## ☁️ Deployment (Vercel + Supabase)

1. Push this repo to GitHub and import it into Vercel.
2. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
   `OMAGBT_HOUSEHOLD_SECRET` in **Vercel → Project → Settings → Environment Variables**.
3. The dedicated `omagbt` Supabase project already has `0002_cloud_family_memory` applied.
4. Deploy. The app builds with `next build` and needs no extra configuration.

---

## 🧪 Testing

```bash
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run test       # Vitest unit tests (games, safety, tools, memory, magic)
npm run e2e        # Playwright end-to-end (onboarding, chat, a full game, parent PIN)
```

The first Playwright run needs browsers: `npx playwright install chromium`.

## 🏗️ Architecture & safety docs

- Architecture overview: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Safety & privacy design: [`docs/SAFETY.md`](docs/SAFETY.md)

## ⚠️ Known limitations

- **Cloud memory.** After sign-in, the store syncs through `/api/sync` to Supabase. The
  device cache still works offline. Parent delete wipes cloud + local.
- **AI output moderation** relies on a strong safety system prompt plus **input-side**
  moderation. A streaming output filter is stubbed for future work.
- **Rate limiting** is in-memory (fine for a single-child, single-instance deployment). For
  multi-instance serverless, back it with a shared store (e.g. Upstash Redis).
- **web_search / check_weather** return kid-safe placeholder results until a child-safe
  provider is wired in `src/lib/tools/server.ts`.
- No legal compliance (COPPA/GDPR-K) is claimed; consult a professional before public use.

## 📁 Project structure

```
src/
  app/                      # App Router: (app) group + /api routes
  components/               # UI primitives, mascot, theme, app frame
  features/                 # Feature-based modules
    chat/ games/ magic/ stories/ learn/ parent/ home/
  lib/
    ai/                     # provider abstraction (mock + OpenAI-compatible)
    data/ demo/ store/      # domain types, seed, Zustand store (demo data layer)
    safety/ tools/ supabase/ env.ts
supabase/migrations/        # SQL schema + RLS
e2e/                        # Playwright tests
```

Made with care. OmaGBT is an AI companion — it is clearly labeled as AI, never claims to be
human, and always encourages talking to trusted grown-ups. 💜
