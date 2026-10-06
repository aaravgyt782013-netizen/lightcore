import 'dotenv/config';
import http from 'node:http';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { handle, REGISTERED, handleHelpInteraction, handleTicketInteraction, commandUsagePayload } from './commands.js';
import { recordMessage, recordCommand, recordJoin, recordLeave, addVoiceSeconds } from './stats.js';
import { getLogConfig } from './logs.js';
import { runAutoResponder, runAutoReactor } from './auto.js';
import { hasNoPrefix } from './premium.js';
import { getWelcome } from './server-config.js';
import { cardMessage, styledReply } from './ui.js';
import { logModerationAction, logAntiNukeKick } from './modlogs.js';
import { AuditLogEvent, PermissionFlagsBits } from 'discord.js';
import { antiNukeCheck, isAntiNukeBypassed } from './antinuke.js';
import { getLevelConfig, addXP, getLevelRewards, replacePlaceholders } from './leveling.js';
import { dueGiveaways, endGiveaway, giveawayPayload, enterGiveaway } from './giveaways.js';

const token = process.env.DISCORD_TOKEN;
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';
const prefix = '.';
const supportUrl = 'https://discord.gg/Ehmqr5drSz';


if (!token) { console.error('DISCORD_TOKEN is missing.'); process.exit(1); }

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildModeration],
  partials: [Partials.Channel, Partials.GuildMember, Partials.User]
});

client.once('ready', () => { console.log('Lightcore 5.0.0 online as ' + client.user.tag); setInterval(processDueGiveaways,15000); });

function renderWelcome(template, member) {
  return String(template || 'Welcome {user} to **{server}**! 🎉')
    .replaceAll('{user}', '<@'+member.id+'>')
    .replaceAll('{username}', member.user.username)
    .replaceAll('{server}', member.guild.name)
    .replaceAll('{membercount}', String(member.guild.memberCount))
    .replaceAll('{id}', member.id);
}

async function enforceAntiNuke(guild, auditType, eventKey, targetId) {
  const logs=await guild.fetchAuditLogs({type:auditType,limit:5}).catch(()=>null);
  const entry=logs?.entries.find(e=>e.target?.id===targetId&&Date.now()-e.createdTimestamp<8000);
  if(!entry?.executorId||entry.executorId===client.user.id)return;
  if(entry.executorId===guild.ownerId||isAntiNukeBypassed(guild.id,entry.executorId))return;
  const result=antiNukeCheck(guild.id,entry.executorId,eventKey); if(!result.triggered)return;
  const member=await guild.members.fetch(entry.executorId).catch(()=>null); if(!member||member.id===guild.ownerId)return;
  try {
    if(result.config.action==='ban')await member.ban({deleteMessageSeconds:0,reason:'Lightcore Anti-Nuke: excessive '+eventKey+' actions'});
    else if(result.config.action==='kick'){
      const reason='Lightcore Anti-Nuke: excessive '+eventKey+' actions';
      let inviteUrl=null;
      const inviteChannel=guild.systemChannel||guild.channels.cache.find(c=>c.isTextBased?.()&&c.permissionsFor(guild.members.me)?.has(PermissionFlagsBits.CreateInstantInvite));
      if(inviteChannel?.createInvite) inviteUrl=(await inviteChannel.createInvite({maxAge:0,maxUses:0,unique:true,reason:'Anti-Nuke rejoin invite'}).catch(()=>null))?.url||null;
      const dm='You were kicked by Lightcore Anti-Nuke because your account triggered the server protection system.\\n\\nYou can join again using this invite: '+(inviteUrl||'The server administrator will provide a new invite.')+'\\n\\nIf this was a mistake, contact the server staff.';
      await member.send(dm).catch(()=>{});
      await member.kick(reason);
      await logAntiNukeKick(guild,member,entry.executorId,reason,inviteUrl);
    }
    else { for(const role of member.roles.cache.values()){ if(role.editable&&(role.permissions.has(PermissionFlagsBits.Administrator)||role.permissions.has(PermissionFlagsBits.ManageGuild)))await member.roles.remove(role,'Lightcore Anti-Nuke: excessive '+eventKey+' actions').catch(()=>{}); } }
    await sendConfiguredLog(guild,'Anti-Nuke Triggered','<@'+member.id+'> triggered '+eventKey+' protection after '+result.count+' actions. Response: '+result.config.action+'.');
  } catch(error){console.error('[antinuke] enforcement failed:',error);}
}
client.on('guildMemberAdd', async (member) => {
  recordJoin(member.guild.id, member.id);
  if (member.user.bot) {
    await new Promise(resolve => setTimeout(resolve, 700));
    const logs = await member.guild.fetchAuditLogs({ type: AuditLogEvent.BotAdd, limit: 5 }).catch(() => null);
    const entry = logs?.entries.find(e => e.target?.id === member.id && Date.now() - e.createdTimestamp < 8000);
    if (entry?.executorId) {
      const result = antiNukeCheck(member.guild.id, entry.executorId, 'bot_add');
      if (result.triggered && entry.executorId !== member.guild.ownerId && !isAntiNukeBypassed(member.guild.id, entry.executorId)) {
        const actor = await member.guild.members.fetch(entry.executorId).catch(() => null);
        if (actor) await actor.kick('Lightcore Anti-Nuke: unauthorized bot addition').catch(() => {});
      }
    }
    return;
  }
  const cfg = getWelcome(member.guild.id);
  if (!cfg.channelId) return;
  const channel = member.guild.channels.cache.get(cfg.channelId) || await member.guild.channels.fetch(cfg.channelId).catch(() => null);
  if (!channel?.isTextBased()) return;
  await channel.send(cardMessage('👋 Welcome', renderWelcome(cfg.message, member))).catch(() => {});
});

