/**
 * Combines class names, filtering out falsy values
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format duration in seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if we're in a browser environment
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Check if the device supports vibration
 */
export const supportsVibration = isBrowser && 'vibrate' in navigator;

/**
 * Trigger haptic feedback if supported
 */
export function hapticFeedback(pattern: number | number[] = 50): void {
  if (supportsVibration) {
    navigator.vibrate(pattern);
  }
}

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  return isBrowser && 'PushManager' in window && 'Notification' in window;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    return await Notification.requestPermission();
  }

  return Notification.permission;
}

/**
 * Show a browser notification
 */
export function showNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (!isBrowser || Notification.permission !== 'granted') {
    return null;
  }

  return new Notification(title, {
    icon: '/prizm/icons/icon.svg',
    badge: '/prizm/icons/icon.svg',
    ...options,
  });
}
