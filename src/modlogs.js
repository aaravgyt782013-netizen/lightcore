import { MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder } from 'discord.js';
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