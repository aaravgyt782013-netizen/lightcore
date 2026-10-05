import 'dotenv/config';
import http from 'node:http';
import { Client, GatewayIntentBits, Partials } from 'discord.js';

const token = process.env.DISCORD_TOKEN;
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';
const prefix = process.env.PREFIX || '.';

if (!token) {
  console.error('DISCORD_TOKEN is missing.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Channel, Partials.GuildMember, Partials.User]
});

client.once('ready', () => {
  console.log('Lightcore 4.4.1 online as ' + client.user.tag);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;
  if (!message.content.startsWith(prefix)) return;

  const [command] = message.content.slice(prefix.length).trim().split(/\s+/);
  if (command?.toLowerCase() === 'ping') {
    await message.reply('✨ Pong! ' + client.ws.ping + 'ms');
  }
});

const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({
      ok: true,
      bot: 'Lightcore',
      version: '4.4.1',
      ready: client.isReady()
    }));
    return;
  }
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(port, host, () => {
  console.log('Web service listening on ' + host + ':' + port);
});

client.login(token).catch((error) => {
  console.error('Discord login failed:', error);
  process.exit(1);
});
