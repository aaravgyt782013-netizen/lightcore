import Database from 'better-sqlite3';
const db=new Database(process.env.LIGHTCORE_DB_PATH||process.env.PREMIUM_DB_PATH||'lightcore.sqlite');
db.exec('CREATE TABLE IF NOT EXISTS log_config(guild_id TEXT PRIMARY KEY, channel_id TEXT, events TEXT NOT NULL DEFAULT "all")');
export function setLogChannel(guildId,channelId,events='all'){db.prepare('INSERT INTO log_config(guild_id,channel_id,events) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET channel_id=excluded.channel_id,events=excluded.events').run(String(guildId),String(channelId),events);}
export function getLogConfig(guildId){return db.prepare('SELECT * FROM log_config WHERE guild_id=?').get(String(guildId));}
