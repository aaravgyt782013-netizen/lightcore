import type { BotCommand } from "../types/command.js";
import { helpCommand } from "./help.js";
import { pingCommand } from "./ping.js";

export const commands: BotCommand[] = [pingCommand, helpCommand];
export const commandMap = new Map(commands.map((command) => [command.data.name, command]));
