import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  BOT_TOKEN: z.string().min(1, "BOT_TOKEN is required"),
  CLIENT_ID: z.string().min(1, "CLIENT_ID is required"),
  CLIENT_SECRET: z.string().default(""),
  OWNER_ID: z.string().min(1, "OWNER_ID is required"),
  DEFAULT_PREFIX: z.string().min(1).max(5).default("!"),
  BOT_STATUS: z.enum(["online", "idle", "dnd", "invisible"]).default("online"),
  BOT_ACTIVITY_TYPE: z.enum(["Playing", "Listening", "Watching", "Competing"]).default("Playing"),
  BOT_ACTIVITY_TEXT: z.string().default("Light Code"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  DATABASE_URL: z.string().default(""),
  REDIS_URL: z.string().default(""),
  DASHBOARD_URL: z.string().default("http://localhost:3000"),
  SESSION_SECRET: z.string().default(""),
  MUSIC_ENABLED: z.enum(["true", "false"]).default("false"),
  LAVALINK_HOST: z.string().default(""),
  LAVALINK_PORT: z.coerce.number().int().min(1).max(65535).default(2333),
  LAVALINK_PASSWORD: z.string().default(""),
  LAVALINK_SECURE: z.enum(["true", "false"]).default("false"),
  MUSIC_DEFAULT_VOLUME: z.coerce.number().int().min(0).max(100).default(50),
  MUSIC_DEFAULT_SEARCH_SOURCE: z.enum(["ytsearch", "ytmsearch", "scsearch"]).default("ytsearch"),
  MUSIC_PLAYLIST_URL: z.string().default(""),
  MUSIC_MAX_QUEUE_SIZE: z.coerce.number().int().min(1).max(500).default(100),
  MINECRAFT_SERVER_IP: z.string().default(""),
  SUPPORT_SERVER_URL: z.string().default("")
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration:");
  for (const issue of parsed.error.issues) console.error(`- ${issue.path.join(".")}: ${issue.message}`);
  process.exit(1);
}
export const config = parsed.data;
