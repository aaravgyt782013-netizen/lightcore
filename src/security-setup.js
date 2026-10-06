import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { setLogChannel } from './logs.js';

const CATEGORY_NAME = 'LC logs';

const LOG_CHANNELS = [
  'mod-logs',
  'member-logs',
  'message-logs',
  'voice-logs',
  'server-logs',
  'channel-logs',
  'role-logs',
  'automod-logs',
  'antinuke-logs',
  'ticket-logs',
  'giveaway-logs'
];

export function getSecurityChannelNames() {
  return LOG_CHANNELS;
}

export function getLogCategoryName() {
  return CATEGORY_NAME;
}

export async function setupLogChannels(guild) {
  const me = guild.members.me;
  if (!me?.permissions.has(PermissionFlagsBits.ManageChannels)) {
    return { message: '❌ I need Manage Channels to create the LC logs category and channels.' };
  }

  let category = guild.channels.cache.find(
    c => c.type === ChannelType.GuildCategory && c.name === CATEGORY_NAME
  );

  if (!category) {
    category = await guild.channels.create({
      name: CATEGORY_NAME,
      type: ChannelType.GuildCategory,
      reason: 'Lightcore automatic logging setup'
    }).catch(() => null);
  }

  if (!category) {
    return { message: '❌ I could not create the LC logs category.' };
  }

  const created = [];

  for (const name of LOG_CHANNELS) {
    let channel = guild.channels.cache.find(
      c => c.type === ChannelType.GuildText &&
        c.name === name &&
        c.parentId === category.id
    );

    if (!channel) {
      channel = await guild.channels.create({
        name,
        type: ChannelType.GuildText,
        parent: category.id,
        reason: 'Lightcore automatic logging setup'
      }).catch(() => null);
    }

    if (channel) created.push(channel);
  }

  const mod = created.find(c => c.name === 'mod-logs');
  const automod = created.find(c => c.name === 'automod-logs');
  const antinuke = created.find(c => c.name === 'antinuke-logs');
  const ticket = created.find(c => c.name === 'ticket-logs');

  if (mod) setLogChannel(guild.id, mod.id, 'moderation');
  if (automod) setLogChannel(guild.id, automod.id, 'automod');
  if (antinuke) setLogChannel(guild.id, antinuke.id, 'antinuke');
  if (ticket) setLogChannel(guild.id, ticket.id, 'tickets');

  const complete = created.length === LOG_CHANNELS.length;

  return {
    message: complete
      ? '✅ LC logs setup is complete.'
      : '⚠️ LC logs was created, but some channels could not be created.',
    category,
    channels: created
  };
}

export async function setupSecurityChannels(guild) {
  return setupLogChannels(guild);
}