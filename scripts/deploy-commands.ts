import { REST, Routes } from "discord.js";
import { config } from "../src/config/env.js";
import { commands } from "../src/commands/index.js";

const rest = new REST({ version: "10" }).setToken(config.BOT_TOKEN);

try {
  console.info(`[Light Code] Publishing ${commands.length} global application command(s)...`);
  await rest.put(Routes.applicationCommands(config.CLIENT_ID), {
    body: commands.map((command) => command.data.toJSON())
  });
  console.info("[Light Code] Slash commands published successfully.");
} catch (error) {
  console.error("[Light Code] Failed to publish slash commands:", error);
  process.exitCode = 1;
}
