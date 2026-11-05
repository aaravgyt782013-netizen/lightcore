import type {
  ChatInputCommandInteraction,
  PermissionResolvable,
  SlashCommandBuilder
} from "discord.js";

export interface BotCommand {
  data: SlashCommandBuilder;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
  ownerOnly?: boolean;
  guildOnly?: boolean;
  requiredPermissions?: PermissionResolvable;
}
