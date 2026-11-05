import type { ButtonInteraction } from "discord.js";

export interface ButtonHandler {
  customId: string;
  execute(interaction: ButtonInteraction): Promise<void>;
}
