# OmaGBT 🌟

**OmaGBT** is a private, playful, and safe AI companion made for one child — **Jesvitha**.
It blends a streaming AI friend, a game arcade, a magic room, a story studio, and a
learning corner into one delightful, kid-friendly experience — with a robust parent
dashboard and a dedicated safety layer.

The app opens with a friendly **sign-in screen** (username + password), so it stays
private to Jesvitha.

> OmaGBT runs **fully offline with zero configuration** (this device + deterministic
> mock AI). Add a Gemini key for live chat, and Convex for memory that follows Jesvitha
> across devices.

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
Zustand · Vercel AI SDK (`ai`) with **Google Gemini** (recommended) or an OpenAI-compatible
provider · Convex (household memory) · Zod · Vitest (unit) · Playwright (e2e).

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

Sign-in is a household gate for this one private app. A correct login also sets an
httpOnly cookie (`POST /api/session`) so cloud sync can run on the server. Convex
functions additionally require `OMAGBT_HOUSEHOLD_SECRET`, which never reaches the browser.
Supabase Auth was never called by the app, so it was not replaced with Convex Auth.

## 🔧 Configuration & modes

Copy `.env.example` to `.env.local` and set values. Only `NEXT_PUBLIC_*` variables reach
the browser; everything else is server-only.

