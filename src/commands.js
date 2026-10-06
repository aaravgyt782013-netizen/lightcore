import { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { playMusic, pauseMusic, resumeMusic, skipMusic, stopMusic, getQueue } from './music.js';
import { grantPremium, revokePremium, listPremium, premiumExpiry, grantNoPrefix, revokeNoPrefix, hasNoPrefix, isPremium } from './premium.js';

const CATALOG = [{"name":"ban","category":"moderation"},{"name":"unban","category":"moderation"},{"name":"kick","category":"moderation"},{"name":"timeout","category":"moderation"},{"name":"untimeout","category":"moderation"},{"name":"warn","category":"moderation"},{"name":"warnings","category":"moderation"},{"name":"clearwarnings","category":"moderation"},{"name":"purge","category":"moderation"},{"name":"slowmode","category":"moderation"},{"name":"lock","category":"moderation"},{"name":"unlock","category":"moderation"},{"name":"lockdown","category":"moderation"},{"name":"unlockdown","category":"moderation"},{"name":"nick","category":"moderation"},{"name":"deafen","category":"moderation"},{"name":"undeafen","category":"moderation"},{"name":"move","category":"moderation"},{"name":"softban","category":"moderation"},{"name":"massban","category":"moderation"},{"name":"history","category":"moderation"},{"name":"case","category":"moderation"},{"name":"cases","category":"moderation"},{"name":"reason","category":"moderation"},{"name":"mute","category":"moderation"},{"name":"unmute","category":"moderation"},{"name":"setup","category":"administration"},{"name":"config","category":"administration"},{"name":"configview","category":"administration"},{"name":"prefix","category":"administration"},{"name":"autorole","category":"administration"},{"name":"autoroleoff","category":"administration"},{"name":"welcome","category":"administration"},{"name":"welcomeoff","category":"administration"},{"name":"goodbye","category":"administration"},{"name":"verification","category":"administration"},{"name":"verificationoff","category":"administration"},{"name":"rules","category":"administration"},{"name":"announce","category":"administration"},{"name":"embed","category":"administration"},{"name":"say","category":"administration"},{"name":"poll","category":"administration"},{"name":"reactionrole","category":"administration"},{"name":"role","category":"administration"},{"name":"rolecreate","category":"administration"},{"name":"roledelete","category":"administration"},{"name":"roleadd","category":"administration"},{"name":"roleremove","category":"administration"},{"name":"roleinfo","category":"administration"},{"name":"channel","category":"administration"},{"name":"channelcreate","category":"administration"},{"name":"channeldelete","category":"administration"},{"name":"channeledit","category":"administration"},{"name":"categorydelete","category":"administration"},{"name":"permissions","category":"administration"},{"name":"servericon","category":"administration"},{"name":"serverbanner","category":"administration"},{"name":"servername","category":"administration"},{"name":"servername-reset","category":"administration"},{"name":"automod","category":"automod"},{"name":"automodstatus","category":"automod"},{"name":"antispam","category":"automod"},{"name":"antiinvite","category":"automod"},{"name":"antilink","category":"automod"},{"name":"anticaps","category":"automod"},{"name":"antimention","category":"automod"},{"name":"antiraid","category":"automod"},{"name":"antibot","category":"automod"},{"name":"antiscam","category":"automod"},{"name":"filter","category":"automod"},{"name":"filteradd","category":"automod"},{"name":"filterremove","category":"automod"},{"name":"filterlist","category":"automod"},{"name":"badwords","category":"automod"},{"name":"badwordadd","category":"automod"},{"name":"badwordremove","category":"automod"},{"name":"whitelist","category":"automod"},{"name":"whitelistadd","category":"automod"},{"name":"whitelistremove","category":"automod"},{"name":"quarantine","category":"automod"},{"name":"unquarantine","category":"automod"},{"name":"raidmode","category":"automod"},{"name":"raidmodeoff","category":"automod"},{"name":"verify","category":"automod"},{"name":"verificationlog","category":"automod"},{"name":"security","category":"security"},{"name":"securitystatus","category":"security"},{"name":"antinuke","category":"security"},{"name":"antinukeoff","category":"security"},{"name":"antialt","category":"security"},{"name":"antialtoff","category":"security"},{"name":"accountage","category":"security"},{"name":"joinscan","category":"security"},{"name":"leavescan","category":"security"},{"name":"audit","category":"security"},{"name":"auditlog","category":"security"},{"name":"rolelock","category":"security"},{"name":"channellock","category":"security"},{"name":"backupinfo","category":"security"},{"name":"emergency","category":"security"},{"name":"emergencyoff","category":"security"},{"name":"panic","category":"security"},{"name":"panicoff","category":"security"},{"name":"trust","category":"security"},{"name":"untrust","category":"security"},{"name":"help","category":"utility"},{"name":"ping","category":"utility"},{"name":"uptime","category":"utility"},{"name":"botinfo","category":"utility"},{"name":"invite","category":"utility"},{"name":"support","category":"utility"},{"name":"avatar","category":"utility"},{"name":"banner","category":"utility"},{"name":"userinfo","category":"utility"},{"name":"serverinfo","category":"utility"},{"name":"membercount","category":"utility"},{"name":"roles","category":"utility"},{"name":"channels","category":"utility"},{"name":"emojis","category":"utility"},{"name":"stickers","category":"utility"},{"name":"id","category":"utility"},{"name":"snowflake","category":"utility"},{"name":"timestamp","category":"utility"},{"name":"remind","category":"utility"},{"name":"reminders","category":"utility"},{"name":"timer","category":"utility"},{"name":"translate","category":"utility"},{"name":"calculator","category":"utility"},{"name":"choose","category":"utility"},{"name":"pollresults","category":"utility"},{"name":"embedpreview","category":"utility"},{"name":"afk","category":"utility"},{"name":"afkoff","category":"utility"},{"name":"whois","category":"utility"},{"name":"search","category":"utility"},{"name":"topic","category":"utility"},{"name":"suggest","category":"utility"},{"name":"report","category":"utility"},{"name":"feedback","category":"utility"},{"name":"stats","category":"utility"},{"name":"ticket","category":"tickets"},{"name":"ticketclose","category":"tickets"},{"name":"ticketopen","category":"tickets"},{"name":"ticketadd","category":"tickets"},{"name":"ticketremove","category":"tickets"},{"name":"ticketclaim","category":"tickets"},{"name":"ticketunclaim","category":"tickets"},{"name":"ticketrename","category":"tickets"},{"name":"tickettranscript","category":"tickets"},{"name":"ticketpanel","category":"tickets"},{"name":"ticketsetup","category":"tickets"},{"name":"ticketsettings","category":"tickets"},{"name":"ticketblacklist","category":"tickets"},{"name":"ticketwhitelist","category":"tickets"},{"name":"ticketpriority","category":"tickets"},{"name":"ticketlock","category":"tickets"},{"name":"ticketunlock","category":"tickets"},{"name":"ticketstatus","category":"tickets"},{"name":"ticketstats","category":"tickets"},{"name":"ticketdelete","category":"tickets"},{"name":"giveaway","category":"giveaways"},{"name":"giveawayend","category":"giveaways"},{"name":"giveawayreroll","category":"giveaways"},{"name":"giveawaypause","category":"giveaways"},{"name":"giveawayresume","category":"giveaways"},{"name":"giveawaylist","category":"giveaways"},{"name":"giveawayinfo","category":"giveaways"},{"name":"giveawaycancel","category":"giveaways"},{"name":"giveawayedit","category":"giveaways"},{"name":"giveawaywinners","category":"giveaways"},{"name":"giveawayenter","category":"giveaways"},{"name":"giveawayleave","category":"giveaways"},{"name":"giveawayrequirements","category":"giveaways"},{"name":"giveawayrole","category":"giveaways"},{"name":"giveawaychannel","category":"giveaways"},{"name":"balance","category":"economy"},{"name":"daily","category":"economy"},{"name":"weekly","category":"economy"},{"name":"work","category":"economy"},{"name":"crime","category":"economy"},{"name":"rob","category":"economy"},{"name":"deposit","category":"economy"},{"name":"withdraw","category":"economy"},{"name":"pay","category":"economy"},{"name":"give","category":"economy"},{"name":"bank","category":"economy"},{"name":"beg","category":"economy"},{"name":"dice","category":"economy"},{"name":"leaderboard","category":"economy"},{"name":"richest","category":"economy"},{"name":"shop","category":"economy"},{"name":"buy","category":"economy"},{"name":"sell","category":"economy"},{"name":"inventory","category":"economy"},{"name":"item","category":"economy"},{"name":"items","category":"economy"},{"name":"use","category":"economy"},{"name":"trade","category":"economy"},{"name":"trades","category":"economy"},{"name":"gift","category":"economy"},{"name":"economy","category":"economy"},{"name":"economyreset","category":"economy"},{"name":"economystats","category":"economy"},{"name":"claim","category":"economy"},{"name":"depositall","category":"economy"},{"name":"withdrawall","category":"economy"},{"name":"rank","category":"levels"},{"name":"level","category":"levels"},{"name":"levels","category":"levels"},{"name":"xp","category":"levels"},{"name":"xpset","category":"levels"},{"name":"xpgive","category":"levels"},{"name":"xptake","category":"levels"},{"name":"levelset","category":"levels"},{"name":"levelgive","category":"levels"},{"name":"leveltake","category":"levels"},{"name":"leaderboardxp","category":"levels"},{"name":"levelroles","category":"levels"},{"name":"levelroleadd","category":"levels"},{"name":"levelroleremove","category":"levels"},{"name":"levelsettings","category":"levels"},{"name":"levelreset","category":"levels"},{"name":"prestige","category":"levels"},{"name":"prestigeset","category":"levels"},{"name":"prestigeleaderboard","category":"levels"},{"name":"8ball","category":"fun"},{"name":"coin","category":"fun"},{"name":"roll","category":"fun"},{"name":"rate","category":"fun"},{"name":"ship","category":"fun"},{"name":"love","category":"fun"},{"name":"roast","category":"fun"},{"name":"compliment","category":"fun"},{"name":"insult","category":"fun"},{"name":"joke","category":"fun"},{"name":"meme","category":"fun"},{"name":"quote","category":"fun"},{"name":"fact","category":"fun"},{"name":"truth","category":"fun"},{"name":"dare","category":"fun"},{"name":"wouldyourather","category":"fun"},{"name":"neverhaveiever","category":"fun"},{"name":"rps","category":"fun"},{"name":"reverse","category":"fun"},{"name":"mock","category":"fun"},{"name":"ascii","category":"fun"},{"name":"clap","category":"fun"},{"name":"highfive","category":"fun"},{"name":"hug","category":"fun"},{"name":"kiss","category":"fun"},{"name":"slap","category":"fun"},{"name":"pat","category":"fun"},{"name":"bonk","category":"fun"},{"name":"dance","category":"fun"},{"name":"cry","category":"fun"},{"name":"laugh","category":"fun"},{"name":"wink","category":"fun"},{"name":"poke","category":"fun"},{"name":"cuddle","category":"fun"},{"name":"nom","category":"fun"},{"name":"yeet","category":"fun"},{"name":"vibe","category":"fun"},{"name":"fortune","category":"fun"},{"name":"trivia","category":"games"},{"name":"triviascore","category":"games"},{"name":"trivialeaderboard","category":"games"},{"name":"connect4","category":"games"},{"name":"tictactoe","category":"games"},{"name":"hangman","category":"games"},{"name":"wordle","category":"games"},{"name":"2048","category":"games"},{"name":"minesweeper","category":"games"},{"name":"snake","category":"games"},{"name":"memory","category":"games"},{"name":"higherlower","category":"games"},{"name":"guessnumber","category":"games"},{"name":"guessword","category":"games"},{"name":"anagram","category":"games"},{"name":"mathgame","category":"games"},{"name":"quiz","category":"games"},{"name":"duel","category":"games"},{"name":"battle","category":"games"},{"name":"rpg","category":"games"},{"name":"adventure","category":"games"},{"name":"dailyquest","category":"games"},{"name":"quests","category":"games"},{"name":"quest","category":"games"},{"name":"inventorygame","category":"games"},{"name":"craft","category":"games"},{"name":"craftlist","category":"games"},{"name":"fishing","category":"games"},{"name":"hunt","category":"games"},{"name":"mine","category":"games"},{"name":"farm","category":"games"},{"name":"play","category":"music"},{"name":"pause","category":"music"},{"name":"resume","category":"music"},{"name":"skip","category":"music"},{"name":"stop","category":"music"},{"name":"queue","category":"music"},{"name":"nowplaying","category":"music"},{"name":"volume","category":"music"},{"name":"shuffle","category":"music"},{"name":"loop","category":"music"},{"name":"lyrics","category":"music"},{"name":"seek","category":"music"},{"name":"join","category":"music"},{"name":"leave","category":"music"},{"name":"disconnect","category":"music"},{"name":"autoplay","category":"music"},{"name":"radio","category":"music"},{"name":"playlist","category":"music"},{"name":"playlists","category":"music"},{"name":"remove","category":"music"},{"name":"movequeue","category":"music"},{"name":"clearqueue","category":"music"},{"name":"bassboost","category":"music"},{"name":"nightcore","category":"music"},{"name":"filtermusic","category":"music"},{"name":"musicsettings","category":"music"},{"name":"musichelp","category":"music"},{"name":"logging","category":"logging"},{"name":"logstatus","category":"logging"},{"name":"logchannel","category":"logging"},{"name":"logchanneloff","category":"logging"},{"name":"modlogs","category":"logging"},{"name":"messagelogs","category":"logging"},{"name":"memberlogs","category":"logging"},{"name":"voicelogs","category":"logging"},{"name":"serverlogs","category":"logging"},{"name":"rolelogs","category":"logging"},{"name":"channellogs","category":"logging"},{"name":"commandlogs","category":"logging"},{"name":"auditlogs","category":"logging"},{"name":"logtest","category":"logging"},{"name":"logignore","category":"logging"},{"name":"logignoreadd","category":"logging"},{"name":"logignoreremove","category":"logging"},{"name":"welcometest","category":"welcome"},{"name":"welcomechannel","category":"welcome"},{"name":"welcomeimage","category":"welcome"},{"name":"welcomeembed","category":"welcome"},{"name":"welcomevariables","category":"welcome"},{"name":"welcomeautorole","category":"welcome"},{"name":"welcomemessage","category":"welcome"},{"name":"goodbyemessage","category":"welcome"},{"name":"goodbyetest","category":"welcome"},{"name":"goodbyechannel","category":"welcome"},{"name":"memberjoin","category":"welcome"},{"name":"memberleave","category":"welcome"},{"name":"image","category":"image"},{"name":"imageinfo","category":"image"},{"name":"imagequote","category":"image"},{"name":"imagecaption","category":"image"},{"name":"imagetranslate","category":"image"},{"name":"imagethumbnail","category":"image"},{"name":"imagesearch","category":"image"},{"name":"gif","category":"image"},{"name":"gifsearch","category":"image"},{"name":"sticker","category":"image"},{"name":"stickersearch","category":"image"},{"name":"memeimage","category":"image"},{"name":"demotivational","category":"image"},{"name":"wanted","category":"image"},{"name":"achievement","category":"image"},{"name":"triggered","category":"image"},{"name":"blur","category":"image"},{"name":"pixelate","category":"image"},{"name":"grayscale","category":"image"},{"name":"invert","category":"image"},{"name":"ai","category":"ai"},{"name":"ask","category":"ai"},{"name":"summarize","category":"ai"},{"name":"rewrite","category":"ai"},{"name":"explain","category":"ai"},{"name":"translateai","category":"ai"},{"name":"code","category":"ai"},{"name":"debug","category":"ai"},{"name":"ideas","category":"ai"},{"name":"chat","category":"ai"},{"name":"prompt","category":"ai"},{"name":"aigen","category":"ai"},{"name":"eval","category":"owner"},{"name":"reload","category":"owner"},{"name":"sync","category":"owner"},{"name":"syncguild","category":"owner"},{"name":"broadcast","category":"owner"},{"name":"status","category":"owner"},{"name":"maintenance","category":"owner"},{"name":"maintenanceoff","category":"owner"},{"name":"shutdown","category":"owner"},{"name":"restart","category":"owner"},{"name":"setactivity","category":"owner"},{"name":"setstatus","category":"owner"},{"name":"ownerhelp","category":"owner"},{"name":"guilds","category":"owner"},{"name":"leaveguild","category":"owner"},{"name":"joininfo","category":"owner"},{"name":"health","category":"owner"},{"name":"version","category":"owner"},{"name":"permissionscheck","category":"owner"},{"name":"premium","category":"owner"},{"name":"noprefix","category":"owner"}];

const REGISTERED = [["help","utility"],["ping","utility"],["uptime","utility"],["botinfo","utility"],["serverinfo","utility"],["userinfo","utility"],["avatar","utility"],["membercount","utility"],["roles","utility"],["channels","utility"],["ban","moderation"],["kick","moderation"],["timeout","moderation"],["warn","moderation"],["purge","moderation"],["slowmode","moderation"],["lock","moderation"],["unlock","moderation"],["say","administration"],["announce","administration"],["choose","utility"],["coin","fun"],["dice","economy"],["roll","fun"],["8ball","fun"],["joke","fun"],["rate","fun"],["ship","fun"],["balance","economy"],["daily","economy"],["work","economy"],["beg","economy"],["shop","economy"],["inventory","economy"],["pay","economy"],["play","music"],["pause","music"],["resume","music"],["skip","music"],["stop","music"],["queue","music"],["nowplaying","music"],["ai","ai"],["ask","ai"],["code","ai"],["debug","ai"],["rewrite","ai"],["explain","ai"],["translateai","ai"],["remind","utility"],["timer","utility"],["afk","utility"],["invite","utility"],["support","utility"],["premium","owner"],["noprefix","owner"]];

const categoryEmoji = {
  moderation: '🛡️', administration: '⚙️', automod: '🤖', security: '🔐',
  utility: '🔧', tickets: '🎫', giveaways: '🎉', economy: '💰', levels: '📈',
  fun: '🎭', games: '🎮', music: '🎵', logging: '📋', welcome: '👋',
  image: '🖼️', ai: '🧠', owner: '👑'
};

const COMMAND_DESCRIPTIONS = {
  help: 'Show this interactive help menu',
  ping: 'Check the bot latency',
  uptime: 'Show how long the bot has been online',
  botinfo: 'Show information about Lightcore',
  serverinfo: 'Show information about this server',
  userinfo: 'Show information about a user',
  avatar: 'Show a user’s avatar',
  membercount: 'Show the server member count',
  roles: 'List the server roles',
  channels: 'List the server channels',
  ban: 'Ban a member from the server',
  unban: 'Unban a previously banned user',
  kick: 'Kick a member from the server',
  timeout: 'Temporarily timeout a member',
  warn: 'Warn a member',
  warnings: 'View a member’s warnings',
  purge: 'Delete multiple messages',
  slowmode: 'Set the channel slowmode',
  lock: 'Lock the current channel',
  unlock: 'Unlock the current channel',
  announce: 'Send an announcement message',
  say: 'Make Lightcore send a message',
  poll: 'Create a poll',
  ticket: 'Create or manage a support ticket',
  giveaway: 'Start a giveaway',
  balance: 'Check your economy balance',
  daily: 'Claim your daily reward',
  pay: 'Pay another user',
  shop: 'View the server shop',
  inventory: 'View your inventory',
  rank: 'View your level and rank',
  level: 'View your current level',
  leaderboard: 'View the economy leaderboard',
  '8ball': 'Ask the magic 8-ball a question',
  coin: 'Flip a coin',
  dice: 'Roll a dice',
  roll: 'Roll a random number',
  choose: 'Choose between multiple options',
  joke: 'Get a random joke',
  meme: 'Get a random meme',
  trivia: 'Play a trivia game',
  play: 'Play music in a voice channel',
  pause: 'Pause the current music',
  resume: 'Resume paused music',
  skip: 'Skip the current track',
  queue: 'Show the music queue',
  nowplaying: 'Show the currently playing track',
  ai: 'Ask Lightcore AI something',
  ask: 'Ask an AI question',
  remind: 'Create a reminder',
  timer: 'Start a timer',
  afk: 'Set your AFK status',
  automod: 'Configure automatic moderation',
  antinuke: 'Configure anti-nuke protection',
  security: 'View security settings',
  logging: 'Configure server logging',
  welcome: 'Configure welcome messages',
  invite: 'Create or view the bot invite',
  support: 'Get Lightcore support information',
  premium: '👑 Owner only — grant, revoke, check or list Premium',
  noprefix: '👑 Owner only — grant or revoke no-prefix access'
};

function commandDescription(name) {
  return COMMAND_DESCRIPTIONS[name] || `Use the ${name.replace(/-/g, ' ')} feature`;
}

function buildHelpPayload(selectedCategory = 'overview') {
  const groups = {};
  for (const item of REGISTERED) (groups[item.category] ||= []).push(item.name);

  const categoryNames = Object.keys(groups);
  const safeCategory = selectedCategory === 'overview' || groups[selectedCategory]
    ? selectedCategory
    : 'overview';

  const title = safeCategory === 'overview'
    ? '⚡ LIGHTCORE • HELP'
    : `${categoryEmoji[safeCategory] || '🔹'} LIGHTCORE • ${safeCategory.toUpperCase()}`;

  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(title)
    .setFooter({ text: `Lightcore • ${REGISTERED.length} registered slash commands` })
    .setTimestamp();

  if (safeCategory === 'overview') {
    embed.setDescription(
      'A powerful all-in-one Discord bot for moderation, utility, music, tickets, economy and more.\\n\\n' +
      '**Choose a category below** to browse the commands available in this launch build.'
    );
    for (const cat of categoryNames) {
      const names = groups[cat];
      embed.addFields({
        name: `${categoryEmoji[cat] || '🔹'} ${cat.charAt(0).toUpperCase() + cat.slice(1)} • ${names.length}`,
        value: names.slice(0, 12).map(name => '**/' + name + '**').join(' • ') + (names.length > 12 ? ' • …' : ''),
        inline: false
      });
    }
  } else {
    const names = groups[safeCategory] || [];
    embed.setDescription(
      names.length
        ? names.map(name => `• **/${name}** — ${commandDescription(name)}`).join('\\n')
        : 'No registered commands are available in this category.'
    );
  }

  const options = [
    { label: '🏠 Overview', value: 'overview', description: 'Show the main Lightcore help page' },
    ...categoryNames.slice(0, 24).map(cat => ({
      label: `${categoryEmoji[cat] || '🔹'} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`.slice(0, 100),
      value: cat,
      description: `${groups[cat].length} registered command${groups[cat].length === 1 ? '' : 's'}`.slice(0, 100)
    }))
  ];

  const select = new StringSelectMenuBuilder()
    .setCustomId('lightcore_help:category')
    .setPlaceholder('📚 Select a command category')
    .addOptions(options);

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('lightcore_help:home')
      .setLabel('Home')
      .setEmoji('🏠')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('lightcore_help:ping')
      .setLabel('Ping')
      .setEmoji('🏓')
      .setStyle(ButtonStyle.Primary)
  );

  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder().addComponents(select),
      buttons
    ]
  };
}

