<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

OmaGBT is a private companion for Jesvitha. After `npm install`, run `npm run dev` (port 3000). Sign-in is username `VlovesJ` / password `105441`. The parent PIN default is `1234`.

Cloud memory uses Convex, not Supabase. This app has its own Convex project (do not reuse kiwi-chat). Local anonymous Convex is `CONVEX_AGENT_MODE=anonymous npx convex dev`. Set `OMAGBT_HOUSEHOLD_SECRET` (at least 16 characters) in both `.env.local` and the Convex deployment (`npx convex env set OMAGBT_HOUSEHOLD_SECRET ...`). Sync only works after a real login (`POST /api/session` sets an httpOnly cookie). Playwright tests that only stub `sessionStorage` skip cloud sync and still work locally.

Parent **Delete all data** must call `DELETE /api/sync` then clear `omagbt.appdata.v3` and `createInitialData()`. It must not reseed fake demo chats or memories.

Do not show a Demo mode badge on the home or PIN screens. Keep mascot avatars CSS-sized so they are not clipped on mobile web.

Standard scripts live in `package.json` (`lint`, `typecheck`, `test`, `e2e`, `dev`). The Vercel build command is `npx convex deploy --cmd 'npm run build'` (`vercel.json`).
