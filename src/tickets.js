import Database from 'better-sqlite3';
import { cardMessage } from './ui.js';

const db = new Database(process.env.LIGHTCORE_DB_PATH || process.env.PREMIUM_DB_PATH || 'lightcore.sqlite');
db.exec(`
CREATE TABLE IF NOT EXISTS ticket_config (
 guild_id TEXT PRIMARY KEY,
 category_id TEXT,
 log_channel_id TEXT,
 transcript_channel_id TEXT,
 staff_role_id TEXT,
 panel_channel_id TEXT,
 panel_message_id TEXT,
 panel_title TEXT DEFAULT 'Support Center',
 panel_message TEXT DEFAULT 'Choose a ticket category below.',
 welcome_message TEXT DEFAULT 'Welcome {user}! A member of our support team will be with you shortly.',
 categories TEXT NOT NULL DEFAULT '[]'
);
CREATE TABLE IF NOT EXISTS ticket_records (
 channel_id TEXT PRIMARY KEY,
 guild_id TEXT NOT NULL,
 owner_id TEXT NOT NULL,
 category TEXT NOT NULL,
 claimed_by TEXT,
 created_at INTEGER NOT NULL,
 closed_at INTEGER
);
`);

function ensure(guildId){db.prepare('INSERT INTO ticket_config(guild_id) VALUES(?) ON CONFLICT(guild_id) DO NOTHING').run(String(guildId));}
export function getTicketConfig(guildId){ensure(guildId);const r=db.prepare('SELECT * FROM ticket_config WHERE guild_id=?').get(String(guildId));try{r.categories=JSON.parse(r.categories||'[]')}catch{r.categories=[]}return r;}
export function updateTicketConfig(guildId, patch){ensure(guildId);const allowed=['category_id','log_channel_id','transcript_channel_id','staff_role_id','panel_channel_id','panel_message_id','panel_title','panel_message','welcome_message'];const sets=[];const vals=[];for(const k of allowed)if(patch[k]!==undefined){sets.push(k+'=?');vals.push(patch[k])}if(patch.categories!==undefined){sets.push('categories=?');vals.push(JSON.stringify(patch.categories))}if(sets.length)db.prepare('UPDATE ticket_config SET '+sets.join(',')+' WHERE guild_id=?').run(...vals,String(guildId));return getTicketConfig(guildId);}
export function addTicketCategory(guildId,category){const c=getTicketConfig(guildId);const key=String(category.key||category.name).toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,40);c.categories=c.categories.filter(x=>x.key!==key);c.categories.push({key,name:String(category.name).slice(0,80),description:String(category.description||'').slice(0,100),emoji:category.emoji||'🎫'});return updateTicketConfig(guildId,{categories:c.categories});}
export function removeTicketCategory(guildId,key){const c=getTicketConfig(guildId);return updateTicketConfig(guildId,{categories:c.categories.filter(x=>x.key!==String(key).toLowerCase())});}
export function createTicketRecord(row){db.prepare('INSERT OR REPLACE INTO ticket_records(channel_id,guild_id,owner_id,category,created_at) VALUES(?,?,?,?,?)').run(row.channelId,row.guildId,row.ownerId,row.category,Math.floor(Date.now()/1000));}
export function getTicketRecord(channelId){return db.prepare('SELECT * FROM ticket_records WHERE channel_id=?').get(String(channelId));}
export function closeTicketRecord(channelId){db.prepare('UPDATE ticket_records SET closed_at=? WHERE channel_id=?').run(Math.floor(Date.now()/1000),String(channelId));}
export function claimTicket(channelId,userId){db.prepare('UPDATE ticket_records SET claimed_by=? WHERE channel_id=?').run(String(userId),String(channelId));}
export function listTicketRecords(guildId){return db.prepare('SELECT * FROM ticket_records WHERE guild_id=? ORDER BY created_at DESC LIMIT 100').all(String(guildId));}
