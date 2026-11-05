import type { PrefixCommand } from "../../types/prefixCommand.js";

export const prefixSayCommand: PrefixCommand = {
  name: "say",
  description: "Send a message as Light Code",
  ownerOnly: true,

  async execute(message, args): Promise<void> {
    const content = args.join(" ").trim().slice(0, 1800);
    if (!content || !message.channel.isSendable()) {
      await message.reply({
        content: "Usage: `say <text>`",
        allowedMentions: { repliedUser: false }
      });
      return;
    }

    await message.channel.send({
      content,
      allowedMentions: { parse: [] }
    });
  }
};
