import type { PermissionResolvable } from "discord.js";

export interface AccessControlledCommand {
  ownerOnly?: boolean;
  guildOnly?: boolean;
  requiredPermissions?: PermissionResolvable;
}

export interface PermissionChecker {
  has(permission: PermissionResolvable): boolean;
}

export interface CommandAccessContext {
  userId: string;
  guildId: string | null;
  memberPermissions: PermissionChecker | null;
}

export type PermissionDenialReason = "owner_only" | "guild_only" | "missing_permissions";

export type CommandAccessResult =
  | { allowed: true }
  | { allowed: false; reason: PermissionDenialReason };

export function checkCommandAccess(
  command: AccessControlledCommand,
  context: CommandAccessContext,
  ownerId: string
): CommandAccessResult {
  if (command.ownerOnly && context.userId !== ownerId) {
    return { allowed: false, reason: "owner_only" };
  }

  if (command.guildOnly && !context.guildId) {
    return { allowed: false, reason: "guild_only" };
  }

  if (
    command.requiredPermissions &&
    !context.memberPermissions?.has(command.requiredPermissions)
  ) {
    return { allowed: false, reason: "missing_permissions" };
  }

  return { allowed: true };
}
