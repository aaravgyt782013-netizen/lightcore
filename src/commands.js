
import {
  SlashCommandBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder,
  StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder,
  TextDisplayBuilder, SeparatorBuilder, MessageFlags, EmbedBuilder
} from 'discord.js';
import { playMusic, pauseMusic, resumeMusic, skipMusic, stopMusic, getQueue } from './music.js';
import { grantPremium, revokePremium, listPremium, premiumExpiry, grantNoPrefix, revokeNoPrefix, hasNoPrefix } from './premium.js';

const ownerId = process.env.OWNER_ID || '1244215702345482301';
const state = {
  warnings: new Map(), afk: new Map(), balances: new Map(), xp: new Map(),
  settings: new Map(), tickets: new Map()
};

const definitions = [
  ['help','utility'],['ping','utility'],['uptime','utility'],['botinfo','utility'],['serverinfo','utility'],
  ['userinfo','utility'],['avatar','utility'],['banner','utility'],['membercount','utility'],['roles','utility'],
  ['channels','utility'],['id','utility'],['timestamp','utility'],['choose','utility'],['remind','utility'],
  ['timer','utility'],['afk','utility'],['stats','utility'],['invite','utility'],['support','utility'],
  ['ban','moderation'],['unban','moderation'],['kick','moderation'],['timeout','moderation'],['untimeout','moderation'],
  ['warn','moderation'],['warnings','moderation'],['clearwarnings','moderation'],['purge','moderation'],
  ['slowmode','moderation'],['lock','moderation'],['unlock','moderation'],['nick','moderation'],
  ['announce','administration'],['say','administration'],['poll','administration'],['rolecreate','administration'],
  ['roledelete','administration'],['roleadd','administration'],['roleremove','administration'],
  ['channelcreate','administration'],['channeldelete','administration'],['setup','administration'],
  ['automod','automod'],['antispam','automod'],['antilink','automod'],['filterword','automod'],
  ['logging','logging'],['welcome','welcome'],['goodbye','welcome'],
  ['ticket','tickets'],['ticketclose','tickets'],['ticketadd','tickets'],['ticketremove','tickets'],['ticketpanel','tickets'],
  ['giveaway','giveaways'],['giveawayend','giveaways'],['giveawayreroll','giveaways'],
  ['balance','economy'],['daily','economy'],['work','economy'],['pay','economy'],['shop','economy'],['inventory','economy'],
  ['leaderboard','economy'],['rank','levels'],['level','levels'],['xpgive','levels'],['levelgive','levels'],['leaderboardxp','levels'],
  ['coin','fun'],['dice','fun'],['8ball','fun'],['joke','fun'],['rate','fun'],['ship','fun'],['rps','games'],['trivia','games'],
  ['play','music'],['pause','music'],['resume','music'],['skip','music'],['stop','music'],['queue','music'],['nowplaying','music'],
  ['premium','owner'],['noprefix','owner']
].map(([name,category]) => ({name,category}));

export const REGISTERED = definitions;
export const CATALOG = REGISTERED;

