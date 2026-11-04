# Light Code

A modular, multi-server Discord bot and web dashboard.

## Product identity
- Bot name: **Light Code**
- Dashboard: **red + white**, with restrained gold accents for loading/progress states
- Runtime: TypeScript + Discord.js
- Discord UI: Components V2 where supported by the installed Discord.js version
- Database: PostgreSQL + Prisma (planned phase; not enabled yet)

## Current implementation
- Typed slash-command contract and command registry
- Interaction event handler with safe user-facing error responses
- Components V2 `/ping` command showing gateway and response latency
- Components V2 ephemeral `/help` command
- Slash-command publishing script
- Environment validation and graceful process shutdown

## Requirements
- Node.js 22 or newer
- A Discord application and bot token
- Enable the **Server Members Intent** and **Message Content Intent** in the Discord Developer Portal only if/when your enabled modules need them

## Setup
1. Copy `.env.example` to `.env`.
2. Fill in `BOT_TOKEN`, `CLIENT_ID`, and `OWNER_ID`.
3. Install dependencies with `npm install`.
4. Publish slash commands with `npm run deploy:commands`.
5. Start in development with `npm run dev`, or compile with `npm run build` and run `npm start`.

Never commit `.env`, bot tokens, client secrets, database passwords, or session secrets.

## Scripts
- `npm run dev` — development runtime
- `npm run build` — TypeScript build
- `npm start` — run compiled bot
- `npm run typecheck` — type-check without emitting files
- `npm run deploy:commands` — publish the registered slash commands globally

## Roadmap
1. Core configuration, startup, logging and graceful shutdown — foundation in place
2. Slash commands, events, permissions and Discord Components V2 — starter implementation in place
3. PostgreSQL/Prisma multi-guild configuration
4. Moderation, tickets, automations and remaining bot modules
5. Red/white dashboard with animated loading states and developer controls

## Emoji and animation policy
The UI will support Unicode emoji, server custom emoji, animated emoji and GIF assets where Discord permissions and API rules allow them. Dashboard loading animations will be implemented in CSS; no third-party icon or emoji assets will be copied without a suitable licence.

## Verification status
The source files have been committed to GitHub. A dependency install, TypeScript build, Discord login, and live slash-command test have **not** been run from this environment. Run the scripts above in your own Node.js environment and review any errors before deployment.
