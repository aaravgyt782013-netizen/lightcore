import type { Message, PermissionResolvable } from "discord.js";

export interface PrefixCommand {
  name: string;
  description: string;
  aliases?: readonly string[];
  ownerOnly?: boolean;
  guildOnly?: boolean;
  requiredPermissions?: PermissionResolvable;
  execute(message: Message, args: string[]): Promise<void>;
}
