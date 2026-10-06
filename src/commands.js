
import {
  SlashCommandBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder,
  StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder,
  TextDisplayBuilder, SeparatorBuilder, MessageFlags, EmbedBuilder
} from 'discord.js';
import { styledReply, styledFollowUp, styledEditReply } from './ui.js';
import { playMusic, pauseMusic, resumeMusic, skipMusic, stopMusic, getQueue } from './music.js';
import { grantPremium, revokePremium, listPremium, premiumExpiry, grantNoPrefix, revokeNoPrefix, hasNoPrefix, isPremium, getPremiumBranding, setPremiumBranding, resetPremiumBranding } from './premium.js';
import { setWelcome, clearWelcome, getWelcome, setAutoresponder, removeAutoresponder, getAutoresponders } from './server-config.js';
import { getUserStats, getGuildStats, getTopStats, addCounter, removeCounter, listCounters } from './stats.js';
import { getAntiNukeStatus, configureAntiNuke, resetAntiNuke, changeAntiNukeBypass, antiNukeStatusText, antiNukeConfigText, antiNukeBypassText, antiNukeWhitelistText } from './antinuke.js';
import { setupLogChannels, getSecurityChannelNames, getLogCategoryName } from './security-setup.js';
import { logModerationAction } from './modlogs.js';
import { getLevelConfig, updateLevelConfig, levelProgress, addLevelReward, removeLevelReward } from './leveling.js';
import { createGiveaway, getGiveaway, endGiveaway, giveawayPayload, setGiveawayMessage } from './giveaways.js';
import { getTicketConfig, updateTicketConfig, addTicketCategory, removeTicketCategory, createTicketRecord, getTicketRecord, closeTicketRecord, claimTicket, listTicketRecords } from './tickets.js';

const ownerId = process.env.OWNER_ID || '1244215702345482301';
const state = {
  warnings: new Map(), afk: new Map(), balances: new Map(), xp: new Map(),
  settings: new Map(), tickets: new Map()
};

const definitions = [
  ['help','utility'],['premiuminfo','premium'],['premiumbrand','premium'],['serverhealth','premium'],['activityreport','premium'],['premiuminsights','premium'],['premiummember','premium'],['ping','utility'],['uptime','utility'],['botinfo','utility'],['serverinfo','utility'],
  ['userinfo','utility'],['avatar','utility'],['banner','utility'],['membercount','utility'],['roles','utility'],
  ['channels','utility'],['id','utility'],['timestamp','utility'],['choose','utility'],['remind','utility'],
  ['timer','utility'],['afk','utility'],['stats','utility'],['invite','utility'],['support','utility'],
  ['ban','moderation'],['unban','moderation'],['kick','moderation'],['timeout','moderation'],['untimeout','moderation'],
  ['warn','moderation'],['warnings','moderation'],['clearwarnings','moderation'],['purge','moderation'],
  ['slowmode','moderation'],['lock','moderation'],['unlock','moderation'],['nick','moderation'],
  ['announce','administration'],['say','administration'],['poll','administration'],['rolecreate','administration'],
  ['roledelete','administration'],['roleadd','administration'],['roleremove','administration'],
  ['channelcreate','administration'],['channeldelete','administration'],['categorydelete','administration'],['setup','administration'],
  ['automod','automod'],['antispam','automod'],['antilink','automod'],['filterword','automod'],
  ['logging','logging'],['welcome','welcome'],['goodbye','welcome'],['autoresponder','administration'],
  ['ticket','tickets'],['ticketclose','tickets'],['ticketadd','tickets'],['ticketremove','tickets'],['ticketpanel','tickets'],
  ['giveaway','giveaways'],['giveawayend','giveaways'],['giveawayreroll','giveaways'],
  ['balance','economy'],['daily','economy'],['work','economy'],['pay','economy'],['shop','economy'],['inventory','economy'],
  ['leaderboard','economy'],['rank','levels'],['level','levels'],['xpgive','levels'],['levelgive','levels'],['leaderboardxp','levels'],
  ['coin','fun'],['dice','fun'],['8ball','fun'],['joke','fun'],['rate','fun'],['ship','fun'],['rps','games'],['trivia','games'],
  ['play','music'],['pause','music'],['resume','music'],['skip','music'],['stop','music'],['queue','music'],['nowplaying','music'],
  ['premium','owner'],['noprefix','owner']
].map(([name,category]) => ({name,category}));

const expandedDefinitions = [["gay","fun"],["simp","fun"],["howhot","fun"],["logging2","logging"],["logsetup","logging"],["logsetupauto","logging"],["logsettings","logging"],["logchannel","logging"],["logevents","logging"],["logmod","logging"],["logmember","logging"],["logmessage","logging"],["logvoice","logging"],["logserver","logging"],["logrole","logging"],["logchannelcreate","logging"],["logchanneldelete","logging"],["logrolecreate","logging"],["logroledelete","logging"],["logban","logging"],["logunban","logging"],["logkick","logging"],["logtimeout","logging"],["logticket","logging"],["welcomeset","welcome"],["welcometest","welcome"],["welcomeoff","welcome"],["welcomeembed","welcome"],["welcomeautorole","welcome"],["welcomedm","welcome"],["welcomelog","welcome"],["welcomevariables","welcome"],["goodbyeset","welcome"],["goodbyetest","welcome"],["goodbyeoff","welcome"],["goodbyeembed","welcome"],["goodbyedm","welcome"],["goodbyelog","welcome"],["goodbyevariables","welcome"],["joinrole","welcome"],["leaveimage","welcome"],["welcomeimage","welcome"],["welcomebanner","welcome"],["welcomechannel","welcome"],["giveawaysetup","giveaways"],["giveawaycreate","giveaways"],["giveawaylist","giveaways"],["giveawaycancel","giveaways"],["giveawaypause","giveaways"],["giveawayresume","giveaways"],["giveawayparticipants","giveaways"],["giveawaysettings","giveaways"],["giveawayentries","giveaways"],["giveawayrerollall","giveaways"],["giveawayendall","giveaways"],["giveawayrole","giveaways"],["giveawaychannel","giveaways"],["giveawayembed","giveaways"],["giveawaywinner","giveaways"],["giveawayedit","giveaways"],["giveawaydelete","giveaways"],["giveawaystatus","giveaways"],["giveawayhistory","giveaways"],["giveawayhelp","giveaways"],["economysetup","economy"],["economysettings","economy"],["deposit","economy"],["withdraw","economy"],["transfer","economy"],["richest","economy"],["economystats","economy"],["dailyreset","economy"],["workcooldown","economy"],["shopadd","economy"],["shopremove","economy"],["shopbuy","economy"],["iteminfo","economy"],["useitem","economy"],["sellitem","economy"],["giftitem","economy"],["coinreset","economy"],["coinadd","economy"],["coinsremove","economy"],["economyhelp","economy"],["levelsetup","levels"],["levelsettings","levels"],["levelreward","levels"],["levelreset","levels"],["leveladd","levels"],["levelremove","levels"],["levelrole","levels"],["levelroles","levels"],["levelchannel","levels"],["levelmessage","levels"],["levelcard","levels"],["xpleaderboard","levels"],["xplevel","levels"],["xpstats","levels"],["xpboost","levels"],["xpreset","levels"],["xpset","levels"],["xpadd","levels"],["xpremove","levels"],["levelhelp","levels"],["game","games"],["gamehelp","games"],["connect4","games"],["tictactoe","games"],["wordle","games"],["hangman","games"],["quiz","games"],["riddle2","games"],["scramble","games"],["anagram","games"],["guess","games"],["numberguess","games"],["blackjack2","games"],["memory","games"],["reaction","games"],["typing","games"],["2048","games"],["snake","games"],["minesweeper","games"],["gameleaderboard","games"],["ownerinfo","owner"],["ownerstats","owner"],["ownersetup","owner"],["ownerreload","owner"],["ownersync","owner"],["ownerbroadcast","owner"],["ownermessage","owner"],["ownermaintenance","owner"],["ownereval","owner"],["ownerleave","owner"],["ownerjoin","owner"],["ownershutdown","owner"],["ownerrestart","owner"],["ownerdb","owner"],["ownerlogs","owner"],["ownerhealth","owner"],["ownercommands","owner"],["ownerblacklist","owner"],["ownerunblacklist","owner"],["ownerhelp","owner"],["softban","moderation"],["massban","moderation"],["masskick","moderation"],["massmute","moderation"],["unbanall","moderation"],["warnall","moderation"],["warningsall","moderation"],["clearallwarnings","moderation"],["history","moderation"],["modlogs","moderation"],["reason","moderation"],["case","moderation"],["cases","moderation"],["lockdown","moderation"],["unlockdown","moderation"],["unmuteall","moderation"],["rolelock","moderation"],["channelclear","moderation"],["cleanup","moderation"],["modstats","moderation"],["serverconfig","administration"],["permissions","administration"],["roleinfo","administration"],["roleclone","administration"],["rolecolor","administration"],["rolehoist","administration"],["rolemention","administration"],["roleposition","administration"],["channelinfo","administration"],["channelclone","administration"],["channelrename","administration"],["channeltopic","administration"],["categorycreate","administration"],["categorydelete","administration"],["categorymove","administration"],["threadcreate","administration"],["threadarchive","administration"],["prune","administration"],["backup","administration"],["restore","administration"],["helpall","utility"],["commands","utility"],["commandinfo","utility"],["servericon","utility"],["serverbanner","utility"],["serverid","utility"],["memberlist","utility"],["bots","utility"],["humans","utility"],["online","utility"],["inrole","utility"],["joined","utility"],["created","utility"],["channelid","utility"],["roleid","utility"],["emojiinfo","utility"],["stickerinfo","utility"],["color","utility"],["whois","utility"],["userinfo2","utility"],["antinuke","automod"],["antinukestatus","automod"],["antinukeconfig","automod"],["antinukebypass","automod"],["antinukereset","automod"],["automodstatus","automod"],["automodlog","automod"],["capsfilter","automod"],["spamfilter","automod"],["mentionfilter","automod"],["invitefilter","automod"],["linkfilter","automod"],["wordfilter","automod"],["massmention","automod"],["raidmode","automod"],["verification","automod"],["verify","automod"],["unverify","automod"],["quarantine","automod"],["unquarantine","automod"],["autowarn","automod"],["automute","automod"],["autokick","automod"],["automodreset","automod"],["automodconfig","automod"],["userstats","stats"],["serverstats","stats"],["statleaderboard","stats"],["messagestats","stats"],["voicestats","stats"],["commandstats","stats"],["reactionstats","stats"],["joinstats","stats"],["leavestats","stats"],["activity","stats"],["activeusers","stats"],["topchatters","stats"],["topvoice","stats"],["topcommands","stats"],["topreactions","stats"],["firstseen","stats"],["lastseen","stats"],["counter","stats"],["counters","stats"],["counterremove","stats"],["meme","fun"],["quote","fun"],["fact","fun"],["cat","fun"],["dog","fun"],["fox","fun"],["riddle","fun"],["roast","fun"],["compliment","fun"],["best","fun"],["worst","fun"],["loved","fun"],["hated","fun"],["fortune","fun"],["magic8","fun"],["number","fun"],["random","fun"],["choose2","fun"],["coinflip","fun"],["dice10","fun"],["modules","server"],["modulelist","server"],["prefix","server"],["language","server"],["timezone","server"],["serverstats2","server"],["serverhealth","server"],["serveraudit","server"],["serverage","server"],["serverowner","server"],["serverregion","server"],["boosts","server"],["boostlevel","server"],["vanity","server"],["verificationlevel","server"],["features","server"],["integrations","server"],["webhooks","server"],["serverexport","server"],["profile","community"],["bio","community"],["birthday","community"],["marry","community"],["divorce","community"],["rep","community"],["reputation","community"],["thanks","community"],["hug","community"],["pat","community"],["highfive","community"],["wave","community"],["slap","community"],["poke","community"],["celebrate","community"],["mood","community"],["ship2","community"],["compatibility","community"],["memberof","community"],["social","community"],["ticketsetup","tickets"],["ticketsettings","tickets"],["tickettranscript","tickets"],["ticketclaim","tickets"],["ticketunclaim","tickets"],["ticketrename","tickets"],["tickettopic","tickets"],["ticketpriority","tickets"],["ticketadduser","tickets"],["ticketremoveuser","tickets"],["ticketlock","tickets"],["ticketunlock","tickets"],["ticketdelete","tickets"],["ticketreopen","tickets"],["ticketarchive","tickets"],["ticketunarchive","tickets"],["ticketstats","tickets"],["ticketlogs","tickets"],["ticketcategory","tickets"],["ticketstaff","tickets"],["volume","music"],["loop","music"],["shuffle","music"],["seek","music"],["forward","music"],["rewind","music"],["lyrics","music"],["filter","music"],["bassboost","music"],["nightcore","music"],["vaporwave","music"],["autoplay","music"],["disconnect","music"],["join","music"],["leave","music"],["musicinfo","music"],["playlist","music"],["savequeue","music"],["loadqueue","music"],["musicstats","music"]].map(([name,category]) => ({name,category}));
const allDefinitions = [...definitions, ...expandedDefinitions];
export const REGISTERED = allDefinitions;
export const CATALOG = REGISTERED;
export const SLASH_REGISTERED = REGISTERED.slice(0, 100);

