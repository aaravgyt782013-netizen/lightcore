import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { updateServerCounters } from '../utils/serverCounters.js';

export default {
  data: new SlashCommandBuilder()
    .setName('counters')
    .setDescription('Configure Statbot-style live server counters')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(s => s.setName('update').setDescription('Create/update configured counters'))
    .addSubcommand(s => s.setName('disable').setDescription('Disable counter updates')),
  async execute(interaction) {
    if (interaction.options.getSubcommand() === 'disable') {
      return interaction.reply({ content: 'Live counters can be disabled from the Lightcore setup panel.' });
    }
    const config = {
      members: 'Members: {count}',
      humans: 'Humans: {count}',
      bots: 'Bots: {count}',
      channels: 'Channels: {count}',
      roles: 'Roles: {count}',
      boosts: 'Boosts: {count}',
      voice: 'In Voice: {count}'
    };
    await updateServerCounters(interaction.guild, config);
    return interaction.reply({ content: '✅ Lightcore server counters updated.' });
  }
};
