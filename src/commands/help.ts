import {
  MessageFlags,
  SlashCommandBuilder,
  type ChatInputCommandInteraction
} from "discord.js";
import type { BotCommand } from "../types/command.js";
import { createLightCodeContainer } from "../lib/ui.js";

export const helpCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show Light Code's available starter commands"),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const panel = createLightCodeContainer("# 🟥 Light Code • Help", [
      "Commands available in this starter build:",
      "",
      "• **/ping** — check gateway and response latency",
      "• **/help** — show this guide",
      "• **/panel** — open the interactive Components V2 preview",
      "",
      "_Only implemented commands are listed. More modules will be added after testing._"
    ]);

    await interaction.reply({
      components: [panel],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    });
  }
};
