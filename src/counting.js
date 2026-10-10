import Database from 'better-sqlite3';

const db = new Database(process.env.LIGHTCORE_DB_PATH || process.env.PREMIUM_DB_PATH || 'lightcore.sqlite');
db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS counting_config (
  guild_id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL,
  current_count INTEGER NOT NULL DEFAULT 0,
  highest_count INTEGER NOT NULL DEFAULT 0,
  last_user_id TEXT,
  mistakes INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS counting_user_stats (
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  correct_counts INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (guild_id, user_id)
);
`);

const getConfigStmt = db.prepare('SELECT * FROM counting_config WHERE guild_id = ?');
export function getCountingConfig(guildId) {
  return getConfigStmt.get(String(guildId)) || null;
}

export function configureCounting(guildId, channelId) {
  db.prepare(`INSERT INTO counting_config(guild_id, channel_id) VALUES(?, ?)
    ON CONFLICT(guild_id) DO UPDATE SET channel_id=excluded.channel_id, current_count=0, last_user_id=NULL`)
    .run(String(guildId), String(channelId));
  return getCountingConfig(guildId);
}

export function resetCounting(guildId) {
  db.prepare('UPDATE counting_config SET current_count=0, last_user_id=NULL WHERE guild_id=?')
    .run(String(guildId));
  return getCountingConfig(guildId);
}

export function getCountingLeaderboard(guildId, limit = 10) {
  return db.prepare(`SELECT user_id, correct_counts FROM counting_user_stats
    WHERE guild_id=? ORDER BY correct_counts DESC, user_id ASC LIMIT ?`)
    .all(String(guildId), Math.max(1, Math.min(10, Number(limit) || 10)));
}

// Returns true when a message was consumed by the configured counting channel.
export async function processCountingMessage(message, prefix = '.') {
  if (!message.guild || message.author.bot) return false;
  const config = getCountingConfig(message.guild.id);
  if (!config || message.channelId !== config.channel_id) return false;

  const content = String(message.content || '').trim();
  // Let Lightcore commands continue to work even if the counting channel is configured.
  if (!content || content.startsWith(prefix)) return false;

  const number = /^\d+$/.test(content) ? Number(content) : NaN;
  const expected = config.current_count + 1;
  const sameUser = config.last_user_id === message.author.id;
  if (!Number.isSafeInteger(number) || number !== expected || sameUser) {
    await message.delete().catch(() => {});
    db.prepare(`UPDATE counting_config SET current_count=0, last_user_id=NULL, mistakes=mistakes+1
      WHERE guild_id=?`).run(String(message.guild.id));
    await message.channel.send(
      '❌ ' + (sameUser ? 'You cannot count twice in a row!' : 'That was the wrong number!') +
      ' The count has reset to **0**. The next valid count is **1**.'
    ).catch(() => {});
    return true;
  }

  db.prepare(`UPDATE counting_config
    SET current_count=?, highest_count=MAX(highest_count, ?), last_user_id=?
    WHERE guild_id=?`).run(number, number, String(message.author.id), String(message.guild.id));
  db.prepare(`INSERT INTO counting_user_stats(guild_id,user_id,correct_counts) VALUES(?,?,1)
    ON CONFLICT(guild_id,user_id) DO UPDATE SET correct_counts=correct_counts+1`)
    .run(String(message.guild.id), String(message.author.id));

  if (number % 100 === 0) {
    await message.react('💯').catch(() => {});
  } else {
    await message.react('✅').catch(() => {});
  }
  return true;
}
