/**
 * Sound management for Prizm Lounge
 * Handles audio playback with graceful fallbacks
 */

import { isBrowser } from './utils';

// Sound file paths
export const SOUNDS = {
  notification: '/prizm/sounds/notification.mp3',
  timerComplete: '/prizm/sounds/timer-complete.mp3',
  warning: '/prizm/sounds/warning.mp3',
  tick: '/prizm/sounds/tick.mp3',
} as const;

export type SoundType = keyof typeof SOUNDS;

// Audio cache
const audioCache = new Map<string, HTMLAudioElement>();

/**
 * Preload a sound file
 */
export function preloadSound(type: SoundType): void {
  if (!isBrowser) return;

  const path = SOUNDS[type];
  if (audioCache.has(path)) return;

  const audio = new Audio(path);
  audio.preload = 'auto';
  audio.volume = 0.5;

  // Cache even if loading fails (prevents repeated attempts)
  audioCache.set(path, audio);
}

/**
 * Preload all sounds
 */
export function preloadAllSounds(): void {
  Object.keys(SOUNDS).forEach((type) => {
    preloadSound(type as SoundType);
  });
}

/**
 * Play a sound with optional volume
 * Returns true if sound played, false if failed/unavailable
 */
export async function playSound(
  type: SoundType,
  volume = 0.5
): Promise<boolean> {
  if (!isBrowser) return false;

  try {
    const path = SOUNDS[type];
    let audio = audioCache.get(path);

    if (!audio) {
      audio = new Audio(path);
      audioCache.set(path, audio);
    }

    audio.volume = Math.max(0, Math.min(1, volume));
    audio.currentTime = 0;

    await audio.play();
    return true;
  } catch {
    // Sound unavailable or autoplay blocked
    return false;
  }
}

/**
 * Stop a sound
 */
export function stopSound(type: SoundType): void {
  if (!isBrowser) return;

  const path = SOUNDS[type];
  const audio = audioCache.get(path);

  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}

/**
 * Stop all sounds
 */
export function stopAllSounds(): void {
  audioCache.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
}

/**
 * Set global volume for all cached sounds
 */
export function setGlobalVolume(volume: number): void {
  const normalizedVolume = Math.max(0, Math.min(1, volume));
  audioCache.forEach((audio) => {
    audio.volume = normalizedVolume;
  });
}

/**
 * Check if audio is likely to be supported
 */
export function isAudioSupported(): boolean {
  if (!isBrowser) return false;

  try {
    const audio = new Audio();
    return typeof audio.play === 'function';
  } catch {
    return false;
  }
}

/**
 * Request audio permission (for mobile browsers)
 * Call this on a user interaction
 */
export async function requestAudioPermission(): Promise<boolean> {
  if (!isBrowser) return false;

  try {
    // Create and play a silent sound to unlock audio
    const audio = new Audio();
    audio.volume = 0;
    audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
    await audio.play();
    audio.pause();
    return true;
  } catch {
    return false;
  }
}