client.on('guildMemberRemove', member => { if(!member.user.bot) recordLeave(member.guild.id,member.id); });\nclient.on('guildAuditLogEntryCreate', async (entry, guild) => {\n  if(!entry?.executorId || entry.executorId===client.user.id) return;\n  const labels={[AuditLogEvent.MemberKick]:'Kick',[AuditLogEvent.MemberBanAdd]:'Ban',[AuditLogEvent.MemberBanRemove]:'Unban'};\n  const action=labels[entry.action]; if(!action) return;\n  await logModerationAction(guild,{action,staff:{id:entry.executorId},target:entry.target?.user||entry.target||null,reason:entry.reason||'No reason recorded',extra:'Discord audit log'});\n});\n

const levelCooldowns = new Map();

async function processLevelXP(message) {
  const cfg=getLevelConfig(message.guild.id);
  if(!cfg.enabled)return;
  const key=message.guild.id+':'+message.author.id;
  const now=Date.now();
  const last=levelCooldowns.get(key)||0;
  if(now-last<cfg.cooldown*1000)return;
  levelCooldowns.set(key,now);
  const amount=Math.floor(cfg.xp_min+Math.random()*(Math.max(cfg.xp_min,cfg.xp_max)-cfg.xp_min+1));
  const result=addXP(message.guild.id,message.author.id,amount);
  if(result.levelsGained<1)return;
  for(const reward of getLevelRewards(message.guild.id).filter(x=>x.level>result.before&&x.level<=result.level)){
    const role=message.guild.roles.cache.get(reward.role_id);
    if(role)await message.member.roles.add(role,'Lightcore level reward').catch(()=>{});
  }
  if(!cfg.levelup_enabled)return;
  const channel=cfg.levelup_channel_id?message.guild.channels.cache.get(cfg.levelup_channel_id):message.channel;
  if(channel?.isTextBased())await channel.send(cardMessage('⭐ Level Up',replacePlaceholders(cfg.levelup_message,message.member,result.level))).catch(()=>{});
}

async function processDueGiveaways(){
  for(const g of dueGiveaways()){
    const result=endGiveaway(g.id); if(!result)continue;
    result.winnersPicked=result.winnersPicked||[];
    const ch=client.channels.cache.get(g.channel_id);
    if(ch?.isTextBased()&&g.message_id)await ch.messages.fetch(g.message_id).then(m=>m.edit(giveawayPayload(result,true))).catch(()=>{});
  }
}

const voiceSessions = new Map();
client.on('voiceStateUpdate', (oldState,newState) => {
  const id=newState.member?.id||oldState.member?.id; const gid=newState.guild?.id||oldState.guild?.id; if(!id||!gid)return;
  const key=gid+':'+id;
  if(!oldState.channelId && newState.channelId) voiceSessions.set(key,Date.now());
  if(oldState.channelId && !newState.channelId){const started=voiceSessions.get(key);if(started)addVoiceSeconds(gid,id,(Date.now()-started)/1000);voiceSessions.delete(key);}
});

