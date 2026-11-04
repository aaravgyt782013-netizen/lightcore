import {
  ActivityType,
  Client,
  GatewayIntentBits,
  Partials
} from "discord.js";
import { config } from "./config/env.js";

const activityTypes = {
  Playing: ActivityType.Playing,
  Listening: ActivityType.Listening,
  Watching: ActivityType.Watching,
  Competing: ActivityType.Competing
} as const;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember]
});

client.once("ready", (readyClient) => {
  readyClient.user.setPresence({
    status: config.BOT_STATUS,
    activities: [{
      name: config.BOT_ACTIVITY_TEXT,
      type: activityTypes[config.BOT_ACTIVITY_TYPE]
    }]
  });

  console.info(`[Light Code] Logged in as ${readyClient.user.tag}`);
  console.info(`[Light Code] Serving ${readyClient.guilds.cache.size} guild(s)`);
});

client.on("warn", (message) => console.warn("[Discord warning]", message));
client.on("error", (error) => console.error("[Discord client error]", error));

let shuttingDown = false;
const shutdown = async (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.info(`[Light Code] Received ${signal}; shutting down gracefully.`);
  client.destroy();
  process.exit(0);
};

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

client.login(config.BOT_TOKEN).catch((error: unknown) => {
  console.error("[Light Code] Login failed:", error);
  process.exit(1);
});