async function handleHelpInteraction(interaction, client) {
  if (!interaction.isStringSelectMenu() && !interaction.isButton()) return false;
  if (!interaction.customId.startsWith('lightcore_help:')) return false;

  if (interaction.customId === 'lightcore_help:ping') {
    await interaction.reply({ content: `🏓 Pong! **${client.ws.ping}ms**`, ephemeral: true });
    return true;
  }

  const category = interaction.isStringSelectMenu()
    ? interaction.values[0]
    : 'overview';

  await interaction.update(buildHelpPayload(category));
  return true;
}

function makeCommand(name, category) {
  const b = new SlashCommandBuilder()
    .setName(name)
    .setDescription(`${categoryEmoji[category] || '🔹'} ${name.replace(/-/g,' ')} command`);

  // Safe, commonly useful options. They are optional so generic catalog
  // commands can still work without extra configuration.
  if (['userinfo','avatar','ban','kick','timeout','warn','pay','give','ticketadd','ticketremove'].includes(name)) {
    b.addUserOption(o => o.setName('user').setDescription('Target user').setRequired(false));
  }
  if (name === 'play') {
    b.addStringOption(o => o.setName('song').setDescription('Song name or YouTube link').setRequired(true).setMaxLength(500));
  }
  if (['say','announce','reason','suggest','feedback','report','ai','ask','code','debug','translateai','rewrite','explain'].includes(name)) {
    b.addStringOption(o => o.setName('text').setDescription('Text').setRequired(true).setMaxLength(1900));
  }
  if (['purge','clear'].includes(name)) {
    b.addIntegerOption(o => o.setName('amount').setDescription('Number of messages').setRequired(true).setMinValue(1).setMaxValue(100));
  }
  if (['slowmode'].includes(name)) {
    b.addIntegerOption(o => o.setName('seconds').setDescription('Slowmode seconds').setRequired(true).setMinValue(0).setMaxValue(21600));
  }
  if (['premium','noprefix'].includes(name)) {
    b.addSubcommand(s => s.setName('grant').setDescription('Grant access').addUserOption(o => o.setName('user').setDescription('User').setRequired(true)).addIntegerOption(o => o.setName('days').setDescription('Days; omit for lifetime').setRequired(false).setMinValue(1).setMaxValue(36500)));
    b.addSubcommand(s => s.setName('revoke').setDescription('Revoke access').addUserOption(o => o.setName('user').setDescription('User').setRequired(true)));
    b.addSubcommand(s => s.setName('status').setDescription('Check access').addUserOption(o => o.setName('user').setDescription('User').setRequired(false)));
    if (name === 'premium') b.addSubcommand(s => s.setName('list').setDescription('List active premium grants'));
  }

  if (['remind','timer'].includes(name)) {
    b.addIntegerOption(o => o.setName('minutes').setDescription('Minutes').setRequired(true).setMinValue(1).setMaxValue(10080));
    b.addStringOption(o => o.setName('text').setDescription('Reminder text').setRequired(false).setMaxLength(500));
  }
  return b;
}

