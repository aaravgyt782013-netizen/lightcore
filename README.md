# Light Code

A modular multi-server Discord bot foundation. Product identity: **Light Code**. Discord UI uses a red-and-white direction with restrained gold accents. Dashboard loading animations, custom emoji packs and animated assets will be added only when their dashboard/component modules exist and asset licences permit their use.

## Stack

- Node.js 22+
- TypeScript (strict mode)
- Discord.js **14.27.x**
- Discord Components V2 for supported messages
- Zod environment validation

PostgreSQL/Prisma, Redis/BullMQ, music transport and the web dashboard are planned integrations, not active in this starter build.

## Implemented in this stage

- Slash-command registry with a typed command contract.
- Button-component registry and routed interactionCreate handling.
- Components V2 /ping, /help, and /panel responses; /panel has a working **About Light Code** button.
- Typed owner, guild-context and Discord-permission checks for slash and prefix commands.
- Prefix-command registry: !ping, !help, and owner-only !say (or the configured prefix).
- Central red/gold Components V2 panel builder.
- Structured log levels, guarded interaction replies, startup error handling and graceful SIGINT/SIGTERM shutdown.
- Unit tests for command access rules and CI checks for tests, type-checking and build.

This is a working foundation, not a claim that the complete bot feature list is finished.

## Setup

1. Install Node.js 22 or newer.
2. Copy .env.example to .env.
3. Fill in BOT_TOKEN, CLIENT_ID, and OWNER_ID **locally**. Never paste secrets into chat or commit .env.
4. Run npm install.
5. Run npm test, npm run typecheck, and npm run build.
6. Run npm run deploy:commands to publish slash commands.
7. Run npm run dev for development, or npm start after building.

The bot currently requests only Guilds, GuildMessages, and MessageContent. Enable **Message Content Intent** in the Discord Developer Portal for prefix commands. Server Members, Moderation and Voice intents are intentionally not requested until a module needs them.

## Scripts

- npm run dev — development runtime with watch mode
- npm run build — compile production output to dist/
- npm start — run the compiled bot
- npm run typecheck — type-check source, scripts and tests
- npm test — run unit tests
- npm run deploy:commands — publish registered global slash commands

Global slash-command changes can take time to propagate. Deploying commands does not start the bot; run the bot separately.

## Configuration and safety

CLIENT_ID and OWNER_ID are validated as Discord snowflakes. Optional database, Redis, Lavalink, dashboard and Minecraft values are present for future modules, but are not connected in this starter build. Do not set MUSIC_ENABLED=true expecting playback: music transport is not implemented.

The owner-only say command disables mention parsing to prevent accidental mass mentions. Command permission checks are enforced in the application even if Discord-side command visibility is later configured.

## Verification status

The repository includes GitHub Actions that install dependencies, run unit tests, type-check source/scripts/tests, and compile the production build on Node.js 22. Review the Actions run for the commit before treating it as verified. A successful CI run does not replace a live Discord gateway/permission test.

## Not implemented yet

Moderation suite, anti-raid/anti-nuke, tickets, welcome/roles, temp voice, leveling/economy, music playback, Minecraft status, persistent multi-guild database configuration, dashboard authentication, dashboard CSS loading animations and the full custom/animated emoji system remain future modules. Build each in a separate tested stage; do not present these as production-ready until implemented and validated.
