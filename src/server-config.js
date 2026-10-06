import Database from 'better-sqlite3';

const db = new Database(process.env.LIGHTCORE_DB_PATH || process.env.PREMIUM_DB_PATH || 'lightcore.sqlite');
db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS guild_settings (
  guild_id TEXT PRIMARY KEY,
  welcome_channel_id TEXT,
  welcome_message TEXT,
  autoresponders TEXT NOT NULL DEFAULT '{}'
);
`);

function ensure(guildId) {
  db.prepare('INSERT INTO guild_settings(guild_id) VALUES (?) ON CONFLICT(guild_id) DO NOTHING').run(String(guildId));
}
function row(guildId) {
  ensure(guildId);
  return db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?').get(String(guildId));
}
export function getWelcome(guildId) {
  const r=row(guildId);
  return { channelId:r.welcome_channel_id, message:r.welcome_message };
}
export function setWelcome(guildId, channelId, message) {
  ensure(guildId);
  db.prepare('UPDATE guild_settings SET welcome_channel_id=?, welcome_message=? WHERE guild_id=?').run(channelId, message, String(guildId));
}
export function clearWelcome(guildId) {
  ensure(guildId);
  db.prepare('UPDATE guild_settings SET welcome_channel_id=NULL, welcome_message=NULL WHERE guild_id=?').run(String(guildId));
}
export function getAutoresponders(guildId) {
  try { return JSON.parse(row(guildId).autoresponders || '{}'); } catch { return {}; }
}
export function setAutoresponder(guildId, trigger, response) {
  const data=getAutoresponders(guildId);
  data[String(trigger).toLowerCase()]=String(response);
  db.prepare('UPDATE guild_settings SET autoresponders=? WHERE guild_id=?').run(JSON.stringify(data), String(guildId));
}
export function removeAutoresponder(guildId, trigger) {
  const data=getAutoresponders(guildId);
  delete data[String(trigger).toLowerCase()];
  db.prepare('UPDATE guild_settings SET autoresponders=? WHERE guild_id=?').run(JSON.stringify(data), String(guildId));
}
