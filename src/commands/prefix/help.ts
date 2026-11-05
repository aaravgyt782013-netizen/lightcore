import type { PrefixCommand } from "../../types/prefixCommand.js";
import { config } from "../../config/env.js";

export const prefixHelpCommand: PrefixCommand = {
  name: "help",
  description: "Show available prefix commands",

  async execute(message): Promise<void> {
    await message.reply({
      content: [
        "🟥 **Light Code — Prefix Help**",
        `Prefix: \`${config.DEFAULT_PREFIX}\``,
        `• \`${config.DEFAULT_PREFIX}ping\` — check bot latency`,
        `• \`${config.DEFAULT_PREFIX}help\` — show this guide`,
        `• \`${config.DEFAULT_PREFIX}say <text>\` — owner-only announcement utility`
      ].join("\n"),
      allowedMentions: { repliedUser: false }
    });
  }
};
