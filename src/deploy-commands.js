import 'dotenv/config';
import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import { REGISTERED, makeCommand } from './commands.js';

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token || !clientId) {
  console.error('DISCORD_TOKEN and CLIENT_ID are required to deploy commands.');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);
const body = REGISTERED.map(({ name, category }) => makeCommand(name, category).toJSON());

try {
  console.log('Replacing Lightcore application commands from repository...');
  console.log('Current slash command set:', body.length);

  // Global overwrite removes every old global command that is not in this repository set.
  await rest.put(Routes.applicationCommands(clientId), { body });
  console.log('Global slash commands synchronized.');

  // Global commands are the single source of truth.
  // Clear guild-scoped commands so old guild registrations cannot appear as duplicates.
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  await client.login(token);
  await new Promise(resolve => {
    if (client.isReady()) return resolve();
    client.once('ready', resolve);
  });

  const guilds = [...client.guilds.cache.values()];
  console.log('Removing stale guild-scoped slash commands:', guilds.length);

  for (const guild of guilds) {
    await rest.put(Routes.applicationGuildCommands(clientId, guild.id), { body: [] });
    console.log('Cleared guild commands:', guild.name, guild.id);
  }

  await client.destroy();
  console.log('Lightcore command synchronization completed successfully.');
} catch (error) {
  console.error('Command synchronization failed:', error);
  process.exit(1);
}