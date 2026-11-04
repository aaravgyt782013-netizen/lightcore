import {
  ContainerBuilder,
  MessageFlags,
  SlashCommandBuilder,
  TextDisplayBuilder,
  type ChatInputCommandInteraction
} from "discord.js";

export const helpCommand = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show Light Code's available starter commands"),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const container = new ContainerBuilder().addTextDisplayComponents(
      new TextDisplayBuilder().setContent([
        "# 🟥 Light Code • Help",
        "Welcome! Here are the commands currently available:",
        "",
        "• **/ping** — check bot response and gateway latency",
        "• **/help** — show this command guide",
        "",
        "_More modules will be added in future releases._"
      ].join("\n"))
    );

    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
      ephemeral: true
    });
  }
};