| Variable | Where | Purpose |
| --- | --- | --- |
| `GOOGLE_GENERATIVE_AI_API_KEY` | server | **Recommended.** Gemini key from [Google AI Studio](https://aistudio.google.com/apikey). |
| `GEMINI_API_KEY` | server | Alias for the Gemini key (also accepted). |
| `AI_PROVIDER` | server | `auto` (default), `gemini`, or `openai`. |
| `AI_API_KEY` | server | OpenAI-compatible API key (alternative to Gemini). |
| `AI_BASE_URL` | server | Optional base URL for an OpenAI-compatible endpoint. |
| `AI_MODEL` | server | Model name (default `gemini-3.6-flash` with Gemini, else `gpt-4o-mini`). |
| `CONVEX_DEPLOYMENT` | CLI | Which Convex deployment the CLI targets (`.env.local` only). |
| `NEXT_PUBLIC_CONVEX_URL` | build / server | Convex deployment URL (`https://<name>.convex.cloud`). |
| `CONVEX_DEPLOY_KEY` | Vercel | Deploy key so `npx convex deploy` can push functions. |
| `OMAGBT_HOUSEHOLD_SECRET` | server + Convex | Shared secret for load/save/wipe. Already set on the oma-gbt Vercel project. |
| `PARENT_PIN` | server | Optional default parent PIN. |

**Switching modes:**
- **Live AI (Gemini):** create a key at [Google AI Studio](https://aistudio.google.com/apikey), set
  `GOOGLE_GENERATIVE_AI_API_KEY` (or `GEMINI_API_KEY`). Chat uses Gemini automatically when
  `AI_PROVIDER` is `auto` or `gemini`. Gemini works even while memory stays on this device.
- **Live AI (OpenAI-compatible):** set `AI_API_KEY` (and optionally `AI_BASE_URL`, `AI_MODEL`).
- **Cloud memory:** create a Convex project for Oma GBT (not kiwi-chat), set
  `NEXT_PUBLIC_CONVEX_URL` and `OMAGBT_HOUSEHOLD_SECRET`, and set that same secret on the
  Convex deployment. See below.

### Google Gemini setup & verification

This is the Google API OmaGBT actually uses: **Google AI Studio / Gemini** for companion chat.
There is no Google OAuth callback — the key stays on the server.

1. Open [Google AI Studio](https://aistudio.google.com/apikey) and create an API key.
2. Copy `.env.example` to `.env.local` and set:
   ```bash
   GOOGLE_GENERATIVE_AI_API_KEY=your-key-here
   AI_PROVIDER=auto
   AI_MODEL=gemini-3.6-flash
   ```
3. Restart `npm run dev`.
4. Confirm the server selected Gemini (this JSON never includes the key):
   ```bash
   curl -s http://localhost:3000/api/chat
   ```
   Expected:
   ```json
   {"status":"ok","service":"omgbt-chat","aiConfigured":true,"aiProvider":"gemini","aiModel":"gemini-3.6-flash"}
   ```
5. Sign in, open **Chat** — the subtitle should say `Live Gemini`.
6. Open **Parents** (PIN `1234` in demo) — **AI provider** should show `Gemini` and **AI model**
   should show `gemini-3.6-flash`.
7. Send a chat message. A real Gemini reply streams back; the response includes
   `x-omgbt-source: gemini` (not `mock`).

On Vercel, add the same variables under **Project → Settings → Environment Variables**
(Production + Preview), then redeploy. Do not put the Gemini key in `NEXT_PUBLIC_*`.

A generic `GOOGLE_API_KEY` (Maps, Custom Search, etc.) is **not** treated as a Gemini key.

The AI provider and storage are behind clean abstractions (`src/lib/ai`, `src/lib/cloud`)
so they can be swapped without touching feature code.

## 🗄️ Convex setup

Oma GBT keeps one household (`jesvitha`) in its own Convex project. Do not point it at
the kiwi-chat deployment.

1. Log in as the Convex account that owns team `vishnu-satyavarapu`:
   ```bash
   npx convex login
   ```
2. Create a project and a production deployment (names can be `oma-gbt`):
   ```bash
   npx convex project create oma-gbt --team vishnu-satyavarapu
   npx convex deployment create prod --type prod --default --select
   ```
3. Push the functions and write the URL into `.env.local`:
   ```bash
   npx convex dev --once
   ```
4. Generate a household secret if you do not already have one (`openssl rand -hex 32`).
   The oma-gbt Vercel project already stores `OMAGBT_HOUSEHOLD_SECRET`. Use that same
   value in both places:
   ```bash
   npx convex env set OMAGBT_HOUSEHOLD_SECRET "<the vercel value>"
   ```
   Also put it in `.env.local` as `OMAGBT_HOUSEHOLD_SECRET`.
5. Create a deploy key for Vercel (Convex dashboard → Project Settings → Deploy Keys,
   or `npx convex deployment token create vercel-prod`).

A brand-new deployment is empty. The first signed-in visit uploads Jesvitha's profile,
Pip, and the parent website allowlist. It does not upload the old fake demo chats.

The paused Supabase project `omagbt` (`wudvornitqucrahtlzgo`) did not answer, so its
rows were not copied. Supabase Auth, Storage, Realtime, and Edge Functions were not
used by the running app.

## ☁️ Deployment (Vercel + Convex)

1. In **Vercel → oma-gbt → Settings → Environment Variables**, set:
   - `CONVEX_DEPLOY_KEY` — production deploy key (and a preview deploy key on Preview, if you use preview deployments).
   - `NEXT_PUBLIC_CONVEX_URL` — `https://<deployment>.convex.cloud` from the Convex dashboard.
   - `OMAGBT_HOUSEHOLD_SECRET` — already set; copy that exact value into the Convex deployment env as well.
   - `CONVEX_DEPLOYMENT` — optional on Vercel. The CLI uses it locally (for example `prod:oma-gbt`). Production deploys select the deployment from `CONVEX_DEPLOY_KEY`.
2. Build command (already in `vercel.json`):
   ```bash
   npx convex deploy --cmd 'npm run build'
   ```
   That pushes `convex/` and injects `NEXT_PUBLIC_CONVEX_URL` for the Next.js build.
3. Keep the existing Gemini variables. Remove `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` after the Convex deploy is healthy. They are unused.
4. Redeploy. Sign in, send a chat, then open Parents and confirm **Cloud memory** says Connected.

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

- **Device cache plus Convex.** Without Convex env vars, chats stay in this browser
  (`omagbt.appdata.v3`). With Convex configured, the same snapshot syncs after sign-in.
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
    ai/                     # provider abstraction (mock + Gemini + OpenAI-compatible)
    data/ demo/ store/      # domain types, seed, Zustand store (demo data layer)
    safety/ tools/ cloud/ env.ts
convex/                     # Convex schema, queries, and mutations
e2e/                        # Playwright tests
```

Made with care. OmaGBT is an AI companion — it is clearly labeled as AI, never claims to be
human, and always encourages talking to trusted grown-ups. 💜
