import type { Message } from "discord.js";
import { config } from "../config/env.js";

export async function handlePrefixMessage(message: Message): Promise<void> {
  if (message.author.bot || !message.guild || !message.content.startsWith(config.DEFAULT_PREFIX)) return;
  const [rawName, ...args] = message.content.slice(config.DEFAULT_PREFIX.length).trim().split(/\s+/);
  const name = rawName?.toLowerCase();
  if (!name) return;

  if (name === "ping") {
    await message.reply(`🏓 **Light Code Pong!** Gateway: **${message.client.ws.ping} ms**`);
    return;
  }
  if (name === "help") {
    await message.reply([
      "🟥 **Light Code — Prefix Help**",
      `Prefix: \x60${config.DEFAULT_PREFIX}\x60`,
      `• \x60${config.DEFAULT_PREFIX}ping\x60 — check bot latency`,
      `• \x60${config.DEFAULT_PREFIX}help\x60 — show this help`,
      "",
      "More prefix commands will appear here as modules are implemented."
    ].join("\n"));
    return;
  }
  if (name === "say" && message.author.id === config.OWNER_ID) {
    const text = args.join(" ").slice(0, 1800);
    if (text && message.channel.isSendable()) await message.channel.send({ content: text, allowedMentions: { parse: [] } });
  }
}
