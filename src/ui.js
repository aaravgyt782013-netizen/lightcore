import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags } from 'discord.js';

export function cardPayload(payload, fallbackTitle='Lightcore') {
  if (payload && typeof payload === 'object' && payload.components && payload.flags !== undefined) return payload;
  const isObject = payload && typeof payload === 'object';
  const raw = isObject ? (payload.content ?? '') : String(payload ?? '');
  const title = isObject && payload.title ? String(payload.title) : fallbackTitle;
  const box = new ContainerBuilder()
    .setAccentColor(0x5865F2)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent('## ⚡ '+title))
    .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(raw || 'Done.'));
  const originalFlags = isObject && typeof payload.flags === 'number' ? payload.flags : 0;
  const flags = originalFlags | MessageFlags.IsComponentsV2 | (isObject && payload.ephemeral ? MessageFlags.Ephemeral : 0);
  return { components: [box], flags, allowedMentions: isObject?.allowedMentions || { parse: ['users', 'roles'] } };
}
export function styledReply(interaction,payload){return interaction.reply(cardPayload(payload));}
export function styledFollowUp(interaction,payload){return interaction.followUp(cardPayload(payload));}
export function styledEditReply(interaction,payload){return interaction.editReply(cardPayload(payload));}
export function cardComponents(title,description,accent=0x5865F2){
  return [new ContainerBuilder().setAccentColor(accent)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent('## '+title))
    .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(String(description||'Done.')))];
}
export function cardMessage(title,description,accent=0x5865F2){
  return {components:cardComponents(title,description,accent),flags:MessageFlags.IsComponentsV2,allowedMentions:{parse:['users','roles']}};
}