function isStaff(interaction) {
  return interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild) ||
         interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages);
}

function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor(s / 3600) % 24;
  const m = Math.floor(s / 60) % 60;
  const sec = s % 60;
  return `${d}d ${h}h ${m}m ${sec}s`;
}

async function handle(interaction, client) {
  const { commandName } = interaction;
  const user = interaction.options.getUser('user');
  const text = interaction.options.getString('text');
  const category = CATALOG.find(x => x.name === commandName)?.category || 'utility';

  if (commandName === 'help') {
    return interaction.reply(buildHelpPayload('overview'));
  }

  if (commandName === 'premium' || commandName === 'noprefix') {
    const ownerId = process.env.OWNER_USER_ID || '1244215702345482301';
    if (interaction.user.id !== ownerId) return interaction.reply({content:'❌ Owner only.', ephemeral:true});
    const sub = interaction.options.getSubcommand(false);
    const target = interaction.options.getUser('user') || interaction.user;
    const days = interaction.options.getInteger('days');
    const scope = 'user';

    if (commandName === 'premium' && sub === 'list') {
      const rows = listPremium();
      if (!rows.length) return interaction.reply('⭐ No premium grants are active.');
      const lines = rows.slice(0, 50).map(r => {
        const expiry = r.expires_at ? '<t:' + Math.floor(r.expires_at / 1000) + ':R>' : '**Lifetime**';
        return '• **' + r.scope + '** \\`' + r.scope_id + '\\` — ' + expiry;
      });
      return interaction.reply('⭐ **Premium grants**\\n' + lines.join('\n'));
    }

    if (sub === 'grant') {
      if (commandName === 'premium') grantPremium(scope, target.id, days);
      else grantNoPrefix(scope, target.id, days);
      const label = days ? 'for **' + days + ' day(s)**' : '**lifetime**';
      return interaction.reply('✅ ' + (commandName === 'premium' ? 'Premium' : 'No-prefix') + ' granted to ' + target + ' ' + label + '.');
    }

    if (sub === 'revoke') {
      if (commandName === 'premium') revokePremium(scope, target.id);
      else revokeNoPrefix(scope, target.id);
      return interaction.reply('✅ ' + (commandName === 'premium' ? 'Premium' : 'No-prefix') + ' revoked from ' + target + '.');
    }

    if (sub === 'status') {
      const premium = isPremium(target.id, interaction.guildId);
      const np = hasNoPrefix(target.id, interaction.guildId);
      const expiry = premiumExpiry(scope, target.id);
      return interaction.reply('⭐ **' + target.tag + '**\\nPremium: **' + (premium ? 'ACTIVE' : 'INACTIVE') + '**\\nNo-prefix: **' + (np ? 'ENABLED' : 'DISABLED') + '**\\nExpiry: ' + (expiry ? '<t:' + Math.floor(expiry / 1000) + ':F>' : premium ? '**Lifetime**' : '—'));
    }
  }

  if (commandName === 'catalog') {
    return interaction.reply(buildHelpPayload('overview'));
  }

  if (commandName === 'invite') {
    const clientId = client.user?.id;
    return interaction.reply({content: clientId ? '🔗 Invite Lightcore: <https://discord.com/oauth2/authorize?client_id=' + clientId + '&permissions=8&scope=bot%20applications.commands>' : 'Invite link unavailable.'});
  }

  if (commandName === 'support') {
    const url = process.env.SUPPORT_URL || 'https://discord.com';
    return interaction.reply('🛠️ **Lightcore Support**\\n' + url);
  }

  if (commandName === 'remind' || commandName === 'timer') {
    const minutes = interaction.options.getInteger('minutes', true);
    const reminderText = interaction.options.getString('text') || (commandName === 'timer' ? 'Timer finished!' : 'Reminder!');
    await interaction.reply('⏰ I\'ll remind you in **' + minutes + ' minute(s)**.');
    setTimeout(() => {
      interaction.followUp('🔔 <@' + interaction.user.id + '> ' + reminderText).catch(() => {});
    }, minutes * 60 * 1000);
    return;
  }

  if (commandName === 'afk') {
    return interaction.reply('💤 AFK mode enabled for **' + interaction.user.tag + '**.');
  }

  if (commandName === 'ping') {
    return interaction.reply(`🏓 Pong! **${client.ws.ping}ms**`);
  }

  if (commandName === 'uptime') {
    return interaction.reply(`⏱️ Uptime: **${formatUptime(client.uptime || 0)}**`);
  }

  if (commandName === 'botinfo') {
    return interaction.reply(`🤖 **Lightcore**\nServers: **${client.guilds.cache.size}**\nUsers cached: **${client.users.cache.size}**\nCommands registered: **${REGISTERED.length}**\nCatalog: **${CATALOG.length}**`);
  }

  if (commandName === 'serverinfo') {
    const g = interaction.guild;
    if (!g) return interaction.reply({content:'This command must be used in a server.', ephemeral:true});
    return interaction.reply(`🏠 **${g.name}**\nOwner: <@${g.ownerId}>\nMembers: **${g.memberCount}**\nChannels: **${g.channels.cache.size}**\nRoles: **${g.roles.cache.size}**`);
  }

  if (commandName === 'userinfo') {
    const u = user || interaction.user;
    return interaction.reply(`👤 **${u.tag}**\nID: \`${u.id}\`\nCreated: <t:${Math.floor(u.createdTimestamp/1000)}:F>`);
  }

  if (commandName === 'avatar') {
    const u = user || interaction.user;
    return interaction.reply(u.displayAvatarURL({size:1024, extension:'png'}));
  }

  if (commandName === 'membercount') {
    return interaction.reply(`👥 Members: **${interaction.guild?.memberCount ?? 0}**`);
  }

  if (commandName === 'roles') {
    if (!interaction.guild) return interaction.reply({content:'Server only.',ephemeral:true});
    const roles = interaction.guild.roles.cache.filter(r=>r.id!==interaction.guild.id).map(r=>r.name).slice(0,60);
    return interaction.reply(`🎭 Roles (${roles.length} shown):\n${roles.length ? roles.join(', ') : 'None'}`);
  }

  if (commandName === 'channels') {
    if (!interaction.guild) return interaction.reply({content:'Server only.',ephemeral:true});
    const chans = interaction.guild.channels.cache.map(c=>`#${c.name}`).slice(0,60);
    return interaction.reply(`📺 Channels (${chans.length} shown):\n${chans.join(', ') || 'None'}`);
  }

  // Real moderation actions.
  if (['ban','kick','timeout','warn'].includes(commandName)) {
    if (!interaction.guild) return interaction.reply({content:'Server only.',ephemeral:true});
    if (!isStaff(interaction)) return interaction.reply({content:'❌ You need Manage Messages or Manage Server.',ephemeral:true});
    if (!user) return interaction.reply({content:'Select a user.',ephemeral:true});
    const member = await interaction.guild.members.fetch(user.id).catch(()=>null);
    if (!member) return interaction.reply({content:'User is not in this server.',ephemeral:true});
    try {
      if (commandName==='ban') await member.ban({reason:`Lightcore /ban by ${interaction.user.tag}`});
      if (commandName==='kick') await member.kick(`Lightcore /kick by ${interaction.user.tag}`);
      if (commandName==='timeout') await member.timeout(10*60*1000, `Lightcore /timeout by ${interaction.user.tag}`);
      if (commandName==='warn') return interaction.reply(`⚠️ Warning recorded for ${user}. Configure MongoDB to persist warning history.`);
      return interaction.reply(`✅ ${commandName} completed for ${user}.`);
    } catch(e) {
      return interaction.reply({content:`❌ Discord rejected the action: ${e.message.slice(0,300)}`,ephemeral:true});
    }
  }

  if (commandName === 'purge') {
    if (!interaction.channel?.isTextBased()) return interaction.reply({content:'Text channel only.',ephemeral:true});
    if (!isStaff(interaction)) return interaction.reply({content:'❌ Manage Messages permission required.',ephemeral:true});
    const amount = interaction.options.getInteger('amount', true);
    if (!interaction.channel.bulkDelete) return interaction.reply({content:'This channel does not support bulk deletion.',ephemeral:true});
    const deleted = await interaction.channel.bulkDelete(amount, true).catch(()=>null);
    return interaction.reply({content:`🧹 Deleted **${deleted?.size || 0}** messages.`,ephemeral:true});
  }

  if (commandName === 'slowmode') {
    if (!interaction.channel?.setRateLimitPerUser) return interaction.reply({content:'Text channel only.',ephemeral:true});
    if (!isStaff(interaction)) return interaction.reply({content:'❌ Manage Channels permission required.',ephemeral:true});
    const seconds=interaction.options.getInteger('seconds',true);
    await interaction.channel.setRateLimitPerUser(seconds).catch(()=>null);
    return interaction.reply(`🐢 Slowmode set to **${seconds}s**.`);
  }

  if (commandName === 'lock' || commandName === 'unlock') {
    if (!interaction.channel?.permissionOverwrites) return interaction.reply({content:'Text channel only.',ephemeral:true});
    if (!isStaff(interaction)) return interaction.reply({content:'❌ Manage Channels permission required.',ephemeral:true});
    const deny = commandName === 'lock';
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {SendMessages: deny}).catch(()=>null);
    return interaction.reply(`${deny ? '🔒 Locked' : '🔓 Unlocked'} ${interaction.channel}.`);
  }

  if (commandName === 'say' || commandName === 'announce') {
    if (!isStaff(interaction)) return interaction.reply({content:'❌ Staff permission required.',ephemeral:true});
    return interaction.reply({content:text, allowedMentions:{parse:[]}});
  }

  if (commandName === 'choose') {
    const choices = text ? text.split(',').map(x=>x.trim()).filter(Boolean) : [];
    return interaction.reply(choices.length ? `🎯 I choose: **${choices[Math.floor(Math.random()*choices.length)]}**` : 'Use comma-separated choices.');
  }

  if (commandName === 'coin') return interaction.reply(Math.random()<0.5 ? '🪙 Heads!' : '🪙 Tails!');
  if (commandName === 'dice' || commandName === 'roll') return interaction.reply(`🎲 You rolled **${1+Math.floor(Math.random()*6)}**!`);
  if (commandName === '8ball') {
    const a=['Yes.','No.','Definitely.','Probably.','Ask again later.','Absolutely not.'];
    return interaction.reply(`🎱 ${a[Math.floor(Math.random()*a.length)]}`);
  }
  if (commandName === 'joke') return interaction.reply('😂 Why did the developer go broke? Because they used up all their cache.');
  if (commandName === 'rate') return interaction.reply(`⭐ Rating: **${Math.floor(Math.random()*101)}%**`);
  if (commandName === 'ship') return interaction.reply(`💖 Compatibility: **${Math.floor(Math.random()*101)}%**`);

  if (['balance','daily','work','beg','shop','inventory','pay'].includes(commandName)) {
    return interaction.reply(`💰 **${commandName}** is enabled in the Lightcore economy module. Persistent balances require \`MONGO_URI\` to be configured.`);
  }

  if (['play','pause','resume','skip','stop','queue','nowplaying'].includes(commandName)) {
    if (!interaction.guild) return interaction.reply({content:'Server only.',ephemeral:true});

    if (commandName === 'play') {
      const query = interaction.options.getString('song') || text;
      const voiceChannel = interaction.member?.voice?.channel;
      if (!voiceChannel) return interaction.reply({content:'🎵 Join a voice channel first.',ephemeral:true});
      if (!query) return interaction.reply({content:'🎵 Give me a song name or YouTube link.',ephemeral:true});
      await interaction.deferReply();
      try {
        const track = await playMusic({
          guild: interaction.guild,
          voiceChannel,
          textChannel: interaction.channel,
          query
        });
        return interaction.editReply(`🎶 Added **${track.title}** to the music queue.`);
      } catch (error) {
        console.error('[music] play command:', error);
        return interaction.editReply('❌ Music could not start. Check that I have **Connect** and **Speak** permissions in your voice channel.');
      }
    }

    if (commandName === 'pause') return interaction.reply(pauseMusic(interaction.guild.id) ? '⏸️ Music paused.' : '❌ Nothing is playing.');
    if (commandName === 'resume') return interaction.reply(resumeMusic(interaction.guild.id) ? '▶️ Music resumed.' : '❌ Nothing is paused.');
    if (commandName === 'skip') return interaction.reply(skipMusic(interaction.guild.id) ? '⏭️ Skipped.' : '❌ Nothing is playing.');
    if (commandName === 'stop') return interaction.reply(stopMusic(interaction.guild.id) ? '⏹️ Music stopped and queue cleared.' : '❌ Nothing is playing.');

    const state = getQueue(interaction.guild.id);
    if (commandName === 'nowplaying') {
      return interaction.reply(state.current ? `🎵 Now playing: **${state.current.title}** — ${state.current.author}` : '🎵 Nothing is playing.');
    }
    return interaction.reply(state.current || state.queue.length
      ? `🎶 Current: **${state.current?.title || 'Starting…'}**\\nQueued: **${state.queue.length}**`
      : '🎵 The music queue is empty.');
  }

  if (['ai','ask','code','debug','rewrite','explain','translateai'].includes(commandName)) {
    return interaction.reply(`🧠 AI command received${text ? `: **${text.slice(0,500)}**` : ''}\nConfigure an AI provider/API key on your host to enable generated responses.`);
  }

  if (['ban','kick','timeout','warn','purge','slowmode','lock','unlock'].includes(commandName)) return;

  return interaction.reply({content:`❌ /${commandName} is not enabled yet.`, ephemeral:true});
}

export { CATALOG, REGISTERED, makeCommand, handle, buildHelpPayload, handleHelpInteraction };