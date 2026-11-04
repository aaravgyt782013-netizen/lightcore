# Light Code

A modular, multi-server Discord bot and web dashboard.

## Product identity
- Bot name: **Light Code**
- Dashboard: **red + white**, with restrained gold accents for loading/progress states
- Runtime: TypeScript + Discord.js
- Discord UI: Components V2 where supported by the installed Discord.js version
- Database: PostgreSQL + Prisma (introduced in the database phase)

## Development status
This repository is being built in tested stages. The initial commit establishes the TypeScript application foundation; feature modules will be added incrementally.

## Requirements
- Node.js 22 LTS or newer supported Node.js release
- A Discord application and bot token
- PostgreSQL (required when database modules are enabled)

## Setup
1. Copy `.env.example` to `.env`.
2. Fill in the required Discord credentials.
3. Install dependencies with `npm install`.
4. Run `npm run dev`.

Never commit `.env`, bot tokens, client secrets, database passwords, or session secrets.

## Scripts
- `npm run dev` — development runtime
- `npm run build` — TypeScript build
- `npm start` — run compiled bot
- `npm run typecheck` — type-check without emitting files

## Roadmap
1. Core configuration, startup, logging and graceful shutdown
2. Slash commands, events, permissions and Discord Components V2
3. PostgreSQL/Prisma multi-guild configuration
4. Moderation, tickets, automations and remaining modules
5. Red/white dashboard with animated loading states and developer controls

## Emoji and animation policy
The UI will support Unicode emoji, server custom emoji, animated emoji and GIF assets where Discord permissions and API rules allow them. Dashboard loading animations will be implemented in CSS; no third-party icon or emoji assets will be copied without a suitable licence.
