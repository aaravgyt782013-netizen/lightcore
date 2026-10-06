import Database from 'better-sqlite3';

const db = new Database(process.env.LIGHTCORE_DB_PATH || process.env.PREMIUM_DB_PATH || 'lightcore.sqlite');
db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS leveling_config (
 guild_id TEXT PRIMARY KEY,
 enabled INTEGER NOT NULL DEFAULT 1,
 xp_min INTEGER NOT NULL DEFAULT 15,
 xp_max INTEGER NOT NULL DEFAULT 25,
 cooldown INTEGER NOT NULL DEFAULT 60,
 levelup_channel_id TEXT,
 levelup_message TEXT NOT NULL DEFAULT '🎉 GG {user}! You reached **Level {level}**!',
 levelup_enabled INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS leveling_users (
 guild_id TEXT NOT NULL,
 user_id TEXT NOT NULL,
 xp INTEGER NOT NULL DEFAULT 0,
 level INTEGER NOT NULL DEFAULT 0,
 PRIMARY KEY(guild_id,user_id)
);
CREATE TABLE IF NOT EXISTS level_rewards (
 guild_id TEXT NOT NULL,
 level INTEGER NOT NULL,
 role_id TEXT NOT NULL,
 PRIMARY KEY(guild_id,level)
);
`);

const defaults = {enabled:1,xp_min:15,xp_max:25,cooldown:60,levelup_channel_id:null,levelup_message:'🎉 GG {user}! You reached **Level {level}**!',levelup_enabled:1};
const key=(g,u)=>[String(g),String(u)];
function ensure(g){db.prepare(`INSERT INTO leveling_config(guild_id) VALUES(?) ON CONFLICT(guild_id) DO NOTHING`).run(String(g));}
function cfg(g){ensure(g);return {...defaults,...db.prepare('SELECT * FROM leveling_config WHERE guild_id=?').get(String(g))};}
export function getLevelConfig(g){return cfg(g);}
export function updateLevelConfig(g,patch){ensure(g);const allowed=['enabled','xp_min','xp_max','cooldown','levelup_channel_id','levelup_message','levelup_enabled'];const sets=[];const vals=[];for(const k of allowed)if(patch[k]!==undefined){sets.push(k+'=?');vals.push(patch[k]);}if(sets.length)db.prepare('UPDATE leveling_config SET '+sets.join(',')+' WHERE guild_id=?').run(...vals,String(g));return cfg(g);}
export function getLevelUser(g,u){const [gid,uid]=key(g,u);db.prepare('INSERT INTO leveling_users(guild_id,user_id) VALUES(?,?) ON CONFLICT(guild_id,user_id) DO NOTHING').run(gid,uid);return db.prepare('SELECT * FROM leveling_users WHERE guild_id=? AND user_id=?').get(gid,uid);}
function xpNeeded(level){return 100 + (level*50);}
export function addXP(g,u,amount){const row=getLevelUser(g,u);let xp=row.xp+Math.max(0,Math.floor(amount));let level=row.level;let gained=0;while(xp>=xpNeeded(level)){xp-=xpNeeded(level);level++;gained++;}db.prepare('UPDATE leveling_users SET xp=?,level=? WHERE guild_id=? AND user_id=?').run(xp,level,String(g),String(u));return {before:row.level,level,xp,needed:xpNeeded(level),levelsGained:gained};}
export function setXP(g,u,xp){const n=Math.max(0,Math.floor(Number(xp)||0));let level=0,remaining=n;while(remaining>=xpNeeded(level)){remaining-=xpNeeded(level);level++;}db.prepare('INSERT INTO leveling_users(guild_id,user_id,xp,level) VALUES(?,?,?,?) ON CONFLICT(guild_id,user_id) DO UPDATE SET xp=excluded.xp,level=excluded.level').run(String(g),String(u),remaining,level);return getLevelUser(g,u);}
export function addLevelReward(g,level,role){db.prepare('INSERT INTO level_rewards(guild_id,level,role_id) VALUES(?,?,?) ON CONFLICT(guild_id,level) DO UPDATE SET role_id=excluded.role_id').run(String(g),Number(level),String(role));}
export function removeLevelReward(g,level){db.prepare('DELETE FROM level_rewards WHERE guild_id=? AND level=?').run(String(g),Number(level));}
export function getLevelRewards(g){return db.prepare('SELECT * FROM level_rewards WHERE guild_id=? ORDER BY level').all(String(g));}
export function getRewardsAtLevel(g,level){return db.prepare('SELECT * FROM level_rewards WHERE guild_id=? AND level=?').all(String(g),Number(level));}
export function replacePlaceholders(template,member,level){return String(template).replaceAll('{user}','<@'+member.id+'>').replaceAll('{username}',member.user.username).replaceAll('{level}',String(level)).replaceAll('{server}',member.guild.name);}
export function levelProgress(g,u){const row=getLevelUser(g,u);return {level:row.level,xp:row.xp,needed:xpNeeded(row.level),percent:Math.min(100,Math.round((row.xp/xpNeeded(row.level))*100))};}
