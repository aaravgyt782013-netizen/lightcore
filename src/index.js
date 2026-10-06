import 'dotenv/config';
import http from 'node:http';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { handle, CATALOG, handleHelpInteraction } from './commands.js';
import { runAutoResponder, runAutoReactor } from './auto.js';
import { hasNoPrefix } from './premium.js';

const token = process.env.DISCORD_TOKEN;
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';
const prefix = process.env.PREFIX || '.';

if (!token) { console.error('DISCORD_TOKEN is missing.'); process.exit(1); }

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates],
  partials: [Partials.Channel, Partials.GuildMember, Partials.User]
});

client.once('ready', () => console.log('Lightcore 4.4.2 online as ' + client.user.tag));

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
  const options = {
    getUser: () => {
      const token = args[0];
      const id = token?.match(/^<@!?([0-9]+)>$/)?.[1] || token?.match(/^\d{17,20}$/)?.[0] || null;
      return id ? client.users.cache.get(id) || null : null;
    },
    getString: (_name, required = false) => {
      const value = args.join(' ').trim();
      if (required && !value) return null;
      return value || null;
    },
    getInteger: (_name, required = false) => {
      const n = Number(args[0]);
      if (required && !Number.isFinite(n)) return null;
      return Number.isFinite(n) ? n : null;
    },
    getBoolean: () => null, getRole: () => null, getChannel: () => null
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
  if (!commandName || !CATALOG.some(c => c.name === commandName)) return;
  try { await handle(createMessageInteraction(message, commandName, parts), client); }
  catch (error) { console.error('Prefix/no-prefix command error:', error); await message.reply('💥 Something went wrong while running that command.').catch(() => {}); }
});

const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, bot: 'Lightcore', version: '4.4.2', ready: client.isReady() }));
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