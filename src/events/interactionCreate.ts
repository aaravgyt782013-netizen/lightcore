import {
  MessageFlags,
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  type Interaction
} from "discord.js";
import { commandMap } from "../commands/index.js";
import { buttonHandlerMap } from "../components/index.js";
import { config } from "../config/env.js";
import { checkCommandAccess, type PermissionDenialReason } from "../lib/permissions.js";
import { logger } from "../lib/logger.js";

const denialMessages: Record<PermissionDenialReason, string> = {
  owner_only: "🔒 This command is restricted to the bot owner.",
  guild_only: "This command can only be used inside a server.",
  missing_permissions: "You do not have the Discord permissions required for this command."
};

async function replySafely(
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  content: string
): Promise<void> {
  const payload = { content, flags: MessageFlags.Ephemeral as const };

  if (interaction.deferred || interaction.replied) {
    await interaction.followUp(payload).catch((error: unknown) => {
      logger.warn("Could not send an interaction follow-up.", error);
    });
    return;
  }

  await interaction.reply(payload).catch((error: unknown) => {
    logger.warn("Could not send an interaction reply.", error);
  });
}

async function handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
  const command = commandMap.get(interaction.commandName);
  if (!command) {
    await replySafely(interaction, "That command is not registered. Try /help.");
    return;
  }

  const access = checkCommandAccess(
    command,
    {
      userId: interaction.user.id,
      guildId: interaction.guildId,
      memberPermissions: interaction.memberPermissions
    },
    config.OWNER_ID
  );

  if (!access.allowed) {
    await replySafely(interaction, denialMessages[access.reason]);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(`Slash command /${interaction.commandName} failed.`, error);
    await replySafely(interaction, "Something went wrong while running this command.");
  }
}

async function handleButton(interaction: ButtonInteraction): Promise<void> {
  const handler = buttonHandlerMap.get(interaction.customId);
  if (!handler) {
    await replySafely(interaction, "This button is no longer available. Please run the command again.");
    return;
  }

  try {
    await handler.execute(interaction);
  } catch (error) {
    logger.error(`Button handler ${interaction.customId} failed.`, error);
    await replySafely(interaction, "That action could not be completed. Please try again.");
  }
}

export async function handleInteraction(interaction: Interaction): Promise<void> {
  if (interaction.isChatInputCommand()) {
    await handleCommand(interaction);
    return;
  }

  if (interaction.isButton()) {
    await handleButton(interaction);
  }
}
