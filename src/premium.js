import Database from 'better-sqlite3';

const db = new Database(process.env.PREMIUM_DB_PATH || 'lightcore.sqlite');
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS premium_entitlements (
  scope TEXT NOT NULL,
  scope_id TEXT NOT NULL,
  expires_at INTEGER,
  PRIMARY KEY (scope, scope_id)
);
CREATE TABLE IF NOT EXISTS noprefix_entitlements (
  scope TEXT NOT NULL,
  scope_id TEXT NOT NULL,
  expires_at INTEGER,
  PRIMARY KEY (scope, scope_id)
);
`);

function active(table, scope, scopeId) {
  const row = db.prepare(`SELECT expires_at FROM ${table} WHERE scope = ? AND scope_id = ?`).get(scope, String(scopeId));
  if (!row) return false;
  if (row.expires_at !== null && row.expires_at <= Date.now()) {
    db.prepare(`DELETE FROM ${table} WHERE scope = ? AND scope_id = ?`).run(scope, String(scopeId));
    return false;
  }
  return true;
}

export function isPremium(userId, guildId) {
  return active('premium_entitlements', 'user', userId) ||
    (guildId ? active('premium_entitlements', 'guild', guildId) : false);
}

export function hasNoPrefix(userId, guildId) {
  return active('noprefix_entitlements', 'user', userId) ||
    (guildId ? active('noprefix_entitlements', 'guild', guildId) : false);
}

export function grantPremium(scope, scopeId, days = null) {
  const expiresAt = days ? Date.now() + Number(days) * 86400000 : null;
  db.prepare('INSERT INTO premium_entitlements(scope, scope_id, expires_at) VALUES (?, ?, ?) ON CONFLICT(scope, scope_id) DO UPDATE SET expires_at=excluded.expires_at')
    .run(scope, String(scopeId), expiresAt);
  if (scope === 'user') grantNoPrefix('user', scopeId, days);
  if (scope === 'guild') grantNoPrefix('guild', scopeId, days);
}

export function revokePremium(scope, scopeId) {
  db.prepare('DELETE FROM premium_entitlements WHERE scope = ? AND scope_id = ?').run(scope, String(scopeId));
  if (scope === 'user') revokeNoPrefix('user', scopeId);
  if (scope === 'guild') revokeNoPrefix('guild', scopeId);
}

export function grantNoPrefix(scope, scopeId, days = null) {
  const expiresAt = days ? Date.now() + Number(days) * 86400000 : null;
  db.prepare('INSERT INTO noprefix_entitlements(scope, scope_id, expires_at) VALUES (?, ?, ?) ON CONFLICT(scope, scope_id) DO UPDATE SET expires_at=excluded.expires_at')
    .run(scope, String(scopeId), expiresAt);
}

export function revokeNoPrefix(scope, scopeId) {
  db.prepare('DELETE FROM noprefix_entitlements WHERE scope = ? AND scope_id = ?').run(scope, String(scopeId));
}

export function listPremium() {
  return db.prepare('SELECT scope, scope_id, expires_at FROM premium_entitlements ORDER BY scope, scope_id').all();
}

export function premiumExpiry(scope, scopeId) {
  const row = db.prepare('SELECT expires_at FROM premium_entitlements WHERE scope = ? AND scope_id = ?').get(scope, String(scopeId));
  return row?.expires_at ?? null;
}

export function closePremiumDb() {
  db.close();
}
