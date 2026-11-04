import {
  ContainerBuilder,
  MessageFlags,
  SlashCommandBuilder,
  TextDisplayBuilder,
  type ChatInputCommandInteraction
} from "discord.js";

export const pingCommand = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check Light Code response time"),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const latency = Math.max(0, Date.now() - interaction.createdTimestamp);
    const container = new ContainerBuilder().addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        [
          "# 🟥 Light Code • Pong!",
          "Discord API latency: **" + interaction.client.ws.ping + " ms**",
          "Response time: **" + latency + " ms**"
        ].join("\n")
      )
    );

    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
