import type { PrefixCommand } from "../../types/prefixCommand.js";
import { prefixHelpCommand } from "./help.js";
import { prefixPingCommand } from "./ping.js";
import { prefixSayCommand } from "./say.js";

export const prefixCommands: PrefixCommand[] = [
  prefixPingCommand,
  prefixHelpCommand,
  prefixSayCommand
];

export const prefixCommandMap = new Map<string, PrefixCommand>();

for (const command of prefixCommands) {
  for (const key of [command.name, ...(command.aliases ?? [])]) {
    if (prefixCommandMap.has(key)) {
      throw new Error(`Duplicate prefix command or alias: ${key}`);
    }
    prefixCommandMap.set(key, command);
  }
}
