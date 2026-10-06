// Permanent Lightcore automatic responses.
// Edit these mappings directly in this file; no Render/environment variables are required.
const AUTO_RESPONDER = {
  hello: 'Hey! 👋 Welcome to Lightcore!',
  hi: 'Hey! 👋',
  'good morning': 'Good morning! ☀️',
  'good night': 'Good night! 🌙',
  'lightcore': '⚡ Lightcore is here!',
  'thank you': "You're welcome! 💙",
  thanks: "You're welcome! 💙",
  ping: 'Pong! 🏓'
};

// Permanent word -> emoji reaction mappings.
// A matching word makes Lightcore react to the message with every configured emoji.
const AUTO_REACTOR = {
  gg: ['🎉', '🔥'],
  nice: ['🔥'],
  lol: ['😂'],
  lmao: ['😂'],
  wow: ['😮'],
  welcome: ['👋'],
  lightcore: ['⚡'],
  odaris: ['🔥', '⚡'],
  'good luck': ['🍀'],
  'well played': ['👏']
};

import { getAutoresponders } from './server-config.js';
import { cardMessage } from './ui.js';

const COOLDOWN_MS = 3000;
const responderCooldown = new Map();
const reactorCooldown = new Map();

function findTrigger(content, rules) {
  const lower = content.toLowerCase();
  return Object.keys(rules).find(trigger => lower.includes(trigger.toLowerCase()));
}

function allowed(map, key) {
  const now = Date.now();
  const last = map.get(key) || 0;
  if (now - last < COOLDOWN_MS) return false;
  map.set(key, now);
  return true;
}

export async function runAutoResponder(message) {
  const custom = message.guildId ? getAutoresponders(message.guildId) : {};
  const rules = { ...AUTO_RESPONDER, ...custom };
  const trigger = findTrigger(message.content, rules);
  if (!trigger) return;

  const key = `${message.guildId}:${message.author.id}:${trigger}`;
  if (!allowed(responderCooldown, key)) return;

  await message.reply(cardMessage('🤖 Auto Response',rules[trigger])).catch(() => {});
}

export async function runAutoReactor(message) {
  const trigger = findTrigger(message.content, AUTO_REACTOR);
  if (!trigger) return;

  const key = `${message.guildId}:${message.author.id}:${trigger}`;
  if (!allowed(reactorCooldown, key)) return;

  for (const emoji of AUTO_REACTOR[trigger]) {
    await message.react(emoji).catch(() => {});
  }
}