async function sendConfiguredLog(guild,event,text){const cfg=getLogConfig(guild.id);if(!cfg?.channel_id)return;const ch=guild.channels.cache.get(cfg.channel_id);if(ch?.isTextBased())await ch.send(cardMessage('📜 '+event,text)).catch(()=>{});}

client.on('channelCreate',ch=>{if(ch.guild)enforceAntiNuke(ch.guild,AuditLogEvent.ChannelCreate,'channel_create',ch.id);});
client.on('channelDelete',ch=>{if(ch.guild)enforceAntiNuke(ch.guild,AuditLogEvent.ChannelDelete,'channel_delete',ch.id);});
client.on('roleCreate',role=>enforceAntiNuke(role.guild,AuditLogEvent.RoleCreate,'role_create',role.id));
client.on('roleDelete',role=>enforceAntiNuke(role.guild,AuditLogEvent.RoleDelete,'role_delete',role.id));
client.on('guildBanAdd',ban=>enforceAntiNuke(ban.guild,AuditLogEvent.MemberBanAdd,'ban_create',ban.user.id));
client.on('guildDelete', async (guild) => {
  const support = process.env.SUPPORT_URL || supportUrl;
  let target = null;
  try { target = await client.users.fetch(guild.ownerId); } catch {}
  if (!target) {
    target = guild.members.cache.find(m => m.permissions?.has('Administrator') || m.permissions?.has('ManageGuild'))?.user || null;
  }
  if (!target) return;
  await target.send(cardMessage('⚠️ Lightcore Removed','Lightcore was removed from **'+guild.name+'**.\n\nPlease review the server setup or contact the Lightcore support server: '+support)).catch(() => {});
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton() && interaction.customId.startsWith('giveaway:enter:')) {
    const id=interaction.customId.split(':')[2];
    const result=enterGiveaway(id,interaction.user.id);
    if(!result.ok)return interaction.reply({content:result.reason==='already'?'You are already entered in this giveaway.':'This giveaway has ended.',ephemeral:true});
    return interaction.reply({content:'🎉 You entered the giveaway!',ephemeral:true});
  }
  if (interaction.isButton() || interaction.isStringSelectMenu()) {
    try {
      if (await handleHelpInteraction(interaction, client)) return;
      if (await handleTicketInteraction(interaction, client)) return;
    } catch (error) {
      console.error('Help component error:', error);
      if (!interaction.replied && !interaction.deferred) await styledReply(interaction,{content:'💥 Help menu error.', ephemeral:true}).catch(() => {});
    }
    return;
  }
  if (!interaction.isChatInputCommand()) return;
  try { await handle(interaction, client); }
  catch (error) {
    console.error('Command error:', error);
    const payload = commandUsagePayload(interaction.commandName, 'The command could not be completed. Check the usage and example below.');
    if (interaction.replied || interaction.deferred) await interaction.followUp(payload).catch(() => {});
    else await interaction.reply(payload).catch(() => {});
  }
});

