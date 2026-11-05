import type { BotCommand } from "../types/command.js";
import { helpCommand } from "./help.js";
import { panelCommand } from "./panel.js";
import { pingCommand } from "./ping.js";

export const commands: BotCommand[] = [pingCommand, helpCommand, panelCommand];

export const commandMap = new Map(
  commands.map((command) => [command.data.name, command])
);