const emoji = {utility:'🧰',moderation:'🛡️',administration:'⚙️',automod:'🤖',logging:'📜',welcome:'👋',tickets:'🎫',giveaways:'🎁',economy:'💰',levels:'⭐',fun:'🎉',games:'🎮',music:'🎵',owner:'👑'};
const descriptions = Object.fromEntries(definitions.map(x => [x.name, 'Lightcore '+x.name+' command']));

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
  if (['ban','unban','kick','timeout','untimeout','warn','warnings','clearwarnings','nick'].includes(name)) userOption(b);
  if (['ban','kick','warn'].includes(name)) textOption(b,'reason',false);
  if (name === 'timeout') intOption(b,'minutes',true,1,40320);
  if (name === 'nick') textOption(b,'nickname');
  if (name === 'purge') intOption(b,'amount',true,1,100);
  if (name === 'slowmode') intOption(b,'seconds',true,0,21600);
  if (['say','announce','choose','rate','ship'].includes(name)) textOption(b,'text');
  if (name === 'remind') { textOption(b,'duration'); textOption(b,'message'); }
  if (name === 'timer') textOption(b,'duration');
  if (['userinfo','avatar','banner','level'].includes(name)) userOption(b);
  if (name === 'timestamp') textOption(b,'date');
  if (name === 'rolecreate') textOption(b,'name');
  if (name === 'roledelete') b.addRoleOption(o=>o.setName('role').setDescription('Role').setRequired(true));
  if (name === 'roleadd' || name === 'roleremove') { userOption(b); b.addRoleOption(o=>o.setName('role').setDescription('Role').setRequired(true)); }
  if (name === 'channelcreate') { textOption(b,'name'); b.addStringOption(o=>o.setName('type').setDescription('Channel type').addChoices({name:'Text',value:'text'},{name:'Voice',value:'voice'})); }
  if (name === 'channeldelete') b.addChannelOption(o=>o.setName('channel').setDescription('Channel').setRequired(true));
  if (name === 'poll') { textOption(b,'question'); textOption(b,'options'); }
  if (name === 'ticket') textOption(b,'reason',false);
  if (name === 'ticketadd' || name === 'ticketremove') userOption(b);
  if (name === 'giveaway') { textOption(b,'duration'); textOption(b,'prize'); intOption(b,'winners',true,1,20); }
  if (name === 'pay') { userOption(b); intOption(b,'amount',true,1,1000000000); }
  if (name === 'xpgive' || name === 'levelgive') { userOption(b); intOption(b,'amount',true,1,1000000); }
  if (name === 'play') textOption(b,'song');
  if (name === 'rps') textOption(b,'choice');
  if (name === 'timestamp') textOption(b,'date');
  if (name === 'premium' || name === 'noprefix') {
    b.addSubcommand(s=>s.setName('grant').setDescription('Grant access').addUserOption(o=>o.setName('user').setDescription('User').setRequired(true)).addIntegerOption(o=>o.setName('days').setDescription('Days').setMinValue(1).setMaxValue(3650)));
    b.addSubcommand(s=>s.setName('revoke').setDescription('Revoke access').addUserOption(o=>o.setName('user').setDescription('User').setRequired(true)));
    b.addSubcommand(s=>s.setName('status').setDescription('Check access').addUserOption(o=>o.setName('user').setDescription('User').setRequired(true)));
    if (name === 'premium') b.addSubcommand(s=>s.setName('list').setDescription('List premium grants'));
  }
  if (['moderation','administration','automod','logging','welcome','tickets'].includes(category)) b.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild.toString());
  if (['ban','unban','kick','timeout','untimeout','warn','clearwarnings','purge','slowmode','lock','unlock','nick'].includes(name)) b.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers.toString());
  if (category === 'owner') b.setDefaultMemberPermissions(PermissionFlagsBits.Administrator.toString());
  return b;
}

const key=(g,u)=>g+':'+u;
const durationMs=(v)=>{const m=String(v||'').match(/^(\d+)\s*(s|m|h|d|w)$/i);return m?Number(m[1])*({s:1000,m:60000,h:3600000,d:86400000,w:604800000})[m[2].toLowerCase()]:null;};
const wallet=(g,u)=>{const k=key(g,u);if(!state.balances.has(k))state.balances.set(k,100);return state.balances.get(k);};
const setWallet=(g,u,n)=>state.balances.set(key(g,u),Math.max(0,n));
const xpRow=(g,u)=>{const k=key(g,u);if(!state.xp.has(k))state.xp.set(k,{xp:0,level:0});return state.xp.get(k);};
const addXp=(g,u,n)=>{const r=xpRow(g,u);r.xp+=n;r.level=Math.floor(r.xp/100);return r;};
const guildOnly=i=>{if(!i.guild){i.reply({content:'This command is server-only.',ephemeral:true});return false;}return true;};

