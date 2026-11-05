import {
  MessageFlags,
  SlashCommandBuilder,
  type ChatInputCommandInteraction
} from "discord.js";
import type { BotCommand } from "../types/command.js";
import { createLightCodeContainer } from "../lib/ui.js";

export const pingCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check Light Code response time"),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const responseTime = Math.max(0, Date.now() - interaction.createdTimestamp);
    const panel = createLightCodeContainer("# 🟥 Light Code • Pong!", [
      `Discord gateway latency: **${interaction.client.ws.ping} ms**`,
      `Response time: **${responseTime} ms**`
    ]);

    await interaction.reply({
      components: [panel],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
