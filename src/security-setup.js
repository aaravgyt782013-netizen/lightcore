import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { setLogChannel } from './logs.js';

const CATEGORY_NAME = 'LC logs';

const LOG_CHANNELS = [
  'mod-logs','member-logs','message-logs','voice-logs','server-logs',
  'channel-logs','role-logs','automod-logs','antinuke-logs','ticket-logs','giveaway-logs'
];

export function getSecurityChannelNames(){ return LOG_CHANNELS; }
export function getLogCategoryName(){ return CATEGORY_NAME; }

export async function setupLogChannels(guild){
  const me=guild.members.me;
  if(!me?.permissions.has(PermissionFlagsBits.ManageChannels))
    return {message:'❌ I need Manage Channels to create the LC logs category and channels.'};

  let category=guild.channels.cache.find(c=>c.type===ChannelType.GuildCategory&&c.name===CATEGORY_NAME);
  if(!category) category=await guild.channels.create({
    name:CATEGORY_NAME,type:ChannelType.GuildCategory,
    permissionOverwrites:[
      {id:guild.roles.everyone.id,deny:[PermissionFlagsBits.ViewChannel]},
      {id:me.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.EmbedLinks,PermissionFlagsBits.ReadMessageHistory,PermissionFlagsBits.ManageChannels]}
    ],reason:'Lightcore private logging setup'
  }).catch(()=>null);
  if(!category)return {message:'❌ I could not create the LC logs category.'};

  const channels=[];
  for(const name of LOG_CHANNELS){
    let channel=guild.channels.cache.find(c=>c.type===ChannelType.GuildText&&c.name===name&&c.parentId===category.id);
    if(!channel) channel=await guild.channels.create({
      name,type:ChannelType.GuildText,parent:category.id,
      permissionOverwrites:[
        {id:guild.roles.everyone.id,deny:[PermissionFlagsBits.ViewChannel]},
        {id:me.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.EmbedLinks,PermissionFlagsBits.ReadMessageHistory]}
      ],reason:'Lightcore private logging setup'
    }).catch(()=>null);
    if(channel){
      channels.push(channel);
      await channel.permissionOverwrites.edit(guild.roles.everyone,{ViewChannel:false}).catch(()=>{});
      await channel.permissionOverwrites.edit(me.id,{ViewChannel:true,SendMessages:true,EmbedLinks:true,ReadMessageHistory:true}).catch(()=>{});
    }
  }

  await category.permissionOverwrites.edit(guild.roles.everyone,{ViewChannel:false}).catch(()=>{});
  await category.permissionOverwrites.edit(me.id,{ViewChannel:true,SendMessages:true,EmbedLinks:true,ReadMessageHistory:true}).catch(()=>{});

  // Always rebuild the routing map from the actual channels, including channels that already existed.
  const byName=Object.fromEntries(channels.map(c=>[c.name,c]));
  const routes={
    'mod-logs':['moderation','mod','ban','unban','kick','timeout','warn'],
    'member-logs':['member','member_add','member_remove','member_update'],
    'message-logs':['message','message_delete','message_update'],
    'voice-logs':['voice','voice_join','voice_leave','voice_move'],
    'server-logs':['server','guild_update'],
    'channel-logs':['channel','channel_create','channel_delete','channel_update'],
    'role-logs':['role','role_create','role_delete','role_update'],
    'automod-logs':['automod'],
    'antinuke-logs':['antinuke'],
    'ticket-logs':['ticket','tickets'],
    'giveaway-logs':['giveaway','giveaways']
  };
  for(const [name,events] of Object.entries(routes)){
    const channel=byName[name];
    if(channel) setLogChannel(guild.id,channel.id,events.join(','));
  }

  return {
    message:channels.length===LOG_CHANNELS.length?'✅ LC logs setup is complete.':'⚠️ LC logs was created, but some channels could not be created.',
    category,channels
  };
}

export async function setupSecurityChannels(guild){return setupLogChannels(guild);}