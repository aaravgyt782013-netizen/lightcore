import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  BOT_TOKEN: z.string().min(1, "BOT_TOKEN is required"),
  CLIENT_ID: z.string().min(1, "CLIENT_ID is required"),
  OWNER_ID: z.string().min(1, "OWNER_ID is required"),
  BOT_STATUS: z.enum(["online", "idle", "dnd", "invisible"]).default("online"),
  BOT_ACTIVITY_TYPE: z.enum(["Playing", "Listening", "Watching", "Competing"]).default("Playing"),
  BOT_ACTIVITY_TEXT: z.string().default("Light Code"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  for (const issue of parsed.error.issues) {
    console.error(`- ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const config = parsed.data;
