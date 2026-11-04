# Light Code

A modular multi-server Discord bot foundation. Product identity: **Light Code**, red/white dashboard direction with restrained red/gold loading accents.

## Stack
- Node.js 22+, TypeScript, Discord.js 14
- Discord Components V2 for supported slash-command responses
- PostgreSQL/Prisma, Redis/BullMQ and the web dashboard are planned integrations, not active in this starter build.

## Current implemented scope
- Environment validation with Zod and graceful shutdown
- Configurable bot presence and default prefix
- Slash commands: `/ping`, `/help`
- Prefix commands: `!ping`, `!help` (or your configured prefix)
- Owner-only prefix `say` utility
- Interaction error handling and slash-command deployment script
- GitHub Actions typecheck/build workflow

## Setup
1. Install Node.js 22 or newer.
2. Copy `.env.example` to `.env`.
3. Fill `BOT_TOKEN`, `CLIENT_ID`, and `OWNER_ID`.
4. Run `npm install`.
5. Run `npm run deploy:commands` to publish slash commands.
6. Run `npm run dev`, or `npm run build && npm start`.

For prefix commands, enable **Message Content Intent** in the Discord Developer Portal and invite the bot with the required message permissions. Enable Server Members Intent only when a module actually needs it.

## Central configuration
Important values are in `.env`: `DEFAULT_PREFIX`, `BOT_STATUS`, `BOT_ACTIVITY_TYPE`, `BOT_ACTIVITY_TEXT`, `OWNER_ID`, dashboard/session settings, and the Lavalink connection fields (`LAVALINK_HOST`, `LAVALINK_PORT`, `LAVALINK_PASSWORD`, `LAVALINK_SECURE`). Music transport is **not implemented yet**; Lavalink values are configuration placeholders for that future module. Do not paste secrets into Discord or commit `.env`.

## Verification and honest status
This repository has not been run against a real Discord application from this environment. CI is configured to install dependencies, type-check and build on GitHub Actions; inspect the Actions result after pushing. A successful build does not replace live permission, gateway, database or music-provider testing.

## Roadmap
The full moderation suite, anti-raid/anti-nuke, tickets, welcome/roles, temp voice, leveling/economy, music player, Minecraft status, multi-guild database and red/white dashboard are **not yet implemented**. They must be delivered and tested in modules; this starter release must not be treated as a complete production bot.
