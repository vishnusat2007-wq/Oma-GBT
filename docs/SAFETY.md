# omgbt — Safety & privacy design

omgbt is built for one child, supervised by one parent. Safety and privacy are core
features, not afterthoughts.

## Safety layer

Location: `src/lib/safety/moderation.ts` (unit-tested in `moderation.test.ts`).

- **Input moderation** (`checkUserInput`) runs **server-side** in `/api/chat` before any AI
  call. It conservatively handles: self-harm, grooming/secrecy, sexual content, violence,
  bullying, substances, dangerous challenges, personal-information sharing, and medical
  questions.
- **Refusals are gentle and non-frightening**, use simple language, and — where appropriate
  — encourage telling a trusted adult. Urgent categories (self-harm, grooming) surface a
  visible “tell a trusted adult / emergency help” banner in the chat.
- **Output checks** (`checkModelOutput`) block secrecy phrasing and other unsafe patterns.
- **Prompt-injection defense** (`sanitizeUntrustedText`): any retrieved/online text is
  treated as untrusted **data**, never instructions. Common override phrases are stripped and
  length is capped before the text can reach the model or child.
- The **system prompt** (`src/lib/ai/prompt.ts`) enforces that the companion: is clearly an
  AI (never claims to be human), never encourages secrecy/isolation/dependency, never asks
  for private data, redirects unsafe topics, avoids medical/mental-health diagnoses, and
  treats tool/web text as untrusted.

## Behavioral guarantees

- The companion **never sexualizes minors** and refuses such content outright.
- It **never asks the child to keep secrets** and actively discourages secrecy.
- For urgent danger it advises getting a nearby trusted adult or local emergency services.
- It uses **clear uncertainty language** when it doesn't know something.
- A child-friendly **“tell a trusted adult”** path is surfaced during sensitive moments.

## Privacy & data minimization

- **No email required for the child.** A parent account owns a child **nickname** profile.
- No public profiles, followers, leaderboards, stranger chat, or content sharing.
- **Memory is limited to safe preferences** (favorite color, hobbies, characters, learning
  goals). `extractMemories` explicitly refuses to capture names, addresses, phone numbers,
  schools, or other identifiers (unit-tested). The child can view and delete every memory;
  parents can review and wipe memories too.
- No ads, tracking pixels, loot boxes, purchases, or manipulative engagement mechanics.
- Secrets live only in server-side environment variables and are never rendered to the UI.

## Access control & hardening

- **Parent dashboard** is protected by a PIN with attempt limiting; sensitive tool actions
  require the PIN inline.
- **Tool inputs** are validated with strict Zod schemas; online tools always require parent
  approval and are audited.
- API routes set `Cache-Control: no-store` and `X-Content-Type-Options: nosniff`, and are
  rate-limited.
- **Row Level Security** (see `supabase/migrations/0001_init.sql`) ensures one account can
  never read another account's records.
- Rendered chat uses `react-markdown` **without raw HTML**, preventing HTML/script injection.
- **Structured logging** excludes secrets and conversation content.
- **Emergency switch:** parents can instantly disable all online tools.
- AI-generated content is **clearly labeled** (an “AI” badge on companion messages, and a
  note on printed stories).

## What omgbt intentionally does NOT do

No autonomous purchasing, financial transactions, social-media posting, messaging strangers,
downloading executables, changing account settings, revealing location, or browsing
unrestricted websites. Only the parent-maintained allowlist can be opened.

## Not a legal-compliance claim

This document describes design intent. It is **not** a legal assessment. Before any public or
commercial use, consult a professional regarding COPPA, GDPR-K, and local regulations.
