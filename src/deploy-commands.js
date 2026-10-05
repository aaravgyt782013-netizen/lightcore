import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { REGISTERED, makeCommand } from './commands.js';

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const devGuildId = process.env.DEV_GUILD_ID || process.env.GUILD_ID || '';
if (!token || !clientId) { console.error('DISCORD_TOKEN and CLIENT_ID are required to deploy commands.'); process.exit(1); }

const rest = new REST({ version: '10' }).setToken(token);
const body = REGISTERED.map(({ name, category }) => makeCommand(name, category).toJSON());

try {
  console.log('Replacing Lightcore application commands from repository...');
  console.log('Current command set:', body.length);
  await rest.put(Routes.applicationCommands(clientId), { body });
  if (devGuildId) {
    await rest.put(Routes.applicationGuildCommands(clientId, devGuildId), { body });
    console.log('Synced development guild:', devGuildId);
  }
  console.log('Lightcore commands synchronized successfully.');
} catch (error) {
  console.error('Command synchronization failed:', error);
  process.exit(1);
}