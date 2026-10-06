import 'dotenv/config';
import http from 'node:http';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { handle, REGISTERED, handleHelpInteraction } from './commands.js';
import { runAutoResponder, runAutoReactor } from './auto.js';
import { hasNoPrefix } from './premium.js';
import { getWelcome } from './server-config.js';

const token = process.env.DISCORD_TOKEN;
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';
const prefix = '.';
const supportUrl = 'https://discord.gg/Ehmqr5drSz';


if (!token) { console.error('DISCORD_TOKEN is missing.'); process.exit(1); }

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates],
  partials: [Partials.Channel, Partials.GuildMember, Partials.User]
});

client.once('ready', () => console.log('Lightcore 5.0.0 online as ' + client.user.tag));

function renderWelcome(template, member) {
  return String(template || 'Welcome {user} to **{server}**! 🎉')
    .replaceAll('{user}', '<@'+member.id+'>')
    .replaceAll('{username}', member.user.username)
    .replaceAll('{server}', member.guild.name)
    .replaceAll('{membercount}', String(member.guild.memberCount))
    .replaceAll('{id}', member.id);
}

client.on('guildMemberAdd', async (member) => {
  if (member.user.bot) return;
  const cfg = getWelcome(member.guild.id);
  if (!cfg.channelId) return;
  const channel = member.guild.channels.cache.get(cfg.channelId) || await member.guild.channels.fetch(cfg.channelId).catch(() => null);
  if (!channel?.isTextBased()) return;
  await channel.send(renderWelcome(cfg.message, member)).catch(() => {});
});

client.on('guildDelete', async (guild) => {
  const support = process.env.SUPPORT_URL || supportUrl;
  let target = null;
  try { target = await client.users.fetch(guild.ownerId); } catch {}
  if (!target) {
    target = guild.members.cache.find(m => m.permissions?.has('Administrator') || m.permissions?.has('ManageGuild'))?.user || null;
  }
  if (!target) return;
  await target.send('⚠️ **Lightcore was removed from '+guild.name+'**.\nIt looks like the bot was kicked or otherwise removed from this server. Please review the setup and contact us on the Lightcore support server: '+support).catch(() => {});
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton() || interaction.isStringSelectMenu()) {
    try {
      if (await handleHelpInteraction(interaction, client)) return;
    } catch (error) {
      console.error('Help component error:', error);
      if (!interaction.replied && !interaction.deferred) await interaction.reply({content:'💥 Help menu error.', ephemeral:true}).catch(() => {});
    }
    return;
  }
  if (!interaction.isChatInputCommand()) return;
  try { await handle(interaction, client); }
  catch (error) {
    console.error('Command error:', error);
    const payload = { content: '💥 Something went wrong while running that command.', ephemeral: true };
    if (interaction.replied || interaction.deferred) await interaction.followUp(payload).catch(() => {});
    else await interaction.reply(payload).catch(() => {});
  }
});

function createMessageInteraction(message, commandName, args) {
  const getChannelArg = () => {
    const token = args.find(x => /^<#\d{17,20}>$/.test(x)) || args.find(x => /^\d{17,20}$/.test(x));
    const id = token?.match(/^<#(\d+)>$/)?.[1] || token?.match(/^\d{17,20}$/)?.[0] || null;
    return id ? message.guild?.channels.cache.get(id) || null : null;
  };
  const welcomeChannel = commandName === 'welcome' ? getChannelArg() : null;
  const welcomeMessage = commandName === 'welcome'
    ? args.filter(x => !/^<#\d{17,20}>$/.test(x) && !/^\d{17,20}$/.test(x)).join(' ').trim()
    : null;
  const responderAction = commandName === 'autoresponder' ? args[0]?.toLowerCase() || null : null;
  const responderTrigger = commandName === 'autoresponder' ? args[1] || null : null;
  const responderResponse = commandName === 'autoresponder' ? args.slice(2).join(' ').trim() || null : null;

  const options = {
    getSubcommand: (_required = false) => {
      if (commandName === 'premium' || commandName === 'noprefix') return args[0]?.toLowerCase() || null;
      return null;
    },
    getUser: () => {
      const token = (commandName === 'premium' || commandName === 'noprefix') ? args[1] : args[0];
      const id = token?.match(/^<@!?([0-9]+)>$/)?.[1] || token?.match(/^\d{17,20}$/)?.[0] || null;
      return id ? client.users.cache.get(id) || null : null;
    },
    getString: (name, required = false) => {
      let value = null;
      if (commandName === 'premium' || commandName === 'noprefix') value = args.slice(1).join(' ').trim();
      else if (commandName === 'welcome' && name === 'message') value = welcomeMessage;
      else if (commandName === 'autoresponder' && name === 'action') value = responderAction;
      else if (commandName === 'autoresponder' && name === 'trigger') value = responderTrigger;
      else if (commandName === 'autoresponder' && name === 'response') value = responderResponse;
      else value = args.join(' ').trim();
      if (required && !value) return null;
      return value || null;
    },
    getInteger: (_name, required = false) => {
      const value = (commandName === 'premium' || commandName === 'noprefix') ? args[2] : args[0];
      const n = Number(value);
      if (required && !Number.isFinite(n)) return null;
      return Number.isFinite(n) ? n : null;
    },
    getBoolean: () => null,
    getRole: () => null,
    getChannel: (name) => name === 'channel' ? welcomeChannel : null
  };
  return {
    isChatInputCommand: () => true, commandName, user: message.author, member: message.member,
    memberPermissions: message.member?.permissions, guild: message.guild, channel: message.channel,
    client, options,
    reply: async (payload) => message.reply(typeof payload === 'string' ? payload : payload),
    followUp: async (payload) => message.reply(payload?.content || String(payload)),
    replied: false, deferred: false
  };
}

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;
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
  try { await handle(createMessageInteraction(message, commandName, parts), client); }
  catch (error) { console.error('Prefix/no-prefix command error:', error); await message.reply('💥 Something went wrong while running that command.').catch(() => {}); }
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