const emoji = {utility:'🧰',moderation:'🛡️',administration:'⚙️',automod:'🤖',logging:'📜',welcome:'👋',tickets:'🎫',giveaways:'🎁',economy:'💰',levels:'⭐',fun:'🎉',games:'🎮',music:'🎵',owner:'👑',stats:'📊',server:'🏠',community:'🤝'};
const descriptions = Object.fromEntries(REGISTERED.map(x => [x.name, ({userstats:'Detailed user activity statistics',serverstats:'Server-wide activity statistics',statleaderboard:'Top members by activity',counter:'Create a live Statbot-style counter',counters:'List live server counters',counterremove:'Remove a live counter',best:'Give a playful best-of title',worst:'Give a playful worst-at-something title',loved:'Give a playful loved title',hated:'Give a playful hated title'})[x.name] || 'Lightcore '+x.name+' command']));

const commandPermissions = {
  ban: PermissionFlagsBits.BanMembers, unban: PermissionFlagsBits.BanMembers,
  kick: PermissionFlagsBits.KickMembers, timeout: PermissionFlagsBits.ModerateMembers,
  untimeout: PermissionFlagsBits.ModerateMembers, warn: PermissionFlagsBits.ModerateMembers,
  warnings: PermissionFlagsBits.ModerateMembers, clearwarnings: PermissionFlagsBits.ModerateMembers,
  purge: PermissionFlagsBits.ManageMessages, slowmode: PermissionFlagsBits.ManageChannels,
  lock: PermissionFlagsBits.ManageChannels, unlock: PermissionFlagsBits.ManageChannels,
  nick: PermissionFlagsBits.ManageNicknames, rolecreate: PermissionFlagsBits.ManageRoles,
  roledelete: PermissionFlagsBits.ManageRoles, roleadd: PermissionFlagsBits.ManageRoles,
  roleremove: PermissionFlagsBits.ManageRoles, channelcreate: PermissionFlagsBits.ManageChannels,
  channeldelete: PermissionFlagsBits.ManageChannels, categorydelete: PermissionFlagsBits.ManageChannels, setup: PermissionFlagsBits.ManageGuild,
  automod: PermissionFlagsBits.ManageGuild, antispam: PermissionFlagsBits.ManageGuild,
  antilink: PermissionFlagsBits.ManageGuild, filterword: PermissionFlagsBits.ManageGuild,
  logging: PermissionFlagsBits.ManageGuild, logsetupauto: PermissionFlagsBits.ManageChannels,
  logsetup: PermissionFlagsBits.ManageChannels, logsettings: PermissionFlagsBits.ManageGuild,
  autoresponder: PermissionFlagsBits.ManageGuild, welcome: PermissionFlagsBits.ManageGuild,
  goodbye: PermissionFlagsBits.ManageGuild, ticketsetup: PermissionFlagsBits.ManageGuild,
  ticketcategory: PermissionFlagsBits.ManageGuild, ticketpanel: PermissionFlagsBits.ManageGuild,
  ticketstaff: PermissionFlagsBits.ManageGuild, giveawaycreate: PermissionFlagsBits.ManageGuild,
  giveawayend: PermissionFlagsBits.ManageGuild, giveawayreroll: PermissionFlagsBits.ManageGuild,
  levelsetup: PermissionFlagsBits.ManageGuild, levelsettings: PermissionFlagsBits.ManageGuild,
  levelreward: PermissionFlagsBits.ManageRoles, levelreset: PermissionFlagsBits.ManageGuild,
  leveladd: PermissionFlagsBits.ManageGuild, levelremove: PermissionFlagsBits.ManageGuild,
  levelrole: PermissionFlagsBits.ManageRoles, levelchannel: PermissionFlagsBits.ManageGuild,
  levelmessage: PermissionFlagsBits.ManageGuild, xpboost: PermissionFlagsBits.ManageGuild,
  xpreset: PermissionFlagsBits.ManageGuild, xpset: PermissionFlagsBits.ManageGuild,
  xpadd: PermissionFlagsBits.ManageGuild, xpremove: PermissionFlagsBits.ManageGuild,
  xpgive: PermissionFlagsBits.ManageGuild, levelgive: PermissionFlagsBits.ManageGuild,
  premium: PermissionFlagsBits.Administrator, noprefix: PermissionFlagsBits.Administrator,
  premiumbrand: PermissionFlagsBits.ManageGuild,
  premiuminsights: PermissionFlagsBits.ManageGuild,
  premiummember: PermissionFlagsBits.ManageGuild
};

export function getCommandPermission(name) {
  if (Object.prototype.hasOwnProperty.call(commandPermissions, name)) return commandPermissions[name];
  const category = REGISTERED.find(x => x.name === name)?.category;
  if (category === 'owner') return PermissionFlagsBits.Administrator;
  if (['moderation','administration','automod','logging','welcome'].includes(category)) return PermissionFlagsBits.ManageGuild;
  if (category === 'tickets' && !['ticket','ticketadd','ticketremove','ticketclaim','ticketunclaim'].includes(name)) return PermissionFlagsBits.ManageGuild;
  return null;
}

function permissionName(bit) {
  const names = {
    [PermissionFlagsBits.Administrator]:'Administrator', [PermissionFlagsBits.ManageGuild]:'Manage Server',
    [PermissionFlagsBits.ManageRoles]:'Manage Roles', [PermissionFlagsBits.ManageChannels]:'Manage Channels',
    [PermissionFlagsBits.ManageMessages]:'Manage Messages', [PermissionFlagsBits.BanMembers]:'Ban Members',
    [PermissionFlagsBits.KickMembers]:'Kick Members', [PermissionFlagsBits.ModerateMembers]:'Moderate Members',
    [PermissionFlagsBits.ManageNicknames]:'Manage Nicknames'
  };
  return names[bit] || 'Server permission';
}

export function getCommandUsage(name) {
  const examples = {
    levelsetup: '/levelsetup action:on',
    levelsettings: '/levelsettings action:message value:"🎉 {user} reached Level {level}!"',
    levelreward: '/levelreward level:5 role:@VIP',
    rank: '/rank user:@Member',
    giveawaycreate: '/giveawaycreate duration:1h prize:"VIP Rank" winners:1',
    giveawayend: '/giveawayend id:123',
    giveawayreroll: '/giveawayreroll id:123',
    gay: '/gay user:@Member',
    simp: '/simp user:@Member',
    howhot: '/howhot user:@Member',
    logsetupauto: '/logsetupauto'
  };
  if (examples[name]) return examples[name];
  try {
    const category = REGISTERED.find(x => x.name === name)?.category || 'utility';
    const data = makeCommand(name, category).toJSON();
    const options = (data.options || []).filter(x => x.type !== 1 && x.type !== 2);
    const args = options.map(x => x.required ? '<'+x.name+'>' : '['+x.name+']').join(' ');
    return '/'+name+(args ? ' '+args : '');
  } catch {
    return '/'+name;
  }
}

export function commandUsagePayload(name, reason='Check the required options and try again.') {
  const usage = getCommandUsage(name);
  const permission = getCommandPermission(name);
  return {title:'⚠️ Incorrect Command Usage',content:'**/'+name+'**\n\n'+reason+'\n\n**Usage**\n`'+usage+'`\n\n**Example**\n`'+usage+'`\n\n**Required permission:** '+(permission?'`'+permissionName(permission)+'`':'None')};
}

function userOption(b, name='user') {
  return b.addUserOption(o => o.setName(name).setDescription('Member').setRequired(true));
}
function textOption(b, name, required=true) {
  return b.addStringOption(o => o.setName(name).setDescription('Value').setRequired(required));
}
function intOption(b, name, required=true, min=0, max=1000000) {
  return b.addIntegerOption(o => o.setName(name).setDescription('Number').setRequired(required).setMinValue(min).setMaxValue(max));
}

