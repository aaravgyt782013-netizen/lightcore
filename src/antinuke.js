import Database from 'better-sqlite3';
const db=new Database(process.env.LIGHTCORE_DB_PATH||process.env.PREMIUM_DB_PATH||'lightcore.sqlite');
db.exec("CREATE TABLE IF NOT EXISTS antinuke_config (guild_id TEXT PRIMARY KEY, enabled INTEGER NOT NULL DEFAULT 0, action TEXT NOT NULL DEFAULT 'strip', window_ms INTEGER NOT NULL DEFAULT 10000, threshold INTEGER NOT NULL DEFAULT 3, ban_create INTEGER NOT NULL DEFAULT 1, ban_delete INTEGER NOT NULL DEFAULT 3, kick INTEGER NOT NULL DEFAULT 3, role_create INTEGER NOT NULL DEFAULT 3, role_delete INTEGER NOT NULL DEFAULT 3, channel_create INTEGER NOT NULL DEFAULT 3, channel_delete INTEGER NOT NULL DEFAULT 3, webhook_create INTEGER NOT NULL DEFAULT 3, webhook_delete INTEGER NOT NULL DEFAULT 3, bot_add INTEGER NOT NULL DEFAULT 1, bypass TEXT NOT NULL DEFAULT '[]')");
const defaults={enabled:0,action:'strip',window_ms:10000,threshold:3,ban_create:1,ban_delete:3,kick:3,role_create:3,role_delete:3,channel_create:3,channel_delete:3,webhook_create:3,webhook_delete:3,bot_add:1,bypass:[]};
function row(gid){let r=db.prepare('SELECT * FROM antinuke_config WHERE guild_id=?').get(gid);if(!r){db.prepare('INSERT INTO antinuke_config(guild_id,bypass) VALUES(?,?)').run(gid,'[]');r=db.prepare('SELECT * FROM antinuke_config WHERE guild_id=?').get(gid);}return {...r,bypass:JSON.parse(r.bypass||'[]')};}
export function getAntiNukeStatus(gid){return row(gid);}
export function resetAntiNuke(gid){db.prepare('DELETE FROM antinuke_config WHERE guild_id=?').run(gid);row(gid);}
export function configureAntiNuke(gid,action,value){const allowed=['threshold','window_ms','ban_create','ban_delete','kick','role_create','role_delete','channel_create','channel_delete','webhook_create','webhook_delete','bot_add'];row(gid);if(action==='on'||action==='enable')db.prepare('UPDATE antinuke_config SET enabled=1 WHERE guild_id=?').run(gid);else if(action==='off'||action==='disable')db.prepare('UPDATE antinuke_config SET enabled=0 WHERE guild_id=?').run(gid);else if(action==='action'&&['strip','ban','kick'].includes(value))db.prepare('UPDATE antinuke_config SET action=? WHERE guild_id=?').run(value,gid);else if(allowed.includes(action)){const n=action==='window_ms'?Math.max(1000,Math.min(60000,Number(value)||10000)):Math.max(1,Math.min(25,Number(value)||1));db.prepare('UPDATE antinuke_config SET '+action+'=? WHERE guild_id=?').run(n,gid);}return row(gid);}
export function changeAntiNukeBypass(gid,uid,action='add'){const r=row(gid);const set=new Set(r.bypass);if(action==='remove'||action==='delete')set.delete(uid);else set.add(uid);db.prepare('UPDATE antinuke_config SET bypass=? WHERE guild_id=?').run(JSON.stringify([...set]),gid);return [...set];}
export function isAntiNukeBypassed(gid,uid){return row(gid).bypass.includes(uid);}
export function antiNukeStatusText(gid){const r=row(gid);return '**Protection:** '+(r.enabled?'🟢 Enabled':'🔴 Disabled')+'\n**Response:** `'+r.action+'`\n**Window:** '+(r.window_ms/1000)+'s\n**Default threshold:** '+r.threshold+' actions\n**Trusted bypasses:** '+r.bypass.length+'\n\nUse `antinukeconfig` to change limits.';}
export function antiNukeConfigText(gid,action,value){const r=configureAntiNuke(gid,action,value);return '🛡️ **Anti-Nuke updated**\n`'+action+'` → `'+(value??'updated')+'`\n\nProtection: **'+(r.enabled?'ON':'OFF')+'** • Response: `'+r.action+'`';}
export function antiNukeWhitelistText(gid,uid,action){const r=row(gid);return (action==='remove'?'🧹 **Whitelist removed**':'✅ **Member whitelisted**')+'\n\n**Member:** <@'+uid+'>\n**Anti-Nuke bypass:** '+(action==='remove'?'Disabled':'Enabled')+'\n\n**Recommended staff permissions for a trusted security member:**\n• View Audit Log\n• Manage Server\n• Manage Channels\n• Manage Roles\n• Kick Members\n• Ban Members\n• Moderate Members\n• Manage Webhooks\n\n⚠️ Whitelisting only bypasses Lightcore Anti-Nuke. It does **not** grant these Discord permissions automatically.\n\n**Current whitelisted members:** '+r.bypass.length;}
export function antiNukeBypassText(gid,uid,action){return '🛡️ Trusted bypass **'+(action==='remove'?'removed':'added')+'** for <@'+uid+'>.';}
export function antiNukeThreshold(gid,event){const r=row(gid);return Number(r[event]||r.threshold);}
const buckets=new Map();
export function antiNukeCheck(gid,actorId,event){
  const cfg=row(gid);
  if(!cfg.enabled || cfg.bypass.includes(actorId)) return {triggered:false,config:cfg,count:0};
  const now=Date.now(), key=gid+':'+actorId+':'+event;
  const arr=(buckets.get(key)||[]).filter(t=>now-t<cfg.window_ms);
  arr.push(now); buckets.set(key,arr);
  const threshold=Number(cfg[event]||cfg.threshold);
  return {triggered:arr.length>=threshold,config:cfg,count:arr.length};
}
