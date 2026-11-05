import type { PrefixCommand } from "../../types/prefixCommand.js";

export const prefixPingCommand: PrefixCommand = {
  name: "ping",
  description: "Check gateway latency",

  async execute(message): Promise<void> {
    await message.reply({
      content: `🏓 **Light Code Pong!** Gateway: **${message.client.ws.ping} ms**`,
      allowedMentions: { repliedUser: false }
    });
  }
};
