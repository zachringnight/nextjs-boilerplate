/**
 * Utility functions for the ASW app
 */

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const isBrowser = typeof window !== 'undefined';

export const supportsVibration = isBrowser && 'vibrate' in navigator;

export function hapticFeedback(pattern: number | number[] = 50): void {
  if (supportsVibration) {
    navigator.vibrate(pattern);
  }
}

export function isPushSupported(): boolean {
  return isBrowser && 'PushManager' in window && 'Notification' in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission !== 'denied') return await Notification.requestPermission();
  return Notification.permission;
}
