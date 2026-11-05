import {
  ActivityType,
  Client,
  GatewayIntentBits
} from "discord.js";
import { config } from "./config/env.js";
import { handleInteraction } from "./events/interactionCreate.js";
import { handlePrefixMessage } from "./events/messageCreate.js";
import { logger } from "./lib/logger.js";

const activityTypes = {
  Playing: ActivityType.Playing,
  Listening: ActivityType.Listening,
  Watching: ActivityType.Watching,
  Competing: ActivityType.Competing
} as const;

// Request only the intents required by the commands currently implemented.
// Add privileged intents only alongside a feature that needs them.
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", (readyClient) => {
  readyClient.user.setPresence({
    status: config.BOT_STATUS,
    activities: [{
      name: config.BOT_ACTIVITY_TEXT,
      type: activityTypes[config.BOT_ACTIVITY_TYPE]
    }]
  });

  logger.info(`Logged in as ${readyClient.user.tag}`);
  logger.info(`Serving ${readyClient.guilds.cache.size} guild(s)`);
  logger.info(`Prefix: ${config.DEFAULT_PREFIX}`);

  if (config.MUSIC_ENABLED === "true") {
    logger.warn("Music is not implemented yet; Lavalink configuration is currently reserved.");
  }
});

client.on("interactionCreate", (interaction) => {
  void handleInteraction(interaction).catch((error: unknown) => {
    logger.error("Unhandled interaction router error.", error);
  });
});

client.on("messageCreate", (message) => {
  void handlePrefixMessage(message).catch((error: unknown) => {
    logger.error("Unhandled prefix message router error.", error);
  });
});

client.on("warn", (message) => logger.warn("Discord client warning.", message));
client.on("error", (error) => logger.error("Discord client error.", error));

let shutdownStarted = false;

function shutdown(signal: string): void {
  if (shutdownStarted) return;
  shutdownStarted = true;
  logger.info(`Received ${signal}; closing the Discord client.`);
  client.destroy();
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason: unknown) => {
  logger.error("Unhandled promise rejection.", reason);
});

process.once("uncaughtException", (error: Error) => {
  logger.error("Uncaught exception; shutting down.", error);
  process.exitCode = 1;
  shutdown("uncaughtException");
});

async function start(): Promise<void> {
  try {
    await client.login(config.BOT_TOKEN);
  } catch (error) {
    logger.error("Discord login failed.", error);
    process.exitCode = 1;
  }
}

void start();
