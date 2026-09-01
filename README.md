# OmaGBT 🌟

**OmaGBT** is a private, playful, and safe AI companion made for one child — **Jesvitha**.
It blends a streaming AI friend, a game arcade, a magic room, a story studio, and a
learning corner into one delightful, kid-friendly experience — with a robust parent
dashboard and a dedicated safety layer.

The app opens with a friendly **sign-in screen** (username + password), so it stays
private to Jesvitha.

> OmaGBT runs **fully in demo mode with zero configuration** (local storage + deterministic
> mock AI). Add an AI key and/or Supabase to switch to live mode.

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

## 🚀 Quick start (demo mode)

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. You'll be greeted by the sign-in screen.

**Sign in**
- Username: `VlovesJ`
- Password: `105441`

No keys required — after signing in you get Jesvitha's profile, seeded data, local games,
mock AI chat, and working tool-approval demos. The **parent PIN is `1234`** in demo mode.

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
| `NEXT_PUBLIC_DEMO_MODE` | `.env.local` | `true` forces demo; `false` forces live; unset = auto. |
| `AI_API_KEY` | server | Enables real streaming AI (OpenAI-compatible). |
| `AI_BASE_URL` | server | Optional base URL for an OpenAI-compatible endpoint. |
| `AI_MODEL` | server | Model name (default `gpt-4o-mini`). |
| `NEXT_PUBLIC_SUPABASE_URL` | browser | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser | Supabase anon key. |
| `SUPABASE_SERVICE_ROLE_KEY` | server | Server-only admin key (never exposed). |
| `PARENT_PIN` | server | Optional default parent PIN. |

**Switching modes:**
- **Demo → Live AI:** set `AI_API_KEY` (and optionally `AI_BASE_URL`, `AI_MODEL`), then set
  `NEXT_PUBLIC_DEMO_MODE=false`. The chat route automatically uses the real provider.
- **Demo → Live storage:** set the Supabase variables and run the migration (below). With
  Supabase configured and `NEXT_PUBLIC_DEMO_MODE` unset/`false`, the app is in live mode.

The AI provider and storage are behind clean abstractions (`src/lib/ai`, `src/lib/supabase`)
so they can be swapped without touching feature code.

## 🗄️ Supabase setup

1. Create a Supabase project and copy the URL + anon key into `.env.local`.
2. Apply the schema (RLS, indexes, foreign keys, cascade deletes):
   ```bash
   supabase db push          # with the Supabase CLI, or
   psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql
   ```
3. (Optional) Seed example rows after creating an auth user: edit the parent UUID in
   `supabase/seed.sql`, then run it.

Every table has **Row Level Security** so a parent can only access rows belonging to their
own child profiles. See `supabase/migrations/0001_init.sql`.

## ☁️ Deployment (Vercel + Supabase)

1. Push this repo to GitHub and import it into Vercel.
2. Add the environment variables from the table above in **Vercel → Project → Settings →
   Environment Variables** (set `NEXT_PUBLIC_DEMO_MODE=false` for production).
3. Provision Supabase and run the migration against your production database.
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

- **Demo-first data layer.** The default experience persists to the browser (Zustand +
  localStorage). Supabase adapters, typed schema, and RLS migrations are included and the
  clients are wired; fully routing every store write through Supabase is the documented next
  step for production.
- **AI output moderation** relies on a strong safety system prompt plus **input-side**
  moderation. A streaming output filter is stubbed for future work.
- **Rate limiting** is in-memory (fine for a single-child, single-instance deployment). For
  multi-instance serverless, back it with a shared store (e.g. Upstash Redis).
- **web_search / check_weather** return safe, clearly-labeled mock data in demo mode; wire a
  child-safe provider in `src/lib/tools/server.ts` for production.
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
