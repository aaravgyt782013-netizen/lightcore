import { MessageFlags, type ButtonInteraction } from "discord.js";
import type { ButtonHandler } from "../types.js";
import { createLightCodeContainer, LIGHT_CODE_GOLD } from "../../lib/ui.js";

export const aboutButton: ButtonHandler = {
  customId: "lightcode:about",
  async execute(interaction: ButtonInteraction): Promise<void> {
    const panel = createLightCodeContainer(
      "# 🟥 About Light Code",
      [
        "A modular Discord bot built with TypeScript and Discord.js.",
        "",
        "🟥 **Interface:** Discord Components V2",
        "🟨 **Brand direction:** red, white and gold accents",
        "🔒 **Safety:** permission checks and secret-free configuration",
        "",
        "_Modules are added in tested stages; this panel does not imply unfinished features are live._"
      ],
      LIGHT_CODE_GOLD
    );

    await interaction.reply({
      components: [panel],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    });
  }
};
