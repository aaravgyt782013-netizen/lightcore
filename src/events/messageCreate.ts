import type { Message } from "discord.js";
import { prefixCommandMap } from "../commands/prefix/index.js";
import { config } from "../config/env.js";
import { checkCommandAccess, type PermissionDenialReason } from "../lib/permissions.js";
import { logger } from "../lib/logger.js";

const denialMessages: Record<PermissionDenialReason, string> = {
  owner_only: "🔒 This command is restricted to the bot owner.",
  guild_only: "This command can only be used inside a server.",
  missing_permissions: "You do not have the Discord permissions required for this command."
};

export async function handlePrefixMessage(message: Message): Promise<void> {
  if (message.author.bot || !message.guild || !message.content.startsWith(config.DEFAULT_PREFIX)) {
    return;
  }

  const input = message.content.slice(config.DEFAULT_PREFIX.length).trim();
  if (!input) return;

  const [rawName, ...args] = input.split(/\s+/);
  const name = rawName?.toLowerCase();
  if (!name) return;

  const command = prefixCommandMap.get(name);
  if (!command) return;

  const access = checkCommandAccess(
    command,
    {
      userId: message.author.id,
      guildId: message.guild.id,
      memberPermissions: message.member?.permissions ?? null
    },
    config.OWNER_ID
  );

  if (!access.allowed) {
    if (message.channel.isSendable()) {
      await message.reply({
        content: denialMessages[access.reason],
        allowedMentions: { repliedUser: false }
      });
    }
    return;
  }

  try {
    await command.execute(message, args);
  } catch (error) {
    logger.error(`Prefix command ${config.DEFAULT_PREFIX}${name} failed.`, error);
    if (message.channel.isSendable()) {
      await message.reply({
        content: "Something went wrong while running that command.",
        allowedMentions: { repliedUser: false }
      }).catch((replyError: unknown) => {
        logger.warn("Could not send a prefix command error reply.", replyError);
      });
    }
  }
}