export function makeCommand(name, category) {
  const b = new SlashCommandBuilder().setName(name).setDescription(descriptions[name]);
  const requiredPermission = getCommandPermission(name);
  if (requiredPermission) b.setDefaultMemberPermissions(requiredPermission);
  if (['ban','unban','kick','timeout','untimeout','warn','warnings','clearwarnings','nick'].includes(name)) userOption(b);
  if (['ban','kick','warn'].includes(name)) textOption(b,'reason',false);
  if (name === 'timeout') intOption(b,'minutes',true,1,40320);
  if (name === 'nick') textOption(b,'nickname');
  if (name === 'purge') intOption(b,'amount',true,1,100);
  if (name === 'slowmode') intOption(b,'seconds',true,0,21600);
  if (['say','announce','choose','rate','ship'].includes(name)) textOption(b,'text');
  if (name === 'remind') { textOption(b,'duration'); textOption(b,'message'); }
  if (name === 'timer') textOption(b,'duration');
  if (['userinfo','avatar','banner','level','rank','best','worst','loved','hated','userstats','statleaderboard','topchatters','topvoice','topcommands','topreactions','firstseen','lastseen'].includes(name)) userOption(b);
  if (name === 'timestamp') textOption(b,'date');
  if (name === 'counter') { b.addStringOption(o=>o.setName('type').setDescription('Counter type').setRequired(true).addChoices({name:'Members',value:'members'},{name:'Humans',value:'humans'},{name:'Bots',value:'bots'},{name:'Channels',value:'channels'},{name:'Roles',value:'roles'})); b.addChannelOption(o=>o.setName('channel').setDescription('Voice channel to rename').setRequired(true)); b.addStringOption(o=>o.setName('template').setDescription('Channel name template; {value} is replaced').setRequired(false)); }
  if (name === 'counterremove') b.addChannelOption(o=>o.setName('channel').setDescription('Counter channel').setRequired(true));
  if (['antinuke','antinukestatus','antinukeconfig','antinukebypass','antinukewhitelist','antinukereset'].includes(name)) {
    if (name === 'antinukeconfig') { textOption(b,'action'); textOption(b,'value'); }
    if (name === 'antinukebypass' || name === 'antinukewhitelist') { b.addUserOption(o=>o.setName('user').setDescription('Trusted member').setRequired(true)); b.addStringOption(o=>o.setName('action').setDescription('Add or remove').setRequired(true).addChoices({name:'Add',value:'add'},{name:'Remove',value:'remove'})); }
  }
  if (name === 'rolecreate') textOption(b,'name');
  if (name === 'roledelete') b.addRoleOption(o=>o.setName('role').setDescription('Role').setRequired(true));
  if (name === 'roleadd' || name === 'roleremove') { userOption(b); b.addRoleOption(o=>o.setName('role').setDescription('Role').setRequired(true)); }
  if (name === 'channelcreate') { textOption(b,'name'); b.addStringOption(o=>o.setName('type').setDescription('Channel type').addChoices({name:'Text',value:'text'},{name:'Voice',value:'voice'})); }
  if (name === 'channeldelete') b.addChannelOption(o=>o.setName('channel').setDescription('Channel').setRequired(true));
  if (name === 'poll') { textOption(b,'question'); textOption(b,'options'); }
  if (['levelsetup','levelsettings'].includes(name)) { textOption(b,'action',false); textOption(b,'value',false); }
  if (name === 'levelreward') { intOption(b,'level',true,1,1000); b.addRoleOption(o=>o.setName('role').setDescription('Reward role').setRequired(false)); }
  if (name === 'giveawaycreate') { textOption(b,'duration'); textOption(b,'prize'); intOption(b,'winners',true,1,50); b.addChannelOption(o=>o.setName('channel').setDescription('Giveaway channel').setRequired(false)); }
  if (['giveawayend','giveawayreroll'].includes(name)) textOption(b,'id');
  if (['gay','simp','howhot'].includes(name)) userOption(b,'user');
  if (name === 'welcome') { textOption(b,'message'); b.addChannelOption(o=>o.setName('channel').setDescription('Welcome channel').setRequired(true)); }
  if (name === 'goodbye') { b.addChannelOption(o=>o.setName('channel').setDescription('Goodbye channel').setRequired(true)); }
  if (name === 'autoresponder') { b.addStringOption(o=>o.setName('action').setDescription('Action').setRequired(true).addChoices({name:'Add or update',value:'add'},{name:'Remove',value:'remove'},{name:'List',value:'list'})); textOption(b,'trigger',false); textOption(b,'response',false); }
  if (name === 'ticket') textOption(b,'reason',false);
  if (name === 'ticketsetup') { b.addChannelOption(o=>o.setName('category').setDescription('Ticket category').setRequired(false).addChannelTypes(ChannelType.GuildCategory)); b.addChannelOption(o=>o.setName('logs').setDescription('Ticket log channel').setRequired(false).addChannelTypes(ChannelType.GuildText)); b.addChannelOption(o=>o.setName('transcripts').setDescription('Transcript channel').setRequired(false).addChannelTypes(ChannelType.GuildText)); b.addRoleOption(o=>o.setName('staffrole').setDescription('Support staff role').setRequired(false)); b.addChannelOption(o=>o.setName('panel').setDescription('Panel channel').setRequired(false).addChannelTypes(ChannelType.GuildText)); b.addStringOption(o=>o.setName('title').setDescription('Panel title').setRequired(false)); b.addStringOption(o=>o.setName('welcome').setDescription('Ticket welcome message').setRequired(false)); }
  if (name === 'ticketcategory') { b.addStringOption(o=>o.setName('action').setDescription('Action').setRequired(true).addChoices({name:'Add',value:'add'},{name:'Remove',value:'remove'})); textOption(b,'name',false); textOption(b,'key',false); textOption(b,'description',false); }
  if (name === 'ticketpanel') { b.addChannelOption(o=>o.setName('channel').setDescription('Panel channel').setRequired(false).addChannelTypes(ChannelType.GuildText)); }
  if (name === 'ticketstaff') b.addRoleOption(o=>o.setName('role').setDescription('Support staff role').setRequired(true));
  if (name === 'ticketclaim'||name === 'ticketunclaim'||name === 'tickettranscript'||name === 'ticketsettings'||name === 'ticketlogs'||name === 'ticketstats') {}
  if (name === 'ticketadd' || name === 'ticketremove') userOption(b);
  if (name === 'giveaway') { textOption(b,'duration'); textOption(b,'prize'); intOption(b,'winners',true,1,20); }
  if (name === 'pay') { userOption(b); intOption(b,'amount',true,1,1000000000); }
  if (name === 'xpgive' || name === 'levelgive') { userOption(b); intOption(b,'amount',true,1,1000000); }
  if (name === 'play') textOption(b,'song');
  if (name === 'rps') textOption(b,'choice');
  if (name === 'premiumbrand') { b.addStringOption(o=>o.setName('action').setDescription('Branding action').setRequired(true).addChoices({name:'Name',value:'name'},{name:'Logo',value:'logo'},{name:'Banner',value:'banner'},{name:'Accent',value:'accent'},{name:'Reset',value:'reset'},{name:'Status',value:'status'})); b.addStringOption(o=>o.setName('value').setDescription('Text or image URL').setRequired(false)); }
  if (name === 'premium' || name === 'noprefix') {
    b.addSubcommand(s=>s.setName('grant').setDescription('Grant access').addUserOption(o=>o.setName('user').setDescription('User').setRequired(true)).addIntegerOption(o=>o.setName('days').setDescription('Days').setMinValue(1).setMaxValue(3650)));
    b.addSubcommand(s=>s.setName('revoke').setDescription('Revoke access').addUserOption(o=>o.setName('user').setDescription('User').setRequired(true)));
    b.addSubcommand(s=>s.setName('status').setDescription('Check access').addUserOption(o=>o.setName('user').setDescription('User').setRequired(true)));
    if (name === 'premium') {
      b.addSubcommand(s=>s.setName('grantserver').setDescription('Grant Premium to this server').addIntegerOption(o=>o.setName('days').setDescription('Days').setMinValue(1).setMaxValue(3650)));
      b.addSubcommand(s=>s.setName('revokeserver').setDescription('Revoke Premium from this server'));
      b.addSubcommand(s=>s.setName('serverstatus').setDescription('Check this server Premium status'));
      b.addSubcommand(s=>s.setName('list').setDescription('List premium grants'));
    }
  }
  return b;
}

const key=(g,u)=>g+':'+u;
const durationMs=(v)=>{const m=String(v||'').match(/^(\d+)\s*(s|m|h|d|w)$/i);return m?Number(m[1])*({s:1000,m:60000,h:3600000,d:86400000,w:604800000})[m[2].toLowerCase()]:null;};
const wallet=(g,u)=>{const k=key(g,u);if(!state.balances.has(k))state.balances.set(k,100);return state.balances.get(k);};
const setWallet=(g,u,n)=>state.balances.set(key(g,u),Math.max(0,n));
const xpRow=(g,u)=>{const k=key(g,u);if(!state.xp.has(k))state.xp.set(k,{xp:0,level:0});return state.xp.get(k);};
const addXp=(g,u,n)=>{const r=xpRow(g,u);r.xp+=n;r.level=Math.floor(r.xp/100);return r;};


const guildOnly=i=>{if(!i.guild){styledReply(i, {content:'This command is server-only.',ephemeral:true});return false;}return true;};

