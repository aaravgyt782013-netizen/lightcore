const parseJsonEnv = (name, fallback) => {
  try { return process.env[name] ? JSON.parse(process.env[name]) : fallback; }
  catch (error) { console.error(`Invalid ${name} JSON:`, error.message); return fallback; }
};

const responderRules = parseJsonEnv('AUTO_RESPONDER_JSON', {});
const reactorRules = parseJsonEnv('AUTO_REACTOR_JSON', {});
const cooldownMs = Math.max(0, Number(process.env.AUTO_RESPONDER_COOLDOWN_MS || 3000));
const responderCooldown = new Map();
const reactorCooldown = new Map();

function findTrigger(content, rules) {
  const lower = content.toLowerCase();
  return Object.keys(rules).find(trigger => lower.includes(String(trigger).toLowerCase()));
}

function allowed(map, key) {
  const now = Date.now();
  const last = map.get(key) || 0;
  if (now - last < cooldownMs) return false;
  map.set(key, now);
  return true;
}

export async function runAutoResponder(message) {
  const trigger = findTrigger(message.content, responderRules);
  if (!trigger) return;
  const key = `${message.guildId}:${message.author.id}:${trigger.toLowerCase()}`;
  if (!allowed(responderCooldown, key)) return;
  const response = responderRules[trigger];
  if (typeof response === 'string' && response.trim()) await message.reply(response).catch(() => {});
}

export async function runAutoReactor(message) {
  const trigger = findTrigger(message.content, reactorRules);
  if (!trigger) return;
  const key = `${message.guildId}:${message.author.id}:${trigger.toLowerCase()}`;
  if (!allowed(reactorCooldown, key)) return;
  const configured = reactorRules[trigger];
  const emojis = Array.isArray(configured) ? configured : [configured];
  for (const emoji of emojis.slice(0, 3)) {
    if (typeof emoji === 'string' && emoji.trim()) await message.react(emoji).catch(() => {});
  }
}