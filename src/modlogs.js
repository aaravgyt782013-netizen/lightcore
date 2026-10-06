import { MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SectionBuilder, ThumbnailBuilder } from 'discord.js';
import { getLogConfig } from './logs.js';
function payload(title,text){
 const box=new ContainerBuilder().setAccentColor(0xED4245)
  .addTextDisplayComponents(new TextDisplayBuilder().setContent('## 🛡️ '+title))
  .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
  .addTextDisplayComponents(new TextDisplayBuilder().setContent(text));
 return {components:[box],flags:MessageFlags.IsComponentsV2,allowedMentions:{parse:[]}};
}
export async function logModerationAction(guild,{action,staff,target,reason='No reason provided',duration=null,extra=null}){
 const cfg=getLogConfig(guild.id);
 if(!cfg?.channel_id || (cfg.events!=='all'&&cfg.events!=='moderation')) return;
 const ch=guild.channels.cache.get(cfg.channel_id);
 if(!ch?.isTextBased()) return;
 const lines=['**Action:** '+action,'**Staff:** '+(staff?'<@'+staff.id+'>':'Unknown'),'**Target:** '+(target?'<@'+target.id+'>':'Unknown'),'**Reason:** '+String(reason).slice(0,900)];
 if(duration) lines.push('**Duration:** '+duration);
 if(extra) lines.push('**Details:** '+String(extra).slice(0,700));
 lines.push('**Time:** <t:'+Math.floor(Date.now()/1000)+':F>');
 await ch.send(payload('Moderation Log',lines.join('\\n'))).catch(()=>{});
}
export async function logAntiNukeKick(guild,member,actorId,reason,inviteUrl){
 const ch=guild.channels.cache.find(x=>x.isTextBased?.()&&x.name==='lightcore-antinuke-actions');
 if(!ch) return;
 const thumb=new ThumbnailBuilder({media:{url:member.user.displayAvatarURL({size:256,extension:'png'})}}).setDescription('Kicked member profile picture');
 const section=new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent('## 🚨 Anti-Nuke Member Kicked')).setThumbnailAccessory(thumb);
 const lines=['**Username:** '+member.user.tag,'**User ID:** `'+member.id+'`','**Join Date:** '+(member.joinedTimestamp?'<t:'+Math.floor(member.joinedTimestamp/1000)+':F>':'Unknown'),'**Reason:** '+String(reason).slice(0,700),'**Kicked By:** Lightcore Anti-Nuke','**Detected Actor:** <@'+actorId+'> (`'+actorId+'`)','**Invite:** '+(inviteUrl||'Unable to create an invite'),'**Time:** <t:'+Math.floor(Date.now()/1000)+':F>'];
 const box=new ContainerBuilder().setAccentColor(0xED4245).addSectionComponents(section).addSeparatorComponents(new SeparatorBuilder().setDivider(true)).addTextDisplayComponents(new TextDisplayBuilder().setContent(lines.join('\n')));
 await ch.send({components:[box],flags:MessageFlags.IsComponentsV2,allowedMentions:{parse:[]}}).catch(()=>{});
}
