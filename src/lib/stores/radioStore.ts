import { writable } from 'svelte/store';
import { getRadioPlayer, subscribeToZenoNowPlaying, type RadioNowPlaying } from '../services/radio';
import { logger } from '../utils/logger';

interface RadioStoreState {
  isPlaying: boolean;
  trackTitle: string;
  trackArtist: string;
  loading: boolean;
  error: string | null;
}

const initialState: RadioStoreState = {
  isPlaying: false,
  trackTitle: '',
  trackArtist: '',
  loading: false,
  error: null
};

function createRadioStore() {
  const { subscribe, set, update } = writable<RadioStoreState>(initialState);
  
  // Gets the singleton instance
  const player = getRadioPlayer();
  let metadataUnsubscribe: (() => void) | null = null;
  let initialized = false;

  function init() {
    if (initialized) return;
    if (typeof window === 'undefined') return;

    // Sync initial state
    update(s => ({ ...s, isPlaying: player.isPlaying() }));

    // Listen to player events
    player.on('play', () => update(s => ({ ...s, isPlaying: true })));
    player.on('pause', () => update(s => ({ ...s, isPlaying: false })));
    player.on('loading', () => update(s => ({ ...s, loading: true })));
    player.on('ready', () => update(s => ({ ...s, loading: false })));
    player.on('error', (msg: any) => update(s => ({ ...s, error: String(msg) })));

    // Subscribe to metadata (hardcoded mountId for now as per previous usage: 'tjqlpbsxi4ytv')
    // Ideally this comes from config or the player's current station
    metadataUnsubscribe = subscribeToZenoNowPlaying(
      'tjqlpbsxi4ytv',
      (data: RadioNowPlaying) => {
        update(s => ({
          ...s,
          trackTitle: data.title,
          trackArtist: data.artist || ''
        }));
      },
      (err) => {
        logger.error('Radio metadata error', err);
      }
    );

    initialized = true;
  }

  async function toggle() {
    try {
      await player.toggle();
    } catch (err) {
      logger.error('Radio store toggle error', err);
    }
  }

  function destroy() {
    if (metadataUnsubscribe) metadataUnsubscribe();
    // We do not destroy the player instance itself as it is a singleton used elsewhere
    initialized = false;
  }

  return {
    subscribe,
    init,
    toggle,
    destroy
  };
}

export const radioStore = createRadioStore();
