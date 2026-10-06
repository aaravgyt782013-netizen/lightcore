import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { setLogChannel } from './logs.js';
const NAMES=['lightcore-security-logs','lightcore-moderation-logs','lightcore-server-logs','lightcore-antinuke-actions'];
export function getSecurityChannelNames(){return NAMES;}
export async function setupSecurityChannels(guild){
 const me=guild.members.me;
 if(!me?.permissions.has(PermissionFlagsBits.ManageChannels)) return {message:'❌ I need Manage Channels to create the security channels.'};
 const created=[];
 for(const name of NAMES){
  let ch=guild.channels.cache.find(c=>c.type===ChannelType.GuildText&&c.name===name);
  if(!ch) ch=await guild.channels.create({name,type:ChannelType.GuildText,reason:'Lightcore security setup'}).catch(()=>null);
  if(ch) created.push(ch);
 }
 const mod=created.find(c=>c.name===NAMES[1]);
 if(mod) setLogChannel(guild.id,mod.id,'moderation');
 return {message:created.length===NAMES.length?'✅ Security setup is complete.':'⚠️ Security setup completed with some channels already existing or unavailable.',channels:created};
}