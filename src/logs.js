import Database from 'better-sqlite3';
const db=new Database(process.env.LIGHTCORE_DB_PATH||process.env.PREMIUM_DB_PATH||'lightcore.sqlite');
db.exec('CREATE TABLE IF NOT EXISTS log_config(guild_id TEXT PRIMARY KEY, channel_id TEXT, events TEXT NOT NULL DEFAULT "all")');
db.exec('CREATE TABLE IF NOT EXISTS log_routes(guild_id TEXT NOT NULL, event TEXT NOT NULL, channel_id TEXT NOT NULL, PRIMARY KEY(guild_id,event))');

export function setLogChannel(guildId,channelId,events='all'){
  const gid=String(guildId), cid=String(channelId);
  const keys=String(events||'all').split(',').map(x=>x.trim()).filter(Boolean);
  db.prepare('INSERT INTO log_config(guild_id,channel_id,events) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET channel_id=excluded.channel_id,events=excluded.events').run(gid,cid,events);
  for(const event of keys){
    db.prepare('INSERT INTO log_routes(guild_id,event,channel_id) VALUES(?,?,?) ON CONFLICT(guild_id,event) DO UPDATE SET channel_id=excluded.channel_id').run(gid,event,cid);
  }
}

export function getLogConfig(guildId){return db.prepare('SELECT * FROM log_config WHERE guild_id=?').get(String(guildId));}

export function getLogChannel(guildId,event){
  const gid=String(guildId), key=String(event||'').toLowerCase();
  const specific=db.prepare('SELECT channel_id FROM log_routes WHERE guild_id=? AND event=?').get(gid,key);
  if(specific?.channel_id)return specific.channel_id;
  const all=db.prepare('SELECT channel_id FROM log_routes WHERE guild_id=? AND event=?').get(gid,'all');
  if(all?.channel_id)return all.channel_id;
  const config=db.prepare('SELECT channel_id FROM log_config WHERE guild_id=?').get(gid);
  return config?.channel_id||null;
}

export function clearLogRoutes(guildId){
  db.prepare('DELETE FROM log_routes WHERE guild_id=?').run(String(guildId));
  db.prepare('DELETE FROM log_config WHERE guild_id=?').run(String(guildId));
}