export function buildHelpPayload(selected='overview') {
  const groups={}; for(const c of REGISTERED)(groups[c.category]??=[]).push(c.name);
  const cats=Object.keys(groups); const safe=selected==='overview'||groups[selected]?selected:'overview';
  const lines=safe==='overview'
    ? ['## ⚡ LIGHTCORE','> All-in-one Discord management bot','', '**Modules**','🛡️ Moderation • ⚙️ Administration • 🤖 AutoMod • 📜 Logging','👋 Welcome • 🎫 Tickets • 🎁 Giveaways • 💰 Economy • ⭐ Levels','🎉 Fun • 🎮 Games • 🎵 Music • 🧰 Utility','', 'Choose a module below to browse its real registered commands.']
    : ['## '+(emoji[safe]||'🔹')+' '+safe.toUpperCase(),'',...(groups[safe]||[]).map(n=>'**/'+n+'** — '+descriptions[n])];
  const menu=new StringSelectMenuBuilder().setCustomId('lightcore:help').setPlaceholder('📚 Choose a module').addOptions(
    {label:'🏠 Overview',value:'overview',description:'Lightcore command center'},
    ...cats.map(c=>({label:(emoji[c]||'🔹')+' '+c,value:c,description:groups[c].length+' commands'}))
  );
  const box=new ContainerBuilder()
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(lines.join('\\n')))
    .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
    .addActionRowComponents(new ActionRowBuilder().addComponents(menu))
    .addActionRowComponents(new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('lightcore:home').setLabel('Home').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('lightcore:ping').setLabel('Ping').setStyle(ButtonStyle.Primary)
    ));
  return {flags:MessageFlags.IsComponentsV2,components:[box]};
}

export async function handleHelpInteraction(i,client) {
  if(!i.isButton()&&!i.isStringSelectMenu())return false;
  if(!i.customId.startsWith('lightcore:'))return false;
  if(i.customId==='lightcore:ping')return i.reply({content:'🏓 Pong! '+client.ws.ping+'ms',ephemeral:true});
  return i.update(buildHelpPayload(i.isStringSelectMenu()?i.values[0]:'overview'));
}

async function moderate(i,name) {
  if(!guildOnly(i))return true;
  const m=i.options.getMember('user'); if(!m)return i.reply({content:'Member not found.',ephemeral:true});
  if(name==='ban'){await m.ban({reason:i.options.getString('reason')||'Lightcore'});return i.reply('🔨 Banned '+m.user.tag);}
  if(name==='unban'){const u=i.options.getUser('user');if(!u)return i.reply({content:'User not found.',ephemeral:true});await i.guild.bans.remove(u.id);return i.reply('🔓 Unbanned '+u.tag);}
  if(name==='kick'){await m.kick(i.options.getString('reason')||'Lightcore');return i.reply('👢 Kicked '+m.user.tag);}
  if(name==='timeout'){const n=i.options.getInteger('minutes');await m.timeout(n*60000,'Lightcore');return i.reply('⏱️ Timed out '+m.user.tag+' for '+n+' minutes.');}
  if(name==='untimeout'){await m.timeout(null,'Lightcore');return i.reply('▶️ Timeout removed.');}
  if(name==='warn'){const k=key(i.guild.id,m.id),a=state.warnings.get(k)||[];a.push({reason:i.options.getString('reason')||'No reason',at:Date.now()});state.warnings.set(k,a);return i.reply('⚠️ Warned '+m.user.tag+'. Total: '+a.length);}
  if(name==='warnings'){const a=state.warnings.get(key(i.guild.id,m.id))||[];return i.reply('⚠️ '+m.user.tag+' has '+a.length+' warning(s).\\n'+a.map((x,n)=>(n+1)+'. '+x.reason).join('\\n'));}
  if(name==='clearwarnings'){state.warnings.delete(key(i.guild.id,m.id));return i.reply('🧹 Warnings cleared.');}
  if(name==='nick'){await m.setNickname(i.options.getString('nickname'));return i.reply('✏️ Nickname updated.');}
}

