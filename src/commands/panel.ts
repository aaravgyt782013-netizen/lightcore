import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  SlashCommandBuilder,
  type ChatInputCommandInteraction
} from "discord.js";
import type { BotCommand } from "../types/command.js";
import { createLightCodeContainer } from "../lib/ui.js";

export const panelCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Open the Light Code Components V2 preview panel"),

  guildOnly: true,

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const aboutButton = new ButtonBuilder()
      .setCustomId("lightcode:about")
      .setLabel("About Light Code")
      .setStyle(ButtonStyle.Secondary);

    const container = createLightCodeContainer(
      "# 🟥 Light Code • Control Panel Preview",
      [
        "Welcome to the modular control surface.",
        "",
        "🟥 **Core:** command and event routing",
        "🟨 **Experience:** red-and-white interface with gold accents",
        "🔐 **Access:** command permissions are checked by the bot",
        "",
        "_Dashboard, database and advanced modules are planned—not active in this preview._"
      ]
    ).addActionRowComponents(
      new ActionRowBuilder<ButtonBuilder>().addComponents(aboutButton)
    );

    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
