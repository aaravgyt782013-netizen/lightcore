import { ChannelType, PermissionFlagsBits } from 'discord.js';

export const COUNTER_TYPES = {
  MEMBERS: 'members',
  HUMANS: 'humans',
  BOTS: 'bots',
  CHANNELS: 'channels',
  ROLES: 'roles',
  BOOSTS: 'boosts',
  VOICE: 'voice'
};

export async function updateServerCounters(guild, config = {}) {
  const counters = [
    ['members', guild.memberCount],
    ['humans', guild.members.cache.filter(m => !m.user.bot).size],
    ['bots', guild.members.cache.filter(m => m.user.bot).size],
    ['channels', guild.channels.cache.size],
    ['roles', guild.roles.cache.size - 1],
    ['boosts', guild.premiumSubscriptionCount ?? 0],
    ['voice', guild.members.cache.filter(m => m.voice.channelId).size]
  ];

  for (const [type, value] of counters) {
    const template = config[type];
    if (!template) continue;
    const name = String(template).replaceAll('{count}', String(value));
    let channel = guild.channels.cache.find(c => c.name === name && c.type === ChannelType.GuildVoice);
    if (!channel) {
      channel = await guild.channels.create({
        name,
        type: ChannelType.GuildVoice,
        permissionOverwrites: [{
          id: guild.roles.everyone.id,
          deny: [PermissionFlagsBits.Connect]
        }]
      }).catch(() => null);
    }
    if (channel && channel.name !== name) await channel.setName(name).catch(() => {});
  }
  return counters;
}