export function buildHelpPayload(selected='overview') {
  const groups = {};
  for (const c of REGISTERED) (groups[c.category] ??= []).push(c.name);
  const cats = Object.keys(groups);
  const safe = selected === 'overview' || groups[selected] ? selected : 'overview';

  const helpUses = {
    help: 'Open the Lightcore command center and browse commands by module.',
    ping: 'Check Lightcore response latency.',
    uptime: 'Show how long Lightcore has been online.',
    botinfo: 'Show Lightcore version and runtime information.',
    serverinfo: 'Show basic information about the current server.',
    userinfo: 'Show information about a Discord user.',
    avatar: 'Show a user\'s avatar.',
    banner: 'Show a user\'s profile banner.',
    membercount: 'Show the number of members in the server.',
    roles: 'List the server\'s roles.',
    channels: 'List the server\'s channels.',
    id: 'Show your Discord user ID and the current server ID.',
    timestamp: 'Convert a date or Unix timestamp into a Discord timestamp.',
    choose: 'Randomly choose one option from a comma-separated list.',
    remind: 'Set a reminder that sends you a message after a duration.',
    timer: 'Start a timer and get a notification when it finishes.',
    afk: 'Toggle your AFK status.',
    stats: 'Show Lightcore server, command, and latency statistics.',
    invite: 'Get information for inviting Lightcore to a server.',
    support: 'Get the official Lightcore support server.',
    commands: 'Browse the complete registered command catalog.',
    commandinfo: 'View information about a specific command.',
    servericon: 'Show the current server icon.',
    serverbanner: 'Show the current server banner.',
    serverid: 'Show the current server ID.',
    memberlist: 'List server members.',
    bots: 'List or count bot members.',
    humans: 'List or count human members.',
    online: 'Show members currently online.',
    inrole: 'Show members who have a selected role.',
    joined: 'Show when a member joined the server.',
    created: 'Show when a Discord account was created.',
    channelid: 'Show the ID of a channel.',
    roleid: 'Show the ID of a role.',
    emojiinfo: 'Show information about a custom emoji.',
    stickerinfo: 'Show information about a server sticker.',
    color: 'Show or inspect a color value.',
    whois: 'Show useful information about a user.',
    userinfo2: 'Show detailed information about a user.',
    rank: 'Show your current level and XP.',
    level: 'Show a member\'s current level and XP.',
    levelsetup: 'Configure the server leveling system.',
    levelsettings: 'Change leveling settings and level-up messages.',
    levelreward: 'Set a role reward for a level.',
    xpgive: 'Give XP to a member.',
    levelgive: 'Give levels to a member.',
    leaderboardxp: 'Show the server XP leaderboard.',
    gay: 'Give a random, playful 0–100 joke score for a member.',
    simp: 'Give a random, playful 0–100 joke score for a member.',
    howhot: 'Give a random, playful 0–100 joke score for a member.',
    coin: 'Flip a virtual coin.',
    coinflip: 'Flip a virtual coin.',
    dice: 'Roll a six-sided virtual die.',
    dice10: 'Roll a ten-sided virtual die.',
    '8ball': 'Ask the virtual 8-ball a question.',
    joke: 'Get a short joke.',
    rate: 'Give a random 0–100 fun score.',
    ship: 'Give a random 0–100 compatibility joke score.',
    ship2: 'Give a random 0–100 compatibility joke score.',
    rps: 'Play Rock Paper Scissors.',
    trivia: 'Start the trivia module.',
    connect4: 'Play Connect Four.',
    tictactoe: 'Play Tic-Tac-Toe.',
    wordle: 'Play a Wordle-style game.',
    hangman: 'Play a Hangman-style word game.',
    quiz: 'Play a quiz game.',
    meme: 'Get a meme.',
    quote: 'Get a quote.',
    fact: 'Get a fun fact.',
    cat: 'Get a cat image or fact.',
    dog: 'Get a dog image or fact.',
    fox: 'Get a fox image or fact.',
    riddle: 'Get a riddle.',
    roast: 'Get a playful roast.',
    compliment: 'Get a friendly compliment.',
    fortune: 'Get a random fortune.',
    magic8: 'Ask the virtual Magic 8-Ball.',
    random: 'Generate a random value.',
    coinflip: 'Flip a virtual coin.',
    ban: 'Ban a member from the server.',
    unban: 'Remove a user from the server ban list.',
    kick: 'Kick a member from the server.',
    timeout: 'Temporarily restrict a member.',
    untimeout: 'Remove a member\'s timeout.',
    warn: 'Warn a member and record the moderation action.',
    warnings: 'View a member\'s warnings.',
    clearwarnings: 'Clear a member\'s warnings.',
    purge: 'Bulk-delete messages from the current channel.',
    slowmode: 'Set the channel slowmode delay.',
    lock: 'Lock the current channel.',
    unlock: 'Unlock the current channel.',
    nick: 'Change a member\'s nickname.',
    softban: 'Ban and remove recent messages from a member.',
    massban: 'Ban multiple selected members.',
    masskick: 'Kick multiple selected members.',
    history: 'View moderation history for a member.',
    modlogs: 'View moderation log information.',
    case: 'View a moderation case.',
    cases: 'List moderation cases.',
    lockdown: 'Lock down the server or selected channels.',
    rolecreate: 'Create a new role.',
    roledelete: 'Delete a role.',
    roleadd: 'Add a role to a member.',
    roleremove: 'Remove a role from a member.',
    roleinfo: 'Show information about a role.',
    roleclone: 'Create a copy of a role.',
    rolecolor: 'Change a role color.',
    channelcreate: 'Create a text or voice channel.',
    channeldelete: 'Delete a channel.',
    channelinfo: 'Show information about a channel.',
    channelclone: 'Create a copy of a channel.',
    channelrename: 'Rename a channel.',
    channeltopic: 'Change a channel topic.',
    categorycreate: 'Create a server category.',
    categorydelete: 'Delete a server category.',
    threadcreate: 'Create a thread.',
    threadarchive: 'Archive a thread.',
    announce: 'Send an announcement message.',
    say: 'Make Lightcore send a message.',
    poll: 'Create a simple poll.',
    setup: 'Show the main Lightcore server setup modules.',
    welcome: 'Configure the welcome channel and message.',
    goodbye: 'Configure the goodbye module.',
    autoresponder: 'Add, remove, or list automatic responses.',
    logsetupauto: 'Automatically create Lightcore logging channels.',
    logsettings: 'View or change logging settings.',
    ticket: 'Create a support ticket.',
    ticketclose: 'Close the current ticket.',
    ticketadd: 'Add a member to the current ticket.',
    ticketremove: 'Remove a member from the current ticket.',
    ticketpanel: 'Publish the ticket selection panel.',
    ticketsetup: 'Configure the ticket system.',
    ticketcategory: 'Add or remove ticket categories.',
    ticketclaim: 'Claim a support ticket.',
    ticketunclaim: 'Release a claimed support ticket.',
    ticketstats: 'Show ticket statistics.',
    giveaway: 'Create a non-wagering giveaway.',
    giveawaycreate: 'Create a non-wagering giveaway with a duration and prize.',
    giveawayend: 'End a giveaway early.',
    giveawayreroll: 'Reroll a giveaway winner.',
    giveawaylist: 'List configured giveaways.',
    giveawaycancel: 'Cancel a giveaway.',
    giveawaypause: 'Pause a giveaway.',
    giveawayresume: 'Resume a giveaway.',
    balance: 'Show your virtual coin balance.',
    daily: 'Claim your daily virtual coins.',
    work: 'Earn virtual coins from the work command.',
    pay: 'Transfer virtual coins to another member.',
    shop: 'View the virtual shop.',
    inventory: 'View your virtual inventory.',
    leaderboard: 'Show the virtual coin leaderboard.',
    economysetup: 'Configure the virtual economy module.',
    deposit: 'Move virtual coins into a saved balance.',
    withdraw: 'Withdraw virtual coins from a saved balance.',
    transfer: 'Transfer virtual coins.',
    richest: 'Show members with the highest virtual balances.',
    antinuke: 'View the Anti-Nuke protection controls.',
    antinukestatus: 'Show the current Anti-Nuke status.',
    antinukeconfig: 'Configure Anti-Nuke protection.',
    antinukebypass: 'Add or remove a trusted Anti-Nuke bypass user.',
    antinukereset: 'Reset Anti-Nuke settings to safe defaults.',
    automod: 'Configure or enable AutoMod protection.',
    antispam: 'Configure anti-spam protection.',
    antilink: 'Configure link filtering.',
    filterword: 'Configure blocked-word filtering.',
    logging: 'Configure the logging module.',
    userstats: 'Show detailed activity statistics for a member.',
    serverstats: 'Show server-wide activity statistics.',
    statleaderboard: 'Show the activity leaderboard.',
    messagestats: 'Show message activity statistics.',
    voicestats: 'Show voice activity statistics.',
    commandstats: 'Show command usage statistics.',
    reactionstats: 'Show reaction statistics.',
    joinstats: 'Show join statistics.',
    leavestats: 'Show leave statistics.',
    activity: 'Show a member\'s activity statistics.',
    activeusers: 'Show the most active members.',
    topchatters: 'Show the top chatters.',
    topvoice: 'Show the top voice participants.',
    topcommands: 'Show the most-used commands.',
    topreactions: 'Show the most-used reactions.',
    firstseen: 'Show when a member was first seen.',
    lastseen: 'Show when a member was last seen.',
    counter: 'Create a live server statistics counter.',
    counters: 'List live server statistics counters.',
    counterremove: 'Remove a live server statistics counter.',
    play: 'Play a song in a voice channel.',
    pause: 'Pause the current music.',
    resume: 'Resume paused music.',
    skip: 'Skip the current song.',
    stop: 'Stop music playback.',
    queue: 'Show the music queue.',
    nowplaying: 'Show the currently playing song.',
    volume: 'Change music volume.',
    loop: 'Control music looping.',
    shuffle: 'Shuffle the music queue.',
    lyrics: 'Show lyrics information when available.',
    disconnect: 'Disconnect Lightcore from the voice channel.',
    join: 'Join your current voice channel.',
    leave: 'Leave the voice channel.'
  };

  const categoryFallback = {
    utility: 'Use this utility command to view or retrieve Discord server information.',
    moderation: 'Use this moderation command to manage members and moderation actions.',
    administration: 'Use this administration command to configure the server.',
    automod: 'Use this AutoMod command to configure server protection.',
    logging: 'Use this logging command to configure or inspect server logs.',
    welcome: 'Use this welcome command to configure member join and leave features.',
    tickets: 'Use this ticket command to manage the support ticket system.',
    giveaways: 'Use this giveaway command to manage non-wagering giveaways.',
    economy: 'Use this economy command to manage virtual server coins.',
    levels: 'Use this levels command to manage XP and level rewards.',
    fun: 'Use this fun command for entertainment.',
    games: 'Use this game command to play a game.',
    music: 'Use this music command to control playback.',
    stats: 'Use this statistics command to view server or member activity.',
    server: 'Use this server command to manage or inspect server settings.',
    community: 'Use this community command for social server features.',
    premium: 'Use this Premium command to access Premium features.',
    owner: 'Owner-only command for managing Lightcore.',
  };

  const humanize = name => name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/2$/, '').replace(/([a-z])(\d)/g, '$1 $2').replace(/[-_]/g, ' ');
  const getUse = name => helpUses[name] || `Use this command to manage or view **${humanize(name)}**.`;

  const lines = safe === 'overview'
    ? [
        '# ⚡ LIGHTCORE',
        '> **One bot. Your whole server.**',
        '',
        '**Command Center**',
        `📦 ${REGISTERED.length} commands • 💬 ${SLASH_REGISTERED.length} slash commands • ⚡ Prefix: . • 👑 No-prefix for entitled users`,
        '',
        '**Modules**',
        '🛡️ Moderation • ⚙️ Administration • 🤖 AutoMod • 📜 Logging',
        '👋 Welcome • 🎫 Tickets • 🎁 Giveaways • 💰 Economy • ⭐ Levels',
        '🎉 Fun • 🎮 Games • 🎵 Music • 🧰 Utility',
        '',
        '**Select a module below. Each command is shown with its purpose.**'
      ]
    : [
        '# '+(emoji[safe]||'🔹')+' '+safe.toUpperCase(),
        '> '+groups[safe].length+' commands in this module',
        '',
        ...groups[safe].map(n => '**.'+n+'**\n> '+(helpUses[n] || categoryFallback[safe] || getUse(n)))
      ];

  const menu = new StringSelectMenuBuilder()
    .setCustomId('lightcore:help')
    .setPlaceholder('📚 Choose a module')
    .addOptions(
      {label:'🏠 Overview',value:'overview',description:'Lightcore command center'},
      ...cats.map(c=>({label:(emoji[c]||'🔹')+' '+c,value:c,description:groups[c].length+' commands'}))
    );

  const box = new ContainerBuilder()
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(lines.join('\n')))
    .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
    .addActionRowComponents(new ActionRowBuilder().addComponents(menu))
    .addActionRowComponents(new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('lightcore:home').setLabel('Home').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('lightcore:ping').setLabel('Ping').setStyle(ButtonStyle.Primary)
    ));
  return {flags:MessageFlags.IsComponentsV2,components:[box]};
}