export async function handle(i,client) {
  const n=i.commandName;
  if(n==='help')return i.reply(buildHelpPayload());
  if(n==='ping')return i.reply('🏓 Pong! '+client.ws.ping+'ms');
  if(n==='uptime')return i.reply('⏱️ Uptime: '+Math.floor(process.uptime())+' seconds');
  if(n==='botinfo')return i.reply('## ⚡ Lightcore\\nDiscord.js: 14.27.0\\nRegistered commands: '+REGISTERED.length+'\\nNode: '+process.version);
  if(n==='stats')return i.reply('📊 Servers: '+client.guilds.cache.size+' • Commands: '+REGISTERED.length+' • Ping: '+client.ws.ping+'ms');
  if(n==='serverinfo'){if(!guildOnly(i))return;const g=i.guild;return i.reply('## 🏠 '+g.name+'\\nMembers: '+g.memberCount+'\\nChannels: '+g.channels.cache.size+'\\nRoles: '+g.roles.cache.size);}
  if(['userinfo','avatar','banner','level'].includes(n)){const u=i.options.getUser('user')||i.user;if(n==='avatar')return i.reply(u.displayAvatarURL({size:1024}));if(n==='banner')return i.reply(u.bannerURL({size:1024})||'No banner.');if(n==='level'){if(!guildOnly(i))return;const r=xpRow(i.guild.id,u.id);return i.reply('⭐ '+u.tag+' • Level '+r.level+' • '+r.xp+' XP');}return i.reply('👤 '+u.tag+' • ID '+u.id);}
  if(n==='membercount'){if(!guildOnly(i))return;i.reply('👥 Members: '+i.guild.memberCount);}
  if(n==='roles'){if(!guildOnly(i))return;i.reply(i.guild.roles.cache.filter(r=>r.name!=='@everyone').map(r=>'<@&'+r.id+'>').slice(0,50).join(' ')||'No roles.');}
  if(n==='channels'){if(!guildOnly(i))return;i.reply(i.guild.channels.cache.map(c=>'<#'+c.id+'>').slice(0,80).join(' ')||'No channels.');}
  if(n==='id')return i.reply('🆔 User: '+i.user.id+(i.guild?' • Server: '+i.guild.id:''));
  if(n==='timestamp'){const raw=i.options.getString('date'),num=Number(raw),d=Number.isFinite(num)?new Date(num*1000):new Date(raw);if(Number.isNaN(d.getTime()))return i.reply({content:'Invalid date.',ephemeral:true});return i.reply('🕒 <t:'+Math.floor(d.getTime()/1000)+':F>');}
  if(n==='choose'){const a=i.options.getString('text').split(',').map(x=>x.trim()).filter(Boolean);return i.reply('🎯 '+(a[Math.floor(Math.random()*a.length)]||'No choices.'));}
  if(n==='invite')return i.reply('🔗 Configure CLIENT_ID in Render and generate the OAuth2 invite from the Discord Developer Portal.');
  if(n==='support')return i.reply(process.env.SUPPORT_URL||'🆘 Set SUPPORT_URL in Render to show your support server.');
  if(n==='remind'||n==='timer'){const ms=durationMs(i.options.getString('duration'));if(!ms)return i.reply({content:'Use 10s, 5m, 1h, or 1d.',ephemeral:true});const msg=n==='remind'?i.options.getString('message'):'Timer finished';await i.reply('⏰ Timer started.');setTimeout(()=>i.followUp('⏰ <@'+i.user.id+'> '+msg).catch(()=>{}),ms);return;}
  if(n==='afk'){if(!guildOnly(i))return;const k=key(i.guild.id,i.user.id);if(state.afk.delete(k))return i.reply('👋 AFK removed.');state.afk.set(k,Date.now());return i.reply('💤 AFK enabled.');}
  if(['ban','unban','kick','timeout','untimeout','warn','warnings','clearwarnings','nick'].includes(n))return moderate(i,n);
  if(n==='purge'){if(!guildOnly(i))return;const x=await i.channel.bulkDelete(i.options.getInteger('amount'),true);return i.reply({content:'🧹 Deleted '+x.size+' messages.',ephemeral:true});}
  if(n==='slowmode'){if(!guildOnly(i))return;await i.channel.setRateLimitPerUser(i.options.getInteger('seconds'));return i.reply('🐢 Slowmode updated.');}
  if(n==='lock'||n==='unlock'){if(!guildOnly(i))return;await i.channel.permissionOverwrites.edit(i.guild.roles.everyone,{SendMessages:n==='lock'?false:null});return i.reply(n==='lock'?'🔒 Locked.':'🔓 Unlocked.');}
  if(n==='say'||n==='announce')return i.reply((n==='announce'?'📢 ':'')+i.options.getString('text'));
  if(n==='poll'){const e=new EmbedBuilder().setTitle('📊 '+i.options.getString('question')).setDescription(i.options.getString('options').split('|').map((x,k)=>(k+1)+'. '+x.trim()).join('\\n'));return i.reply({embeds:[e]});}
  if(n==='rolecreate'){if(!guildOnly(i))return;const r=await i.guild.roles.create({name:i.options.getString('name'),reason:'Lightcore'});return i.reply('🎭 Created <@&'+r.id+'>.');}
  if(n==='roledelete'){if(!guildOnly(i))return;await i.options.getRole('role').delete('Lightcore');return i.reply('🗑️ Role deleted.');}
  if(n==='roleadd'||n==='roleremove'){if(!guildOnly(i))return;const m=i.options.getMember('user'),r=i.options.getRole('role');if(n==='roleadd')await m.roles.add(r);else await m.roles.remove(r);return i.reply(n==='roleadd'?'➕ Role added.':'➖ Role removed.');}
  if(n==='channelcreate'){if(!guildOnly(i))return;const type=i.options.getString('type')==='voice'?ChannelType.GuildVoice:ChannelType.GuildText,c=await i.guild.channels.create({name:i.options.getString('name'),type});return i.reply('📁 Created <#'+c.id+'>.');}
  if(n==='channeldelete'){if(!guildOnly(i))return;await i.options.getChannel('channel').delete('Lightcore');return i.reply('🗑️ Channel deleted.');}
  if(n==='setup')return i.reply('## ⚙️ Lightcore Setup\\nModules: AutoMod • Logging • Welcome • Tickets • Giveaways • Economy • Levels • Music');
  if(['automod','antispam','antilink','filterword','logging','welcome','goodbye'].includes(n)){if(!guildOnly(i))return;state.settings.set(key(i.guild.id,n),true);return i.reply('✅ '+n+' module enabled.');}
  if(n==='ticket'){if(!guildOnly(i))return;const c=await i.guild.channels.create({name:'ticket-'+i.user.username.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,18),type:ChannelType.GuildText,permissionOverwrites:[{id:i.guild.roles.everyone.id,deny:['ViewChannel']},{id:i.user.id,allow:['ViewChannel','SendMessages','ReadMessageHistory']} ]});state.tickets.set(c.id,i.user.id);return i.reply('🎫 Ticket created: <#'+c.id+'>');}
  if(n==='ticketclose'){if(!guildOnly(i))return;return i.channel.delete('Lightcore ticket close');}
  if(n==='ticketadd'||n==='ticketremove'){const m=i.options.getMember('user');if(n==='ticketadd')await i.channel.permissionOverwrites.edit(m.id,{ViewChannel:true,SendMessages:true});else await i.channel.permissionOverwrites.delete(m.id);return i.reply(n==='ticketadd'?'➕ Added.':'➖ Removed.');}
  if(n==='ticketpanel')return i.reply('🎫 Ticket panel enabled. Use /ticket to create a private ticket.');
  if(n==='giveaway'||n==='giveawayend'||n==='giveawayreroll')return i.reply('🎁 Non-wagering giveaway module is enabled; persistence can be connected to the bot database.');
  if(['balance','daily','work','pay','shop','inventory','leaderboard'].includes(n)){if(!guildOnly(i))return;if(n==='balance')return i.reply('💰 '+wallet(i.guild.id,i.user.id)+' coins.');if(n==='daily'){setWallet(i.guild.id,i.user.id,wallet(i.guild.id,i.user.id)+250);return i.reply('💰 +250 daily coins.');}if(n==='work'){const x=50+Math.floor(Math.random()*151);setWallet(i.guild.id,i.user.id,wallet(i.guild.id,i.user.id)+x);return i.reply('💼 Earned '+x+' coins.');}if(n==='pay'){const u=i.options.getUser('user'),a=i.options.getInteger('amount'),b=wallet(i.guild.id,i.user.id);if(u.id===i.user.id||b<a)return i.reply({content:'Invalid payment or insufficient balance.',ephemeral:true});setWallet(i.guild.id,i.user.id,b-a);setWallet(i.guild.id,u.id,wallet(i.guild.id,u.id)+a);return i.reply('💸 Paid '+a+' coins to <@'+u.id+'>.');}if(n==='shop')return i.reply('🛒 Shop: VIP 1000 coins • Color Role 500 coins.');if(n==='inventory')return i.reply('🎒 Inventory is ready for persistent items.');const rows=[...state.balances.entries()].filter(([k])=>k.startsWith(i.guild.id+':')).sort((a,b)=>b[1]-a[1]).slice(0,10);return i.reply('🏆 '+(rows.map(([k,v],x)=>(x+1)+'. <@'+k.split(':')[1]+'> — '+v).join('\\n')||'No balances yet.'));}
  if(['rank','xpgive','levelgive','leaderboardxp'].includes(n)){if(!guildOnly(i))return;if(n==='rank'){const r=xpRow(i.guild.id,i.user.id);return i.reply('⭐ Level '+r.level+' • '+r.xp+' XP');}if(n==='xpgive'){const u=i.options.getUser('user'),r=addXp(i.guild.id,u.id,i.options.getInteger('amount'));return i.reply('⭐ '+u.tag+' is now level '+r.level+'.');}if(n==='levelgive'){const u=i.options.getUser('user'),r=addXp(i.guild.id,u.id,i.options.getInteger('amount')*100);return i.reply('⭐ '+u.tag+' is now level '+r.level+'.');}const rows=[...state.xp.entries()].filter(([k])=>k.startsWith(i.guild.id+':')).sort((a,b)=>b[1].xp-a[1].xp).slice(0,10);return i.reply('🏆 '+(rows.map(([k,v],x)=>(x+1)+'. <@'+k.split(':')[1]+'> — Lv '+v.level).join('\\n')||'No XP yet.'));}
  if(n==='coin')return i.reply(Math.random()<.5?'🪙 Heads!':'🪙 Tails!');
  if(n==='dice')return i.reply('🎲 '+(1+Math.floor(Math.random()*6)));
  if(n==='8ball')return i.reply('🎱 '+['Definitely.','Probably.','Ask again later.','Not likely.','Absolutely.'][Math.floor(Math.random()*5)]);
  if(n==='joke')return i.reply('😂 Why did the developer bring a ladder? To reach the next level.');
  if(n==='rate'||n==='ship')return i.reply('⭐ '+Math.floor(Math.random()*101)+'%');
  if(n==='rps'){const a=i.options.getString('choice').toLowerCase(),b=['rock','paper','scissors'][Math.floor(Math.random()*3)];if(!['rock','paper','scissors'].includes(a))return i.reply({content:'Choose rock, paper, or scissors.',ephemeral:true});const win=a===b?'Tie':((a==='rock'&&b==='scissors')||(a==='paper'&&b==='rock')||(a==='scissors'&&b==='paper')?'You win':'I win');return i.reply('🎮 '+a+' vs '+b+' — '+win+'!');}
  if(n==='trivia')return i.reply('🎮 Trivia module enabled. Add your question pack/database when ready.');
  if(['play','pause','resume','skip','stop','queue','nowplaying'].includes(n)){if(!guildOnly(i))return;if(n==='play'){const vc=i.member?.voice?.channel;if(!vc)return i.reply({content:'Join a voice channel first.',ephemeral:true});await i.deferReply();try{const t=await playMusic({guild:i.guild,voiceChannel:vc,textChannel:i.channel,query:i.options.getString('song')});return i.editReply('🎶 Added '+t.title);}catch(e){console.error(e);return i.editReply('❌ Could not play that track.');}}if(n==='pause')return i.reply(pauseMusic(i.guild.id)?'⏸️ Paused.':'Nothing is playing.');if(n==='resume')return i.reply(resumeMusic(i.guild.id)?'▶️ Resumed.':'Nothing is paused.');if(n==='skip')return i.reply(skipMusic(i.guild.id)?'⏭️ Skipped.':'Nothing is playing.');if(n==='stop')return i.reply(stopMusic(i.guild.id)?'⏹️ Stopped.':'Nothing is playing.');const q=getQueue(i.guild.id);return i.reply(n==='queue'?'🎵 Queue: '+q.queue.length:'🎵 Now playing: '+(q.current?.title||'Nothing'));}
  if(n==='premium'||n==='noprefix'){if(i.user.id!==ownerId)return i.reply({content:'Owner only.',ephemeral:true});const sub=i.options.getSubcommand(),u=i.options.getUser('user');if(sub==='grant'){const d=i.options.getInteger('days');n==='premium'?grantPremium('user',u.id,d):grantNoPrefix('user',u.id,d);return i.reply('👑 Granted '+n+' to <@'+u.id+'>.');}if(sub==='revoke'){n==='premium'?revokePremium('user',u.id):revokeNoPrefix('user',u.id);return i.reply('🧹 Revoked '+n+'.');}if(sub==='status')return i.reply('👑 '+n+': '+(n==='premium'?Boolean(premiumExpiry('user',u.id)):hasNoPrefix(u.id,i.guildId)));if(sub==='list')return i.reply('👑 Premium grants: '+listPremium().length);}
  return i.reply({content:'This command is not available in the current core.',ephemeral:true});
}

export { handle as default };
