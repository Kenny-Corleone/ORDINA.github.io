// ============================================================================
// RADIO SERVICE - Zeno.FM Integration
// ============================================================================

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface RadioStation {
  name: string;
  streamUrl: string;
  description?: string;
}

export interface RadioState {
  isPlaying: boolean;
  currentStation: RadioStation | null;
  volume: number;
  error: string | null;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_STATION: RadioStation = {
  name: 'AzerbaiJazz Radio',
  streamUrl: 'https://stream.zeno.fm/tjqlpbsxi4ytv',
  description: 'Jazz music from Azerbaijan'
};

export interface RadioNowPlaying {
  title: string;
  artist?: string;
  song?: string;
  raw?: unknown;
}

// ============================================================================
// RADIO PLAYER CLASS
// ============================================================================

export class RadioPlayer {
  private audio: HTMLAudioElement | null = null;
  private currentStation: RadioStation | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.setupAudioListeners();
    }
  }

  /**
   * Setup audio element event listeners
   */
  private setupAudioListeners(): void {
    if (!this.audio) return;

    this.audio.addEventListener('play', () => {
      this.emit('play');
    });

    this.audio.addEventListener('pause', () => {
      this.emit('pause');
    });

    this.audio.addEventListener('error', (e) => {
      logger.error('Radio player error:', e);
      this.emit('error', 'Failed to play radio stream');
    });

    this.audio.addEventListener('loadstart', () => {
      this.emit('loading');
    });

    this.audio.addEventListener('canplay', () => {
      this.emit('ready');
    });
  }

  /**
   * Load a radio station
   */
  loadStation(station: RadioStation): void {
    if (!this.audio) {
      logger.error('Audio element not available');
      return;
    }

    this.currentStation = station;
    this.audio.src = station.streamUrl;
    this.audio.load();
    logger.info('Radio station loaded:', station.name);
  }

  /**
   * Play the current station
   */
  async play(): Promise<void> {
    if (!this.audio) {
      throw new Error('Audio element not available');
    }

    if (!this.currentStation) {
      this.loadStation(DEFAULT_STATION);
    }

    try {
      await this.audio.play();
      logger.info('Radio playing');
    } catch (error) {
      logger.error('Radio play error:', error);
      throw error;
    }
  }

  /**
   * Pause the current station
   */
  pause(): void {
    if (!this.audio) {
      logger.error('Audio element not available');
      return;
    }

    this.audio.pause();
    logger.info('Radio paused');
  }

  /**
   * Toggle play/pause
   */
  async toggle(): Promise<void> {
    if (!this.audio) {
      throw new Error('Audio element not available');
    }

    if (this.audio.paused) {
      await this.play();
    } else {
      this.pause();
    }
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume: number): void {
    if (!this.audio) {
      logger.error('Audio element not available');
      return;
    }

    this.audio.volume = Math.max(0, Math.min(1, volume));
    this.emit('volumechange', this.audio.volume);
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.audio?.volume || 0;
  }

  /**
   * Check if playing
   */
  isPlaying(): boolean {
    return this.audio ? !this.audio.paused : false;
  }

  /**
   * Get current station
   */
  getCurrentStation(): RadioStation | null {
    return this.currentStation;
  }

  /**
   * Event emitter - emit event
   */
  private emit(event: string, data?: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  /**
   * Event emitter - add listener
   */
  on(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  /**
   * Event emitter - remove listener
   */
  off(event: string, listener: Function): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    this.listeners.clear();
    this.currentStation = null;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let radioPlayerInstance: RadioPlayer | null = null;

/**
 * Get radio player singleton instance
 */
export function getRadioPlayer(): RadioPlayer {
  if (!radioPlayerInstance) {
    radioPlayerInstance = new RadioPlayer();
  }
  return radioPlayerInstance;
}

/**
 * Destroy radio player instance
 */
export function destroyRadioPlayer(): void {
  if (radioPlayerInstance) {
    radioPlayerInstance.destroy();
    radioPlayerInstance = null;
  }
}

function parseZenoMetadataPayload(payload: unknown): RadioNowPlaying | null {
  if (!payload) return null;

  if (typeof payload === 'string') {
    const title = payload.trim();
    if (!title) return null;
    return { title, raw: payload };
  }

  if (typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    const title =
      (typeof obj.streamTitle === 'string' && obj.streamTitle.trim()) ||
      (typeof obj.title === 'string' && obj.title.trim()) ||
      (typeof obj.currentSong === 'string' && obj.currentSong.trim()) ||
      (typeof obj.song === 'string' && obj.song.trim()) ||
      '';

    const artist = typeof obj.artist === 'string' ? obj.artist.trim() : undefined;
    const song = typeof obj.song === 'string' ? obj.song.trim() : undefined;

    if (!title) return null;
    return { title, artist, song, raw: payload };
  }

  return null;
}

export function subscribeToZenoNowPlaying(
  mountId: string,
  onUpdate: (nowPlaying: RadioNowPlaying) => void,
  onError?: (error: unknown) => void
): () => void {
  if (typeof window === 'undefined') return () => {};
  if (!mountId) return () => {};

  const url = `https://api.zeno.fm/mounts/metadata/subscribe/${encodeURIComponent(mountId)}`;
  const es = new EventSource(url);

  const handleMessage = (ev: MessageEvent) => {
    try {
      const raw = ev.data;
      let parsed: unknown = raw;
      if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          parsed = JSON.parse(trimmed);
        }
      }

      const np = parseZenoMetadataPayload(parsed);
      if (np) onUpdate(np);
    } catch (e) {
      onError?.(e);
    }
  };

  const handleError = (e: Event) => {
    onError?.(e);
  };

  es.addEventListener('message', handleMessage as EventListener);
  es.addEventListener('error', handleError as EventListener);

  return () => {
    try {
      es.close();
    } catch {
      // ignore
    }
  };
}