export async function handleCategoryDeleteInteraction(i,client) {
  if(!i.isButton()&&!i.isStringSelectMenu())return false;
  if(i.customId==='categorydelete:select' && i.isStringSelectMenu()){
    const id=i.values[0], category=i.guild?.channels.cache.get(id);
    if(!category || category.type!==ChannelType.GuildCategory)return styledReply(i,{content:'❌ That category no longer exists.',ephemeral:true});
    const channels=[...category.children.cache.values()];
    const confirm=new ButtonBuilder().setCustomId('categorydelete:confirm:'+id).setLabel('Delete Category & Channels').setStyle(ButtonStyle.Danger);
    const cancel=new ButtonBuilder().setCustomId('categorydelete:cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary);
    return i.update({content:'⚠️ Delete '+category.name+'?\nThis will permanently delete '+channels.length+' channel(s) inside it and then delete the category itself.\n\nThis cannot be undone.',components:[new ActionRowBuilder().addComponents(confirm,cancel)]});
  }
  if(i.isButton()&&i.customId==='categorydelete:cancel')return i.update({content:'❌ Category deletion cancelled.',components:[]});
  if(i.isButton()&&i.customId.startsWith('categorydelete:confirm:')){
    if(!i.guild)return i.update({content:'❌ This command can only be used in a server.',components:[]});
    const id=i.customId.split(':')[2], category=i.guild.channels.cache.get(id);
    if(!category || category.type!==ChannelType.GuildCategory)return i.update({content:'❌ That category no longer exists.',components:[]});
    if(!i.memberPermissions?.has(PermissionFlagsBits.ManageChannels) && i.user.id!==ownerId)return i.update({content:'❌ You need Manage Channels to do this.',components:[]});
    await i.deferUpdate();
    const channels=[...category.children.cache.values()];
    let deleted=0;
    for(const channel of channels){await channel.delete('Lightcore categorydelete').then(()=>deleted++).catch(()=>{});}
    await category.delete('Lightcore categorydelete').catch(()=>null);
    return i.editReply({content:'🗑️ Deleted category '+category.name+' and '+deleted+' channel(s).',components:[]});
  }
  return false;
}
export async function handleHelpInteraction(i,client) {
  if(!i.isButton()&&!i.isStringSelectMenu())return false;
  if(!i.customId.startsWith('lightcore:'))return false;
  if(i.customId==='lightcore:ping')return styledReply(i, {content:'🏓 Pong! '+client.ws.ping+'ms',ephemeral:true});
  return i.update(buildHelpPayload(i.isStringSelectMenu()?i.values[0]:'overview'));
}

async function moderate(i,name) {
  if(!guildOnly(i))return true;
  const m=i.options.getMember('user'); if(!m)return styledReply(i, {content:'Member not found.',ephemeral:true});
  if(name==='ban'){const reason=i.options.getString('reason')||'Lightcore';await m.ban({reason});await logModerationAction(i.guild,{action:'Ban',staff:i.user,target:m.user,reason});return styledReply(i, '🔨 Banned '+m.user.tag);}
  if(name==='unban'){const u=i.options.getUser('user');if(!u)return styledReply(i, {content:'User not found.',ephemeral:true});await i.guild.bans.remove(u.id);await logModerationAction(i.guild,{action:'Unban',staff:i.user,target:u,reason:'Lightcore'});return styledReply(i, '🔓 Unbanned '+u.tag);}
  if(name==='kick'){const reason=i.options.getString('reason')||'Lightcore';await m.kick(reason);await logModerationAction(i.guild,{action:'Kick',staff:i.user,target:m.user,reason});return styledReply(i, '👢 Kicked '+m.user.tag);}
  if(name==='timeout'){const n=i.options.getInteger('minutes');const reason='Lightcore';await m.timeout(n*60000,reason);await logModerationAction(i.guild,{action:'Timeout',staff:i.user,target:m.user,reason,duration:n+' minutes'});return styledReply(i, '⏱️ Timed out '+m.user.tag+' for '+n+' minutes.');}
  if(name==='untimeout'){await m.timeout(null,'Lightcore');await logModerationAction(i.guild,{action:'Timeout Removed',staff:i.user,target:m.user,reason:'Lightcore'});return styledReply(i, '▶️ Timeout removed.');}
  if(name==='warn'){const k=key(i.guild.id,m.id),a=state.warnings.get(k)||[];const reason=i.options.getString('reason')||'No reason';a.push({reason,at:Date.now(),staff:i.user.id});state.warnings.set(k,a);await logModerationAction(i.guild,{action:'Warn',staff:i.user,target:m.user,reason,extra:'Total warnings: '+a.length});return styledReply(i, '⚠️ Warned '+m.user.tag+'. Total: '+a.length);}
  if(name==='warnings'){const a=state.warnings.get(key(i.guild.id,m.id))||[];return styledReply(i, '⚠️ '+m.user.tag+' has '+a.length+' warning(s).\n'+a.map((x,n)=>(n+1)+'. '+x.reason).join('\n'));}
  if(name==='clearwarnings'){state.warnings.delete(key(i.guild.id,m.id));return styledReply(i, '🧹 Warnings cleared.');}
  if(name==='nick'){await m.setNickname(i.options.getString('nickname'));return styledReply(i, '✏️ Nickname updated.');}
}

export async function handle(i,client) {
  const n=i.commandName;
  const requiredPermission = getCommandPermission(n);
  if (requiredPermission && i.guild && i.user.id!==ownerId && !i.memberPermissions?.has(requiredPermission)) return styledReply(i, commandUsagePayload(n, 'You do not have the permission required to use this command.'));
  if(n==='rank'||n==='level'){if(!guildOnly(i))return;const u=i.options.getUser?.('user')||i.user;const p=levelProgress(i.guild.id,u.id);return styledReply(i,{title:'⭐ Level',content:'**'+u.tag+'**\nLevel: **'+p.level+'**\nXP: **'+p.xp+' / '+p.needed+'**\nProgress: **'+p.percent+'%**'});}
  if(n==='levelsetup'||n==='levelsettings'){if(!guildOnly(i))return;const action=i.options.getString('action')||'status';const value=i.options.getString('value');if(action==='on'||action==='off')updateLevelConfig(i.guild.id,{enabled:action==='on'?1:0});else if(action==='message'&&value)updateLevelConfig(i.guild.id,{levelup_message:value});else if(action==='cooldown'&&value)updateLevelConfig(i.guild.id,{cooldown:Math.max(5,Number(value)||60)});else if(action==='channel')updateLevelConfig(i.guild.id,{levelup_channel_id:i.channel.id});const c=getLevelConfig(i.guild.id);return styledReply(i,{title:'⭐ Leveling Settings',content:'Enabled: **'+(c.enabled?'Yes':'No')+'**\nXP: **'+c.xp_min+'-'+c.xp_max+'**\nCooldown: **'+c.cooldown+'s**\nLevel-up channel: '+(c.levelup_channel_id?'<#'+c.levelup_channel_id+'>':'Current channel')+'\nMessage: '+c.levelup_message});}
  if(n==='levelreward'){if(!guildOnly(i))return;const lvl=i.options.getInteger('level');const role=i.options.getRole?.('role');if(role){const me=i.guild.members.me;if(me&&role.position>=me.roles.highest.position)return styledReply(i,commandUsagePayload(n,'I cannot assign that role because it is above my highest role.'));addLevelReward(i.guild.id,lvl,role.id);return styledReply(i,{title:'🏆 Level Reward Saved',content:'Level **'+lvl+'** → '+role+'\n\nMembers reaching this level will receive the role automatically.'});}removeLevelReward(i.guild.id,lvl);return styledReply(i,'🗑️ Level **'+lvl+'** reward removed.');}
  if(n==='giveawaycreate'){if(!guildOnly(i))return;const d=i.options.getString('duration');const prize=i.options.getString('prize');const winners=i.options.getInteger('winners');const channel=i.options.getChannel?.('channel')||i.channel;const m=/^(\d+)\s*(s|m|h|d|w)$/i.exec(d||'');if(!m)return styledReply(i,'❌ Duration: 30s, 10m, 2h, 1d, or 1w.');const mult={s:1000,m:60000,h:3600000,d:86400000,w:604800000}[m[2].toLowerCase()];const g=createGiveaway(i.guild.id,channel.id,i.user.id,prize,winners,Date.now()+Number(m[1])*mult);const msg=await channel.send(giveawayPayload(g));setGiveawayMessage(g.id,msg.id);return styledReply(i,'🎁 Giveaway created in '+channel+' — ID: `'+g.id+'`');}
  if(n==='giveawayend'){if(!guildOnly(i))return;const g=getGiveaway(i.options.getString('id'));if(!g||g.guild_id!==i.guild.id)return styledReply(i,'❌ Giveaway not found.');const result=endGiveaway(g.id);if(!result)return styledReply(i,'❌ Giveaway already ended.');const ch=i.guild.channels.cache.get(g.channel_id);if(ch?.isTextBased()&&g.message_id)await ch.messages.fetch(g.message_id).then(m=>m.edit(giveawayPayload(result,true))).catch(()=>{});return styledReply(i,'🎉 Giveaway ended. Winners: '+(result.winnersPicked.map(x=>'<@'+x+'>').join(', ')||'none'));}
  if(['gay','simp','howhot'].includes(n)){const u=i.options.getUser?.('user')||i.user;const score=Math.floor(Math.random()*101);const labels={gay:'🌈 Gay Meter',simp:'💖 Simp Meter',howhot:'🎲 Random Rating'};return styledReply(i,{title:labels[n],content:'For fun only — random joke score, not a real measurement.\n\n'+u+' → **'+score+'%**'});}
  if(n==='premiuminsights'){if(!guildOnly(i))return;if(!isPremium(i.user.id,i.guild.id))return styledReply(i,{content:'👑 Premium Insights is Premium-only.',ephemeral:true});const g=getGuildStats(i.guild.id);const msgs=getTopStats(i.guild.id,'messages',5);const voice=getTopStats(i.guild.id,'voice_seconds',5);return styledReply(i,{title:'✨ Premium Server Insights',content:'**Server:** '+i.guild.name+'\n**Members:** '+i.guild.memberCount+'\n**Messages:** '+g.messages+'\n**Commands:** '+g.commands+'\n**Joins:** '+g.joins+'\n**Leaves:** '+g.leaves+'\n\n**Top Chatters**\n'+(msgs.length?msgs.map((r,n)=>`${n+1}. <@${r.user_id}> — ${r.value}`).join('\n'):'No message data yet.')+'\n\n**Top Voice**\n'+(voice.length?voice.map((r,n)=>`${n+1}. <@${r.user_id}> — ${Math.floor(r.value/60)} min`).join('\n'):'No voice data yet.')});};
  if(n==='premiummember'){if(!guildOnly(i))return;if(!isPremium(i.user.id,i.guild.id))return styledReply(i,{content:'👑 Premium Member Insights is Premium-only.',ephemeral:true});const u=i.options.getUser('user')||i.user;const m=await i.guild.members.fetch(u.id).catch(()=>null);if(!m)return styledReply(i,{content:'Member not found.',ephemeral:true});const st=getUserStats(i.guild.id,u.id);return styledReply(i,{title:'🔎 Premium Member Insights',content:'**User:** <@'+u.id+'>\n**Joined:** '+(m.joinedTimestamp?'<t:'+Math.floor(m.joinedTimestamp/1000)+':F>':'Unknown')+'\n**Roles:** '+(m.roles.cache.filter(r=>r.id!==i.guild.id).map(r=>'<@&'+r.id+'>').join(', ')||'None')+'\n**Messages:** '+st.messages+'\n**Commands:** '+st.commands+'\n**Voice:** '+Math.floor(st.voice_seconds/60)+' min\n**First seen:** '+(st.first_seen?'<t:'+st.first_seen+':F>':'Unknown')+'\n**Last seen:** '+(st.last_seen?'<t:'+st.last_seen+':R>':'Unknown')});};
  if(n==='premiuminfo'){if(!guildOnly(i))return;const active=isPremium(i.user.id,i.guild.id);const b=getPremiumBranding(i.guild.id);return styledReply(i,{title:'👑 Premium',content:'Status: **'+(active?'Active':'Not active')+'**\nServer branding: **'+(b.name||i.guild.name)+'**\nLogo: '+(b.logo_url?'Configured':'Default')+'\nBanner: '+(b.banner_url?'Configured':'Default')+'\n\nPremium includes branded Lightcore responses, premium server tools, and no-prefix access when granted.'});}
  if(n==='premiumbrand'){if(!guildOnly(i))return;if(i.user.id!==ownerId&&!isPremium(i.user.id,i.guild.id))return styledReply(i,{content:'👑 This is a Premium-only feature. Ask the server owner to grant Premium to your account or server.',ephemeral:true});if(i.user.id!==ownerId&&!i.memberPermissions?.has(PermissionFlagsBits.ManageGuild))return styledReply(i,{content:'You need Manage Server to change server branding.',ephemeral:true});const action=i.options.getString('action'),value=i.options.getString('value');if(action==='reset'){resetPremiumBranding(i.guild.id);return styledReply(i,'🧹 Premium branding reset to the server defaults.');}if(action==='status'){const b=getPremiumBranding(i.guild.id);return styledReply(i,{title:'👑 Premium Branding',content:'Name: **'+(b.name||i.guild.name)+'**\nLogo: '+(b.logo_url||'Default')+'\nBanner: '+(b.banner_url||'Default')});}if(!value)return styledReply(i,{content:'Provide a value. Use a normal name for name, or a direct HTTPS image URL for logo/banner.',ephemeral:true});if(action==='name'){const name=value.trim().slice(0,80);if(!name)return styledReply(i,{content:'Name cannot be empty.',ephemeral:true});setPremiumBranding(i.guild.id,{name});return styledReply(i,'✨ Premium server name set to **'+name+'**.');}if(action==='accent'){const hex=value.trim().replace(/^#/,'');if(!/^[0-9a-f]{6}$/i.test(hex))return styledReply(i,{content:'Accent must be a 6-digit hex color, for example **5865F2** or **#5865F2**.',ephemeral:true});setPremiumBranding(i.guild.id,{accent:parseInt(hex,16)});return styledReply(i,'✨ Premium accent color updated to **#'+hex.toUpperCase()+'**.');}if(!/^https:\/\/\S+$/i.test(value))return styledReply(i,{content:'Logo and banner must be a direct HTTPS image URL.',ephemeral:true});if(action==='logo')setPremiumBranding(i.guild.id,{logo_url:value});else if(action==='banner')setPremiumBranding(i.guild.id,{banner_url:value});else return styledReply(i,{content:'Choose name, logo, banner, accent, reset, or status.',ephemeral:true});return styledReply(i,'✨ Premium '+action+' updated.');}
  if(n==='serverhealth'){if(!guildOnly(i))return;if(!isPremium(i.user.id,i.guild.id))return styledReply(i,{content:'👑 Server Health is Premium-only.',ephemeral:true});const g=i.guild;const humans=g.members.cache.filter(m=>!m.user.bot).size;const bots=g.members.cache.filter(m=>m.user.bot).size;return styledReply(i,{title:'🩺 Premium Server Health',content:'Members: **'+g.memberCount+'**\nHumans: **'+humans+'**\nBots: **'+bots+'**\nChannels: **'+g.channels.cache.size+'**\nRoles: **'+g.roles.cache.size+'**\nBoosts: **'+g.premiumSubscriptionCount+'**\nBoost level: **'+g.premiumTier+'**\nVerification: **'+g.verificationLevel+'**'});}
  if(n==='activityreport'){if(!guildOnly(i))return;if(!isPremium(i.user.id,i.guild.id))return styledReply(i,{content:'👑 Activity Report is Premium-only.',ephemeral:true});const rows=getTopStats(i.guild.id,'messages',10);const lines=rows.map((r,k)=>'**'+(k+1)+'.** <@'+r.user_id+'> — '+r.value+' messages');return styledReply(i,{title:'📈 Premium Activity Report',content:lines.length?lines.join('\n'):'No activity recorded yet.'});}
  if(n==='help')return styledReply(i, buildHelpPayload());
  if(n==='logsetupauto'){if(!guildOnly(i))return;const created=await setupLogChannels(i.guild);return styledReply(i,{title:'📜 LC logs — Automatic Setup',content:created.message+'\n\n**Category:** `'+getLogCategoryName()+'`\n\n**Created logging channels:**\n'+getSecurityChannelNames().map(x=>'• #'+x).join('\n')+'\n\n**Required bot permissions:**\n• Manage Channels\n• View Audit Log\n• Manage Webhooks'});}
  if(n==='ping')return styledReply(i, '🏓 Pong! '+client.ws.ping+'ms');
  if(n==='uptime')return styledReply(i, '⏱️ Uptime: '+Math.floor(process.uptime())+' seconds');
  if(n==='botinfo')return styledReply(i, '## ⚡ Lightcore\nDiscord.js: 14.27.0\nRegistered commands: '+REGISTERED.length+'\nNode: '+process.version);
  if(n==='stats')return styledReply(i, '📊 Servers: '+client.guilds.cache.size+' • Commands: '+REGISTERED.length+' • Ping: '+client.ws.ping+'ms');
  if(n==='serverinfo'){if(!guildOnly(i))return;const g=i.guild;return styledReply(i, '## 🏠 '+g.name+'\nMembers: '+g.memberCount+'\nChannels: '+g.channels.cache.size+'\nRoles: '+g.roles.cache.size);}
  if(['userinfo','avatar','banner','level'].includes(n)){const u=i.options.getUser('user')||i.user;if(n==='avatar')return styledReply(i, u.displayAvatarURL({size:1024}));if(n==='banner')return styledReply(i, u.bannerURL({size:1024})||'No banner.');if(n==='level'){if(!guildOnly(i))return;const r=xpRow(i.guild.id,u.id);return styledReply(i, '⭐ '+u.tag+' • Level '+r.level+' • '+r.xp+' XP');}return styledReply(i, '👤 '+u.tag+' • ID '+u.id);}
  if(n==='membercount'){if(!guildOnly(i))return;styledReply(i, '👥 Members: '+i.guild.memberCount);}
  if(n==='roles'){if(!guildOnly(i))return;styledReply(i, i.guild.roles.cache.filter(r=>r.name!=='@everyone').map(r=>'<@&'+r.id+'>').slice(0,50).join(' ')||'No roles.');}
  if(n==='channels'){if(!guildOnly(i))return;styledReply(i, i.guild.channels.cache.map(c=>'<#'+c.id+'>').slice(0,80).join(' ')||'No channels.');}
  if(n==='id')return styledReply(i, '🆔 User: '+i.user.id+(i.guild?' • Server: '+i.guild.id:''));
  if(n==='timestamp'){const raw=i.options.getString('date'),num=Number(raw),d=Number.isFinite(num)?new Date(num*1000):new Date(raw);if(Number.isNaN(d.getTime()))return styledReply(i, {content:'Invalid date.',ephemeral:true});return styledReply(i, '🕒 <t:'+Math.floor(d.getTime()/1000)+':F>');}
  if(n==='choose'){const a=i.options.getString('text').split(',').map(x=>x.trim()).filter(Boolean);return styledReply(i, '🎯 '+(a[Math.floor(Math.random()*a.length)]||'No choices.'));}
  if(n==='invite')return styledReply(i, '🔗 Configure CLIENT_ID in Render and generate the OAuth2 invite from the Discord Developer Portal.');
  if(n==='support')return styledReply(i, {title:'🆘 Lightcore Support',content:'Need help, bug reports, setup assistance, or feature support?\n\n**Permanent support server:**\nhttps://discord.gg/Ehmqr5drSz'});
  if(n==='remind'||n==='timer'){const ms=durationMs(i.options.getString('duration'));if(!ms)return styledReply(i, {content:'Use 10s, 5m, 1h, or 1d.',ephemeral:true});const msg=n==='remind'?i.options.getString('message'):'Timer finished';await styledReply(i, '⏰ Timer started.');setTimeout(()=>styledFollowUp(i, '⏰ <@'+i.user.id+'> '+msg).catch(()=>{}),ms);return;}
  if(n==='afk'){if(!guildOnly(i))return;const k=key(i.guild.id,i.user.id);if(state.afk.delete(k))return styledReply(i, '👋 AFK removed.');state.afk.set(k,Date.now());return styledReply(i, '💤 AFK enabled.');}
  if(['antinuke','antinukestatus','antinukeconfig','antinukebypass','antinukewhitelist','antinukereset'].includes(n)){ if(!guildOnly(i))return; if(!i.memberPermissions?.has(PermissionFlagsBits.ManageGuild) && i.user.id!==ownerId)return styledReply(i,{content:'You need Manage Server.',ephemeral:true}); if(n==='antinuke')return styledReply(i,{title:'🛡️ Anti-Nuke',content:'Use **.antinukeconfig** to enable protection and configure limits.'}); if(n==='antinukestatus')return styledReply(i, antiNukeStatusText(i.guild.id)); if(n==='antinukereset'){resetAntiNuke(i.guild.id);return styledReply(i,'🛡️ Anti-Nuke configuration reset to safe defaults.');} if(n==='antinukebypass'||n==='antinukewhitelist'){const u=i.options.getUser('user');const action=i.options.getString('action')||'add';changeAntiNukeBypass(i.guild.id,u.id,action);return styledReply(i,{title:'🛡️ Anti-Nuke Whitelist',content:antiNukeWhitelistText(i.guild.id,u.id,action)});} if(n==='antinukeconfig'){const action=i.options.getString('action'),value=i.options.getString('value');configureAntiNuke(i.guild.id,action,value);return styledReply(i, antiNukeConfigText(i.guild.id,action,value));} }
  if(['ban','unban','kick','timeout','untimeout','warn','warnings','clearwarnings','nick'].includes(n))return moderate(i,n);
  if(n==='purge'){if(!guildOnly(i))return;const x=await i.channel.bulkDelete(i.options.getInteger('amount'),true);return styledReply(i, {content:'🧹 Deleted '+x.size+' messages.',ephemeral:true});}
  if(n==='slowmode'){if(!guildOnly(i))return;await i.channel.setRateLimitPerUser(i.options.getInteger('seconds'));return styledReply(i, '🐢 Slowmode updated.');}
  if(n==='lock'||n==='unlock'){if(!guildOnly(i))return;await i.channel.permissionOverwrites.edit(i.guild.roles.everyone,{SendMessages:n==='lock'?false:null});return styledReply(i, n==='lock'?'🔒 Locked.':'🔓 Unlocked.');}
  if(n==='say'||n==='announce')return styledReply(i, (n==='announce'?'📢 ':'')+i.options.getString('text'));
  if(n==='poll'){const question=i.options.getString('question');const options=i.options.getString('options').split('|').map((x,k)=>(k+1)+'. '+x.trim()).join('\n');return styledReply(i, {title:'📊 Poll',content:'**'+question+'**\n\n'+options});}
  if(n==='rolecreate'){if(!guildOnly(i))return;const r=await i.guild.roles.create({name:i.options.getString('name'),reason:'Lightcore'});return styledReply(i, '🎭 Created <@&'+r.id+'>.');}
  if(n==='roledelete'){if(!guildOnly(i))return;await i.options.getRole('role').delete('Lightcore');return styledReply(i, '🗑️ Role deleted.');}
  if(n==='roleadd'||n==='roleremove'){if(!guildOnly(i))return;const m=i.options.getMember('user'),r=i.options.getRole('role');if(n==='roleadd')await m.roles.add(r);else await m.roles.remove(r);return styledReply(i, n==='roleadd'?'➕ Role added.':'➖ Role removed.');}
  if(n==='channelcreate'){if(!guildOnly(i))return;const type=i.options.getString('type')==='voice'?ChannelType.GuildVoice:ChannelType.GuildText,c=await i.guild.channels.create({name:i.options.getString('name'),type});return styledReply(i, '📁 Created <#'+c.id+'>.');}
  if(n==='channeldelete'){if(!guildOnly(i))return;await i.options.getChannel('channel').delete('Lightcore');return styledReply(i, '🗑️ Channel deleted.');}
  if(n==='categorydelete'){
    if(!guildOnly(i))return;
    const categories=i.guild.channels.cache.filter(c=>c.type===ChannelType.GuildCategory);
    if(!categories.size)return styledReply(i,{content:'📁 No categories found in this server.',ephemeral:true});
    const menu=new StringSelectMenuBuilder().setCustomId('categorydelete:select').setPlaceholder('Select a category to delete').addOptions([...categories.values()].slice(0,25).map(c=>({label:c.name.slice(0,100),value:c.id,description:'Delete this category and all channels inside it'})));
    return styledReply(i,{content:'⚠️ Category Delete\nSelect a category below. This will permanently delete the category and every channel inside it.',components:[new ActionRowBuilder().addComponents(menu)],ephemeral:true});
  }
  if(n==='welcome'){if(!guildOnly(i))return;const channel=i.options.getChannel('channel');const message=i.options.getString('message');setWelcome(i.guild.id,channel.id,message);return styledReply(i, '👋 Welcome system configured for <#'+channel.id+'>.\nPlaceholders: {user}, {username}, {server}, {membercount}, {id}.');}
  if(n==='goodbye'){if(!guildOnly(i))return;return styledReply(i, '👋 Goodbye module is ready; use the welcome configuration/database for your goodbye channel.');}
  if(n==='autoresponder'){if(!guildOnly(i))return;const action=i.options.getString('action'),trigger=i.options.getString('trigger'),response=i.options.getString('response');if(action==='list'){const data=getAutoresponders(i.guild.id);return styledReply(i, '🤖 Autoresponders: '+(Object.keys(data).length?Object.keys(data).map(x=>'`'+x+'`').join(', '):'None'));}if(!trigger)return styledReply(i, {content:'Trigger is required for this action.',ephemeral:true});if(action==='remove'){removeAutoresponder(i.guild.id,trigger);return styledReply(i, '🗑️ Removed autoresponder `'+trigger+'`.');}if(!response)return styledReply(i, {content:'Response is required when adding an autoresponder.',ephemeral:true});setAutoresponder(i.guild.id,trigger,response);return styledReply(i, '🤖 Autoresponder saved for `'+trigger+'`.');}
  if(n==='setup')return styledReply(i, '## ⚙️ Lightcore Setup\nModules: AutoMod • Logging • Welcome • AutoResponder • Tickets • Giveaways • Economy • Levels • Music');
  if(['automod','antispam','antilink','filterword','logging'].includes(n)){if(!guildOnly(i))return;state.settings.set(key(i.guild.id,n),true);return styledReply(i, '✅ '+n+' module enabled.');}
  if(n==='ticketsetup'){if(!guildOnly(i))return;const p={};const cat=i.options.getChannel('category'),logs=i.options.getChannel('logs'),trans=i.options.getChannel('transcripts'),panel=i.options.getChannel('panel'),role=i.options.getRole('staffrole');if(cat)p.category_id=cat.id;if(logs)p.log_channel_id=logs.id;if(trans)p.transcript_channel_id=trans.id;if(panel)p.panel_channel_id=panel.id;if(role)p.staff_role_id=role.id;if(i.options.getString('title'))p.panel_title=i.options.getString('title');if(i.options.getString('welcome'))p.welcome_message=i.options.getString('welcome');updateTicketConfig(i.guild.id,p);return styledReply(i, '🎫 Ticket system configured. Use **/ticketcategory** to add categories and **/ticketpanel** to publish the panel.');}
  if(n==='ticketcategory'){if(!guildOnly(i))return;const a=i.options.getString('action'),keyv=i.options.getString('key')||i.options.getString('name');if(a==='remove'){if(!keyv)return styledReply(i, {content:'Provide the category key/name.',ephemeral:true});removeTicketCategory(i.guild.id,keyv);return styledReply(i, '🗑️ Ticket category removed.');}const name=i.options.getString('name');if(!name)return styledReply(i, {content:'Category name is required.',ephemeral:true});addTicketCategory(i.guild.id,{key:keyv||name,name,description:i.options.getString('description')||'Open a support ticket'});return styledReply(i, '✅ Ticket category added: **'+name+'**.');}
  if(n==='ticketpanel'){if(!guildOnly(i))return;const cfg=getTicketConfig(i.guild.id),ch=i.options.getChannel('channel')||i.guild.channels.cache.get(cfg.panel_channel_id)||i.channel;if(!ch?.isTextBased())return styledReply(i, {content:'Choose a text channel for the panel.',ephemeral:true});const cats=cfg.categories.length?cfg.categories:[{key:'support',name:'Support',description:'General support',emoji:'🎫'}];const menu=new StringSelectMenuBuilder().setCustomId('lightcore:ticket:create').setPlaceholder('🎫 Select a ticket category').addOptions(cats.slice(0,25).map(x=>({label:x.name.slice(0,100),value:x.key,description:(x.description||'Open a ticket').slice(0,100),emoji:x.emoji||'🎫'})));const box=new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent('# 🎫 '+(cfg.panel_title||'Support Center')+'\n> '+(cfg.panel_message||'Choose a ticket category below.')+'\n\n**Available categories**\n'+cats.map(x=>'• '+(x.emoji||'🎫')+' **'+x.name+'** — '+(x.description||'Support')).join('\n'))).addSeparatorComponents(new SeparatorBuilder().setDivider(true)).addActionRowComponents(new ActionRowBuilder().addComponents(menu));const sent=await ch.send({components:[box],flags:MessageFlags.IsComponentsV2});updateTicketConfig(i.guild.id,{panel_channel_id:ch.id,panel_message_id:sent.id});return styledReply(i, '✅ Ticket panel published in <#'+ch.id+'>.');}
  if(n==='ticketstaff'){if(!guildOnly(i))return;updateTicketConfig(i.guild.id,{staff_role_id:i.options.getRole('role').id});return styledReply(i, '👥 Ticket staff role set.');}
  if(n==='ticketsettings'){if(!guildOnly(i))return;const x=getTicketConfig(i.guild.id);return styledReply(i, '## 🎫 Ticket Settings\nCategory: '+(x.category_id?'<#'+x.category_id+'>':'Not set')+'\nStaff: '+(x.staff_role_id?'<@&'+x.staff_role_id+'>':'Not set')+'\nLogs: '+(x.log_channel_id?'<#'+x.log_channel_id+'>':'Not set')+'\nTranscripts: '+(x.transcript_channel_id?'<#'+x.transcript_channel_id+'>':'Not set')+'\nCategories: '+x.categories.length);}
  if(n==='ticketlogs'){if(!guildOnly(i))return;const x=getTicketConfig(i.guild.id);return styledReply(i, '📜 Ticket logs: '+(x.log_channel_id?'<#'+x.log_channel_id+'>':'Not configured')+'\n📄 Transcripts: '+(x.transcript_channel_id?'<#'+x.transcript_channel_id+'>':'Not configured'));}
  if(n==='ticketstats'){if(!guildOnly(i))return;const rows=listTicketRecords(i.guild.id);return styledReply(i, '📊 Tickets recorded: '+rows.length+'\nOpen: '+rows.filter(x=>!x.closed_at).length+'\nClosed: '+rows.filter(x=>x.closed_at).length);}
  if(n==='ticket'){if(!guildOnly(i))return createTicket(i,client,i.options.getString('reason')||'Support','support');}
  if(n==='ticketclose'){if(!guildOnly(i))return;closeTicketRecord(i.channel.id);await sendTicketLog(i,'closed');return i.channel.delete('Lightcore ticket close');}
  if(n==='ticketclaim'){if(!guildOnly(i))return;claimTicket(i.channel.id,i.user.id);await sendTicketLog(i,'claimed');return styledReply(i, '🙋 Ticket claimed by <@'+i.user.id+'>.');}
  if(n==='ticketunclaim'){if(!guildOnly(i))return;claimTicket(i.channel.id,'');return styledReply(i, '↩️ Ticket unclaimed.');}
  if(n==='ticketadd'||n==='ticketremove'){const m=i.options.getMember('user');if(n==='ticketadd')await i.channel.permissionOverwrites.edit(m.id,{ViewChannel:true,SendMessages:true});else await i.channel.permissionOverwrites.delete(m.id);return styledReply(i, n==='ticketadd'?'➕ Added.':'➖ Removed.');}
  if(n==='giveaway'||n==='giveawayend'||n==='giveawayreroll')return styledReply(i, '🎁 Non-wagering giveaway module is enabled; persistence can be connected to the bot database.');
  if(['balance','daily','work','pay','shop','inventory','leaderboard'].includes(n)){if(!guildOnly(i))return;if(n==='balance')return styledReply(i, '💰 '+wallet(i.guild.id,i.user.id)+' coins.');if(n==='daily'){setWallet(i.guild.id,i.user.id,wallet(i.guild.id,i.user.id)+250);return styledReply(i, '💰 +250 daily coins.');}if(n==='work'){const x=50+Math.floor(Math.random()*151);setWallet(i.guild.id,i.user.id,wallet(i.guild.id,i.user.id)+x);return styledReply(i, '💼 Earned '+x+' coins.');}if(n==='pay'){const u=i.options.getUser('user'),a=i.options.getInteger('amount'),b=wallet(i.guild.id,i.user.id);if(u.id===i.user.id||b<a)return styledReply(i, {content:'Invalid payment or insufficient balance.',ephemeral:true});setWallet(i.guild.id,i.user.id,b-a);setWallet(i.guild.id,u.id,wallet(i.guild.id,u.id)+a);return styledReply(i, '💸 Paid '+a+' coins to <@'+u.id+'>.');}if(n==='shop')return styledReply(i, '🛒 Shop: VIP 1000 coins • Color Role 500 coins.');if(n==='inventory')return styledReply(i, '🎒 Inventory is ready for persistent items.');const rows=[...state.balances.entries()].filter(([k])=>k.startsWith(i.guild.id+':')).sort((a,b)=>b[1]-a[1]).slice(0,10);return styledReply(i, '🏆 '+(rows.map(([k,v],x)=>(x+1)+'. <@'+k.split(':')[1]+'> — '+v).join('\n')||'No balances yet.'));}
  if(['rank','xpgive','levelgive','leaderboardxp'].includes(n)){if(!guildOnly(i))return;if(n==='rank'){const r=xpRow(i.guild.id,i.user.id);return styledReply(i, '⭐ Level '+r.level+' • '+r.xp+' XP');}if(n==='xpgive'){const u=i.options.getUser('user'),r=addXp(i.guild.id,u.id,i.options.getInteger('amount'));return styledReply(i, '⭐ '+u.tag+' is now level '+r.level+'.');}if(n==='levelgive'){const u=i.options.getUser('user'),r=addXp(i.guild.id,u.id,i.options.getInteger('amount')*100);return styledReply(i, '⭐ '+u.tag+' is now level '+r.level+'.');}const rows=[...state.xp.entries()].filter(([k])=>k.startsWith(i.guild.id+':')).sort((a,b)=>b[1].xp-a[1].xp).slice(0,10);return styledReply(i, '🏆 '+(rows.map(([k,v],x)=>(x+1)+'. <@'+k.split(':')[1]+'> — Lv '+v.level).join('\n')||'No XP yet.'));}
  if(n==='coin')return styledReply(i, Math.random()<.5?'🪙 Heads!':'🪙 Tails!');
  if(n==='dice')return styledReply(i, '🎲 '+(1+Math.floor(Math.random()*6)));
  if(n==='8ball')return styledReply(i, '🎱 '+['Definitely.','Probably.','Ask again later.','Not likely.','Absolutely.'][Math.floor(Math.random()*5)]);
  if(n==='joke')return styledReply(i, '😂 Why did the developer bring a ladder? To reach the next level.');
  if(n==='rate'||n==='ship')return styledReply(i, '⭐ '+Math.floor(Math.random()*101)+'%');
  if(n==='rps'){const a=i.options.getString('choice').toLowerCase(),b=['rock','paper','scissors'][Math.floor(Math.random()*3)];if(!['rock','paper','scissors'].includes(a))return styledReply(i, {content:'Choose rock, paper, or scissors.',ephemeral:true});const win=a===b?'Tie':((a==='rock'&&b==='scissors')||(a==='paper'&&b==='rock')||(a==='scissors'&&b==='paper')?'You win':'I win');return styledReply(i, '🎮 '+a+' vs '+b+' — '+win+'!');}
  if(n==='trivia')return styledReply(i, '🎮 Trivia module enabled. Add your question pack/database when ready.');
  if(['play','pause','resume','skip','stop','queue','nowplaying'].includes(n)){if(!guildOnly(i))return;if(n==='play'){const vc=i.member?.voice?.channel;if(!vc)return styledReply(i, {content:'Join a voice channel first.',ephemeral:true});await i.deferReply();try{const t=await playMusic({guild:i.guild,voiceChannel:vc,textChannel:i.channel,query:i.options.getString('song')});return styledEditReply(i, '🎶 Added '+t.title);}catch(e){console.error(e);return styledEditReply(i, '❌ Could not play that track.');}}if(n==='pause')return styledReply(i, pauseMusic(i.guild.id)?'⏸️ Paused.':'Nothing is playing.');if(n==='resume')return styledReply(i, resumeMusic(i.guild.id)?'▶️ Resumed.':'Nothing is paused.');if(n==='skip')return styledReply(i, skipMusic(i.guild.id)?'⏭️ Skipped.':'Nothing is playing.');if(n==='stop')return styledReply(i, stopMusic(i.guild.id)?'⏹️ Stopped.':'Nothing is playing.');const q=getQueue(i.guild.id);return styledReply(i, n==='queue'?'🎵 Queue: '+q.queue.length:'🎵 Now playing: '+(q.current?.title||'Nothing'));}
  if(['userstats','serverstats','statleaderboard','messagestats','voicestats','commandstats','reactionstats','joinstats','leavestats','activity','activeusers','topchatters','topvoice','topcommands','topreactions','firstseen','lastseen'].includes(n)){
    if(!guildOnly(i))return;
    const u=i.options.getUser?.('user')||i.user;
    const map={messagestats:'messages',voicestats:'voice_seconds',commandstats:'commands',reactionstats:'reactions',joinstats:'joins',leavestats:'leaves',topchatters:'messages',topvoice:'voice_seconds',topcommands:'commands',topreactions:'reactions'};
    if(n==='serverstats'){const s=getGuildStats(i.guild.id);return styledReply(i, '## 📊 Server Statistics\n💬 Messages: '+s.messages+'\n⚡ Commands: '+s.commands+'\n📥 Joins: '+s.joins+'\n📤 Leaves: '+s.leaves+'\n👥 Current members: '+i.guild.memberCount);}
    if(n==='userstats'||n==='activity'){const s=getUserStats(i.guild.id,u.id);return styledReply(i, '## 📈 '+u.username+' Statistics\n💬 Messages: '+s.messages+'\n⚡ Commands: '+s.commands+'\n😀 Reactions: '+s.reactions+'\n🔊 Voice: '+Math.floor(s.voice_seconds/60)+' minutes\n📥 Joins: '+s.joins+'\n📤 Leaves: '+s.leaves+'\n🕒 Last seen: '+(s.last_seen?'<t:'+s.last_seen+':R>':'Unknown'));}
    const col=map[n]; if(col){const rows=getTopStats(i.guild.id,col,10);return styledReply(i, '## 🏆 '+col.replace('_',' ')+' leaderboard\n'+(rows.length?rows.map((r,k)=>(k+1)+'. <@'+r.user_id+'> — '+(col==='voice_seconds'?Math.floor(r.value/60)+'m':r.value)).join('\n'):'No activity recorded yet.'));}
    const s=getUserStats(i.guild.id,u.id); const field=n==='firstseen'?'first_seen':'last_seen'; return styledReply(i, '🕒 '+u.username+' '+(field==='first_seen'?'first':'last')+' seen: '+(s[field]?'<t:'+s[field]+':F>':'Unknown'));
  }
  if(n==='counter'){if(!guildOnly(i))return;const ch=i.options.getChannel('channel');const type=i.options.getString('type');const template=i.options.getString('template')||'Members: {value}';addCounter(i.guild.id,ch.id,type,template);await updateCounters(client,i.guild.id);return styledReply(i, '📊 Counter saved in <#'+ch.id+'>.');}
  if(n==='counters'){if(!guildOnly(i))return;const rows=listCounters(i.guild.id);return styledReply(i, '## 📊 Live Counters\n'+(rows.length?rows.map(r=>'• <#'+r.channel_id+'> — '+r.type+' — '+r.template).join('\n'):'No counters configured.'));}
  if(n==='counterremove'){if(!guildOnly(i))return;const ch=i.options.getChannel('channel');removeCounter(i.guild.id,ch.id);return styledReply(i, '🗑️ Counter removed.');}
  if(['best','worst','loved','hated'].includes(n)){const u=i.options.getUser?.('user')||i.user;const title={best:'best at something',worst:'worst at something',loved:'most loved',hated:'most likely to be playfully hated'}[n];return styledReply(i, '🎭 Playful title only — not a real judgment.\n'+u+' is the server’s '+title+' today!');}
  if(n==='premium'||n==='noprefix'){if(i.user.id!==ownerId)return styledReply(i, {content:'Owner only.',ephemeral:true});const sub=i.options.getSubcommand(),u=i.options.getUser('user');if(n==='premium'&&sub==='grantserver'){if(!guildOnly(i))return;const d=i.options.getInteger('days');grantPremium('guild',i.guild.id,d);return styledReply(i,'👑 Granted Premium to this server'+(d?' for '+d+' days':' permanently')+'.');}if(n==='premium'&&sub==='revokeserver'){if(!guildOnly(i))return;revokePremium('guild',i.guild.id);return styledReply(i,'🧹 Server Premium revoked.');}if(n==='premium'&&sub==='serverstatus'){if(!guildOnly(i))return;return styledReply(i,'👑 Server Premium: **'+(isPremium('0',i.guild.id)?'Active':'Inactive')+'**');}if(sub==='grant'){const d=i.options.getInteger('days');n==='premium'?grantPremium('user',u.id,d):grantNoPrefix('user',u.id,d);return styledReply(i, '👑 Granted '+n+' to <@'+u.id+'>.');}if(sub==='revoke'){n==='premium'?revokePremium('user',u.id):revokeNoPrefix('user',u.id);return styledReply(i, '🧹 Revoked '+n+'.');}if(sub==='status')return styledReply(i, '👑 '+n+': '+(n==='premium'?Boolean(premiumExpiry('user',u.id)):hasNoPrefix(u.id,i.guildId)));if(sub==='list')return styledReply(i, '👑 Premium grants: '+listPremium().length);}
  return styledReply(i, {content:'This command is not available in the current core.',ephemeral:true});
}


async function sendTicketLog(i,event){const cfg=getTicketConfig(i.guild.id);const ch=cfg.log_channel_id?i.guild.channels.cache.get(cfg.log_channel_id):null;if(ch?.isTextBased())await ch.send('🎫 **Ticket '+event+'** • '+i.channel+' • <@'+i.user.id+'>').catch(()=>{});}
async function createTicket(i,client,reason='Support',categoryKey='support'){const cfg=getTicketConfig(i.guild.id);const cat=cfg.categories.find(x=>x.key===categoryKey)||{key:categoryKey,name:'Support',description:'Support',emoji:'🎫'};const base='ticket-'+i.user.username.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,14)+'-'+Date.now().toString(36).slice(-4);const overwrites=[{id:i.guild.roles.everyone.id,deny:['ViewChannel']},{id:i.user.id,allow:['ViewChannel','SendMessages','ReadMessageHistory']}];if(cfg.staff_role_id)overwrites.push({id:cfg.staff_role_id,allow:['ViewChannel','SendMessages','ReadMessageHistory']});const ch=await i.guild.channels.create({name:base,type:ChannelType.GuildText,parent:cfg.category_id||undefined,permissionOverwrites:overwrites});createTicketRecord({channelId:ch.id,guildId:i.guild.id,ownerId:i.user.id,category:cat.key});const welcome=String(cfg.welcome_message||'Welcome {user}! A member of our support team will be with you shortly.').replaceAll('{user}','<@'+i.user.id+'>').replaceAll('{category}',cat.name).replaceAll('{reason}',reason);await ch.send('## '+(cat.emoji||'🎫')+' '+cat.name+'\n'+welcome+'\n\n**Reason:** '+reason);await sendTicketLog({guild:i.guild,user:i.user,channel:ch},'created');return styledReply(i, '🎫 Ticket created: <#'+ch.id+'>');}
export async function handleTicketInteraction(i,client){if(!i.customId?.startsWith('lightcore:ticket:'))return false;if(i.customId==='lightcore:ticket:create'&&i.isStringSelectMenu()){await createTicket(i,client,'Support',i.values[0]);return true;}return false;}

export async function updateCounters(client,guildId){const rows=listCounters(guildId);const guild=client.guilds.cache.get(String(guildId));if(!guild)return;for(const row of rows){const ch=guild.channels.cache.get(row.channel_id);if(!ch?.setName)continue;let value=0;if(row.type==='members')value=guild.memberCount;if(row.type==='humans')value=guild.members.cache.filter(m=>!m.user.bot).size;if(row.type==='bots')value=guild.members.cache.filter(m=>m.user.bot).size;if(row.type==='channels')value=guild.channels.cache.size;if(row.type==='roles')value=guild.roles.cache.size-1;const name=String(row.template).replaceAll('{value}',String(value)).slice(0,100);if(ch.name!==name)await ch.setName(name).catch(()=>{});}}

export { handle as default };
