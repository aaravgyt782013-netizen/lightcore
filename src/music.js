import { Readable } from 'node:stream';
import { cardMessage } from './ui.js';
import ffmpegPath from 'ffmpeg-static';
import { Innertube, UniversalCache, YTNodes } from 'youtubei.js';
import {
  AudioPlayerStatus,
  NoSubscriberBehavior,
  StreamType,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  entersState,
  VoiceConnectionStatus,
} from '@discordjs/voice';

if (ffmpegPath) process.env.FFMPEG_PATH ||= ffmpegPath;

const queues = new Map();
let youtube = null;

async function getYouTube() {
  if (!youtube) {
    youtube = await Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true,
      client_type: 'WEB',
      lang: 'en',
      location: 'US',
    });
  }
  return youtube;
}

function extractVideoId(input) {
  try {
    const url = new URL(input);
    if (url.hostname.includes('youtu.be')) return url.pathname.slice(1);
    if (url.hostname.includes('youtube.com')) return url.searchParams.get('v');
  } catch {}
  return null;
}

async function resolveTrack(query) {
  const yt = await getYouTube();
  const directId = extractVideoId(query);
  if (directId) {
    const info = await yt.getInfo(directId);
    return {
      id: directId,
      title: info.basic_info.title || 'Unknown title',
      author: info.basic_info.author || 'Unknown artist',
      url: `https://www.youtube.com/watch?v=${directId}`,
      duration: info.basic_info.duration || 0,
    };
  }

  const result = await yt.search(query, { type: 'video' });
  const video = result.results.find(item => item?.is?.(YTNodes.Video));
  if (!video) return null;

  return {
    id: video.video_id,
    title: video.title?.toString?.() || 'Unknown title',
    author: video.author?.name || 'Unknown artist',
    url: `https://www.youtube.com/watch?v=${video.video_id}`,
    duration: 0,
  };
}

function getState(guildId) {
  let state = queues.get(guildId);
  if (state) return state;

  const player = createAudioPlayer({
    behaviors: { noSubscriber: NoSubscriberBehavior.Pause },
  });

  state = {
    guildId,
    queue: [],
    current: null,
    player,
    connection: null,
    resource: null,
    channel: null,
    busy: false,
  };

  player.on(AudioPlayerStatus.Idle, () => {
    state.current = null;
    state.resource = null;
    playNext(state).catch(error => console.error('[music] next:', error));
  });

  player.on('error', error => {
    console.error('[music] player:', error);
    state.current = null;
    state.resource = null;
    playNext(state).catch(nextError => console.error('[music] next:', nextError));
  });

  queues.set(guildId, state);
  return state;
}

async function ensureConnection(state, voiceChannel) {
  if (state.connection && state.connection.joinConfig.channelId === voiceChannel.id) {
    return state.connection;
  }

  if (state.connection) state.connection.destroy();

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guild.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    selfDeaf: true,
  });

  state.connection = connection;
  await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
  connection.subscribe(state.player);
  return connection;
}

async function streamTrack(track) {
  const yt = await getYouTube();
  const info = await yt.getInfo(track.id);
  const webStream = await info.download({
    type: 'audio',
    quality: 'best',
    format: 'any',
  });

  return Readable.fromWeb(webStream);
}

async function playNext(state) {
  if (state.busy || state.current || !state.queue.length) return;
  state.busy = true;

  try {
    const track = state.queue.shift();
    const stream = await streamTrack(track);
    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary,
      inlineVolume: true,
    });

    state.current = track;
    state.resource = resource;
    state.player.play(resource);

    await state.channel?.send(cardMessage('🎵 Music',
      `🎵 Now playing **${track.title}** — ${track.author}\n<${track.url}>`
    ).catch(() => {});
  } catch (error) {
    console.error('[music] stream:', error);
    await state.channel?.send(cardMessage('❌ Music Error','I could not start that track. Try another song or link.')).catch(() => {});
    state.current = null;
    state.resource = null;
    setImmediate(() => playNext(state).catch(() => {}));
  } finally {
    state.busy = false;
  }
}

export async function playMusic({ guild, voiceChannel, textChannel, query }) {
  const state = getState(guild.id);
  await ensureConnection(state, voiceChannel);
  state.channel = textChannel;

  const track = await resolveTrack(query);
  if (!track) throw new Error('No playable result found.');

  state.queue.push(track);
  const wasIdle = !state.current && !state.busy;
  if (wasIdle) await playNext(state);

  return track;
}

export function pauseMusic(guildId) {
  const state = queues.get(guildId);
  if (!state?.current) return false;
  return state.player.pause(true);
}

export function resumeMusic(guildId) {
  const state = queues.get(guildId);
  if (!state?.current) return false;
  return state.player.unpause();
}

export function skipMusic(guildId) {
  const state = queues.get(guildId);
  if (!state?.current) return false;
  state.player.stop(true);
  return true;
}

export function stopMusic(guildId) {
  const state = queues.get(guildId);
  if (!state) return false;
  state.queue.length = 0;
  state.current = null;
  state.resource = null;
  state.player.stop(true);
  state.connection?.destroy();
  queues.delete(guildId);
  return true;
}

export function getQueue(guildId) {
  const state = queues.get(guildId);
  return {
    current: state?.current || null,
    queue: state?.queue || [],
  };
}
