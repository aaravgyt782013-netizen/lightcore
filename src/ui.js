import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags, SectionBuilder, ThumbnailBuilder, MediaGalleryBuilder } from 'discord.js';
import { getPremiumBranding, isPremium } from './premium.js';

export function cardPayload(payload, fallbackTitle='Lightcore', guildId=null) {
  if (payload && typeof payload === 'object' && payload.components && payload.flags !== undefined) return payload;
  const isObject = payload && typeof payload === 'object';
  const raw = isObject ? (payload.content ?? '') : String(payload ?? '');
  const title = isObject && payload.title ? String(payload.title) : fallbackTitle;
  const branding = guildId ? getPremiumBranding(guildId) : null;
  const premiumActive = guildId ? isPremium(null, guildId) : false;
  const usableBranding = premiumActive ? branding : null;
  const brandName = usableBranding?.name || 'Lightcore';
  const hasBranding = Boolean(usableBranding && (usableBranding.name || usableBranding.logo_url || usableBranding.banner_url || usableBranding.accent !== 5793266));
  const accent = hasBranding ? Number(usableBranding.accent || 5793266) : 0x5865F2;
  const box = new ContainerBuilder()
    .setAccentColor(accent)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent('## ⚡ '+brandName))
    .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent((title && title !== 'Lightcore' ? '**'+title+'**\\n' : '') + (raw || 'Done.')));
  if (usableBranding?.logo_url) {
    const section = new SectionBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent('**'+brandName+'** · Premium server branding'))
      .setThumbnailAccessory(new ThumbnailBuilder({ media: { url: usableBranding.logo_url } }));
    box.spliceComponents(0, 0, section);
  }
  if (usableBranding?.banner_url) box.addMediaGalleryComponents(new MediaGalleryBuilder({ items: [{ media: { url: usableBranding.banner_url }, description: brandName+' premium banner' }] }));
  const originalFlags = isObject && typeof payload.flags === 'number' ? payload.flags : 0;
  const flags = originalFlags | MessageFlags.IsComponentsV2 | (isObject && payload.ephemeral ? MessageFlags.Ephemeral : 0);
  return { components: [box], flags, allowedMentions: isObject?.allowedMentions || { parse: ['users', 'roles'] } };
}
export function styledReply(interaction,payload){return interaction.reply(cardPayload(payload,'Lightcore',interaction.guildId));}
export function styledFollowUp(interaction,payload){return interaction.followUp(cardPayload(payload,'Lightcore',interaction.guildId));}
export function styledEditReply(interaction,payload){return interaction.editReply(cardPayload(payload,'Lightcore',interaction.guildId));}
export function cardComponents(title,description,accent=0x5865F2){
  return [new ContainerBuilder().setAccentColor(accent)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent('## '+title))
    .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(String(description||'Done.')))];
}
export function cardMessage(title,description,accent=0x5865F2){
  return {components:cardComponents(title,description,accent),flags:MessageFlags.IsComponentsV2,allowedMentions:{parse:['users','roles']}};
}
