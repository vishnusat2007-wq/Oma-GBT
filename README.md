# Oma-GBT

A warm, grandmother-style AI chatbot. Oma-GBT is a small [Next.js](https://nextjs.org)
(App Router) web app with a cozy chat interface.

It works **end-to-end with zero secrets** thanks to a built-in offline persona, and
automatically upgrades to a real LLM when an `OPENAI_API_KEY` is provided.

## Tech stack

- Next.js 16 (App Router) + React 19
- TypeScript
- Tailwind CSS v4
- A single API route (`/api/chat`) that talks to OpenAI when configured, or a
  deterministic local fallback otherwise.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 and start chatting.

## Configuration

Everything works with no configuration. To enable real LLM responses, set:

| Variable         | Required | Default       | Description                          |
| ---------------- | -------- | ------------- | ------------------------------------ |
| `OPENAI_API_KEY` | No       | —             | Enables OpenAI-backed replies.       |
| `OPENAI_MODEL`   | No       | `gpt-4o-mini` | Chat model to use when a key is set. |

```bash
export OPENAI_API_KEY=sk-...
npm run dev
```

Without a key, the chat UI shows an `offline mode` badge on replies.

## Scripts

| Command         | Description                       |
| --------------- | --------------------------------- |
| `npm run dev`   | Start the dev server (port 3000). |
| `npm run build` | Production build.                 |
| `npm run start` | Serve the production build.       |
| `npm run lint`  | Run ESLint.                       |

## API

`POST /api/chat`

```json
{ "messages": [{ "role": "user", "content": "Hi Oma!" }] }
```

Response:

```json
{ "reply": "Hello, sweetheart! ...", "source": "fallback" }
```

`source` is `"openai"` when an API key is configured, otherwise `"fallback"`.

## Cloud Agent environment

`.cursor/environment.json` configures the Cursor Cloud Agent environment: it installs
dependencies with `npm install` and runs the dev server (`npm run dev`) in a terminal
on port 3000.
