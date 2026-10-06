import Database from 'better-sqlite3';

const db = new Database(process.env.LIGHTCORE_DB_PATH || process.env.PREMIUM_DB_PATH || 'lightcore.sqlite');
db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS user_stats (
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  messages INTEGER NOT NULL DEFAULT 0,
  commands INTEGER NOT NULL DEFAULT 0,
  reactions INTEGER NOT NULL DEFAULT 0,
  joins INTEGER NOT NULL DEFAULT 0,
  leaves INTEGER NOT NULL DEFAULT 0,
  voice_seconds INTEGER NOT NULL DEFAULT 0,
  first_seen INTEGER,
  last_seen INTEGER,
  PRIMARY KEY (guild_id, user_id)
);
CREATE TABLE IF NOT EXISTS guild_stats (
  guild_id TEXT PRIMARY KEY,
  messages INTEGER NOT NULL DEFAULT 0,
  commands INTEGER NOT NULL DEFAULT 0,
  joins INTEGER NOT NULL DEFAULT 0,
  leaves INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
CREATE TABLE IF NOT EXISTS counters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  type TEXT NOT NULL,
  template TEXT NOT NULL,
  UNIQUE(guild_id, channel_id)
);
`);

function ensureUser(guildId,userId){
  const now=Math.floor(Date.now()/1000);
  db.prepare(`INSERT INTO user_stats(guild_id,user_id,first_seen,last_seen) VALUES(?,?,?,?)
    ON CONFLICT(guild_id,user_id) DO UPDATE SET last_seen=excluded.last_seen`).run(String(guildId),String(userId),now,now);
}
function ensureGuild(guildId){
  db.prepare(`INSERT INTO guild_stats(guild_id) VALUES(?) ON CONFLICT(guild_id) DO NOTHING`).run(String(guildId));
}
export function recordMessage(guildId,userId){
  ensureUser(guildId,userId); ensureGuild(guildId);
  db.prepare('UPDATE user_stats SET messages=messages+1,last_seen=? WHERE guild_id=? AND user_id=?').run(Math.floor(Date.now()/1000),String(guildId),String(userId));
  db.prepare('UPDATE guild_stats SET messages=messages+1 WHERE guild_id=?').run(String(guildId));
}
export function recordCommand(guildId,userId){
  ensureUser(guildId,userId); ensureGuild(guildId);
  db.prepare('UPDATE user_stats SET commands=commands+1,last_seen=? WHERE guild_id=? AND user_id=?').run(Math.floor(Date.now()/1000),String(guildId),String(userId));
  db.prepare('UPDATE guild_stats SET commands=commands+1 WHERE guild_id=?').run(String(guildId));
}
export function recordReaction(guildId,userId){
  ensureUser(guildId,userId);
  db.prepare('UPDATE user_stats SET reactions=reactions+1,last_seen=? WHERE guild_id=? AND user_id=?').run(Math.floor(Date.now()/1000),String(guildId),String(userId));
}
export function recordJoin(guildId,userId){
  ensureUser(guildId,userId); ensureGuild(guildId);
  db.prepare('UPDATE user_stats SET joins=joins+1,last_seen=? WHERE guild_id=? AND user_id=?').run(Math.floor(Date.now()/1000),String(guildId),String(userId));
  db.prepare('UPDATE guild_stats SET joins=joins+1 WHERE guild_id=?').run(String(guildId));
}
export function recordLeave(guildId,userId){
  ensureUser(guildId,userId); ensureGuild(guildId);
  db.prepare('UPDATE user_stats SET leaves=leaves+1,last_seen=? WHERE guild_id=? AND user_id=?').run(Math.floor(Date.now()/1000),String(guildId),String(userId));
  db.prepare('UPDATE guild_stats SET leaves=leaves+1 WHERE guild_id=?').run(String(guildId));
}
export function addVoiceSeconds(guildId,userId,seconds){
  if(!seconds||seconds<1)return;
  ensureUser(guildId,userId);
  db.prepare('UPDATE user_stats SET voice_seconds=voice_seconds+?,last_seen=? WHERE guild_id=? AND user_id=?').run(Math.floor(seconds),Math.floor(Date.now()/1000),String(guildId),String(userId));
}
export function getUserStats(guildId,userId){
  ensureUser(guildId,userId);
  return db.prepare('SELECT * FROM user_stats WHERE guild_id=? AND user_id=?').get(String(guildId),String(userId));
}
export function getGuildStats(guildId){
  ensureGuild(guildId);
  return db.prepare('SELECT * FROM guild_stats WHERE guild_id=?').get(String(guildId));
}
export function getTopStats(guildId,column,limit=10){
  const allowed=['messages','commands','reactions','voice_seconds','joins','leaves'];
  if(!allowed.includes(column)) throw new Error('Invalid stats column');
  return db.prepare('SELECT user_id, '+column+' AS value FROM user_stats WHERE guild_id=? ORDER BY '+column+' DESC LIMIT ?').all(String(guildId),Math.max(1,Math.min(25,limit)));
}
export function addCounter(guildId,channelId,type,template){
  db.prepare('INSERT INTO counters(guild_id,channel_id,type,template) VALUES(?,?,?,?) ON CONFLICT(guild_id,channel_id) DO UPDATE SET type=excluded.type,template=excluded.template').run(String(guildId),String(channelId),String(type),String(template));
}
export function removeCounter(guildId,channelId){
  return db.prepare('DELETE FROM counters WHERE guild_id=? AND channel_id=?').run(String(guildId),String(channelId)).changes>0;
}
export function listCounters(guildId){
  return db.prepare('SELECT * FROM counters WHERE guild_id=? ORDER BY id').all(String(guildId));
}
export function closeStatsDb(){db.close();}