function createMessageInteraction(message, commandName, args) {
  const tokens = [...args];
  const keyed = {};
  for (let x = 0; x < tokens.length; x++) {
    const m = tokens[x].match(/^([a-zA-Z][a-zA-Z0-9_-]*):(.+)$/);
    if (m) keyed[m[1].toLowerCase()] = m[2];
  }
  const positional = tokens.filter(x => !/^[a-zA-Z][a-zA-Z0-9_-]*:.+$/.test(x));
  const cleanMention = v => String(v||'').match(/^<@!?([0-9]+)>$/)?.[1] || String(v||'').match(/^<@&([0-9]+)>$/)?.[1] || String(v||'').match(/^<#([0-9]+)>$/)?.[1] || (String(v||'').match(/^\d{17,20}$/)?.[0] || null);
  const resolveUser = v => { const id=cleanMention(v); return id ? client.users.cache.get(id) || null : null; };
  const resolveMember = v => { const u=resolveUser(v); return u ? message.guild?.members.cache.get(u.id) || null : null; };
  const resolveRole = v => { const id=cleanMention(v); return id ? message.guild?.roles.cache.get(id) || null : null; };
  const resolveChannel = v => { const id=cleanMention(v); return id ? message.guild?.channels.cache.get(id) || null : null; };
  const getChannelArg = name => resolveChannel(keyed[name]) || message.guild?.channels.cache.get(message.channel.id) || null;
  const textValue = (name, fallback='') => {
    if (keyed[name] != null) return keyed[name];
    if (name === 'reason') return positional.join(' ').trim() || fallback;
    if (['message','response','prize','song','text','question'].includes(name)) return positional.join(' ').trim() || fallback;
    return positional[0] ?? fallback;
  };
  const userValue = (name='user', index=0) => resolveUser(keyed[name]) || resolveUser(positional[index]);
  const intValue = (name='amount', index=0) => {
    const n=Number(keyed[name] ?? positional[index]);
    return Number.isFinite(n) ? n : null;
  };
  const options = {
    getSubcommand: () => (commandName === 'premium' || commandName === 'noprefix') ? (positional[0]?.toLowerCase() || null) : null,
    getUser: name => userValue(name || 'user', (commandName === 'premium' || commandName === 'noprefix') ? 1 : 0),
    getMember: name => resolveMember(keyed[name || 'user']) || resolveMember(positional[0]),
    getString: (name, required=false) => {
      let value;
      if (commandName === 'premium' || commandName === 'noprefix') value = keyed[name] ?? (name === 'days' ? positional[2] : positional.slice(1).join(' '));
      else if (commandName === 'antinukeconfig') value = keyed[name] ?? (name === 'action' ? positional[0] : positional[1]);
      else if (commandName === 'antinukebypass' || commandName === 'antinukewhitelist') value = keyed[name] ?? (name === 'action' ? positional[1] : positional[0]);
      else value = textValue(name);
      if (required && !value) return null;
      return value || null;
    },
    getInteger: (name, required=false) => {
      const value = intValue(name, (commandName === 'premium' || commandName === 'noprefix') ? 2 : (commandName === 'giveawaycreate' ? (name === 'winners' ? 1 : 0) : (commandName === 'giveawayend' ? 0 : 0)));
      if (required && !Number.isFinite(value)) return null;
      return value;
    },
    getBoolean: name => ['true','yes','on','1'].includes(String(keyed[name]||positional[0]||'').toLowerCase()),
    getRole: name => resolveRole(keyed[name || 'role']) || resolveRole(positional[1]) || resolveRole(positional[0]),
    getChannel: name => getChannelArg(name || 'channel')
  };
  return {
    isChatInputCommand: () => true, commandName, user: message.author, member: message.member,
    memberPermissions: message.member?.permissions, guild: message.guild, channel: message.channel, client, options,
    reply: async payload => message.reply(payload), followUp: async payload => message.reply(payload),
    replied: false, deferred: false
  };
}

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;
  recordMessage(message.guild.id,message.author.id);
  await processLevelXP(message);
  await Promise.allSettled([runAutoResponder(message), runAutoReactor(message)]);
  const raw = message.content.trim();
  if (!raw) return;
  const explicitPrefix = raw.startsWith(prefix);
  const noPrefixAllowed = hasNoPrefix(message.author.id, message.guildId);
  if (!explicitPrefix && !noPrefixAllowed) return;
  const commandText = explicitPrefix ? raw.slice(prefix.length).trim() : raw;
  const parts = commandText.split(/\s+/);
  const commandName = parts.shift()?.toLowerCase();
  if (!commandName || !REGISTERED.some(c => c.name === commandName)) return;
  try { recordCommand(message.guild.id,message.author.id); await handle(createMessageInteraction(message, commandName, parts), client); }
  catch (error) { console.error('Prefix/no-prefix command error:', error); await message.reply(commandUsagePayload(commandName, 'The command could not be completed. Check the usage and example below.')).catch(() => {}); }
});

const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, bot: 'Lightcore', version: '5.0.0', ready: client.isReady() }));
    return;
  }
  res.writeHead(404); res.end('Not Found');
});

server.listen(port, host, () => {
  console.log('Web service listening on ' + host + ':' + port);
  import('node:child_process').then(({ spawn }) => {
    const child = spawn(process.execPath, ['src/deploy-commands.js'], { stdio: 'inherit' });
    child.on('error', error => console.error('Command sync process error:', error));
    child.on('exit', code => console.log('Command sync process exited with code:', code));
  });
});

client.login(token).catch((error) => { console.error('Discord login failed:', error); process.exit(1); });