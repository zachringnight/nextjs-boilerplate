'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '../store';
import { getNextSlot, EVENT_DATES } from '../data/schedule';
import { getPlayerById } from '../data/players';
import { getStationById } from '../data/stations';
import { formatDate } from '../lib/time';
import { isPushSupported, requestNotificationPermission, hapticFeedback } from '../lib/utils';

// Notification timing constants (in milliseconds)
const FIVE_MINUTES = 5 * 60 * 1000;
const ONE_MINUTE = 60 * 1000;
const CHECK_INTERVAL = 30 * 1000; // Check every 30 seconds

interface NotificationState {
  fiveMinNotified: Set<string>;
  oneMinNotified: Set<string>;
  startNotified: Set<string>;
}

export default function NotificationProvider() {
  const { schedule, notificationsEnabled, notificationSound } = useAppStore();
  const notificationState = useRef<NotificationState>({
    fiveMinNotified: new Set(),
    oneMinNotified: new Set(),
    startNotified: new Set(),
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/prizm/sounds/notification.mp3');
      audioRef.current.volume = 0.5;
    }
  }, []);

  // Play notification sound
  const playSound = useCallback(() => {
    if (notificationSound && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }, [notificationSound]);

  // Show browser notification
  const showNotification = useCallback((title: string, body: string, tag: string) => {
    if (!isPushSupported() || Notification.permission !== 'granted') {
      return;
    }

    const notification = new Notification(title, {
      body,
      icon: '/prizm/icons/icon.svg',
      badge: '/prizm/icons/icon.svg',
      tag, // Prevents duplicate notifications
      requireInteraction: false,
      silent: !notificationSound,
    });

    // Auto-close after 10 seconds
    setTimeout(() => notification.close(), 10000);

    // Vibrate on mobile
    hapticFeedback([100, 50, 100]);
  }, [notificationSound]);

  // Check for upcoming rotations and send notifications
  const checkRotations = useCallback(() => {
    if (!notificationsEnabled) return;

    const now = new Date();
    const today = formatDate(now);

    // Only check on event days
    if (!(EVENT_DATES as readonly string[]).includes(today)) {
      return;
    }

    const currentTime = now.getTime();

    // Check each station for upcoming rotations
    const stationIds = ['ledWall', 'signing', 'packRip', 'prCall'] as const;

    for (const stationId of stationIds) {
      const nextSlot = getNextSlot(schedule, stationId, now);

      if (!nextSlot || nextSlot.status !== 'scheduled') continue;

      const player = getPlayerById(nextSlot.playerId);
      const station = getStationById(stationId);

      if (!player || !station) continue;

      // Calculate time until slot starts
      const [hours, minutes] = nextSlot.startTime.split(':').map(Number);
      const slotStart = new Date(now);
      slotStart.setHours(hours, minutes, 0, 0);
      const timeUntilStart = slotStart.getTime() - currentTime;

      const slotKey = `${nextSlot.id}-${nextSlot.date}`;

      // 5-minute warning
      if (
        timeUntilStart > 0 &&
        timeUntilStart <= FIVE_MINUTES &&
        timeUntilStart > FIVE_MINUTES - CHECK_INTERVAL &&
        !notificationState.current.fiveMinNotified.has(slotKey)
      ) {
        showNotification(
          `${station.name} - 5 min warning`,
          `${player.name} (${player.position}) arriving soon`,
          `5min-${slotKey}`
        );
        playSound();
        notificationState.current.fiveMinNotified.add(slotKey);
      }

      // 1-minute warning
      if (
        timeUntilStart > 0 &&
        timeUntilStart <= ONE_MINUTE &&
        timeUntilStart > ONE_MINUTE - CHECK_INTERVAL &&
        !notificationState.current.oneMinNotified.has(slotKey)
      ) {
        showNotification(
          `${station.name} - Starting now!`,
          `${player.name} rotation beginning`,
          `1min-${slotKey}`
        );
        playSound();
        hapticFeedback([200, 100, 200]); // Stronger vibration
        notificationState.current.oneMinNotified.add(slotKey);
      }
    }

    // Check for PR calls specifically (they need extra attention)
    const nextPRCall = getNextSlot(schedule, 'prCall', now);
    if (nextPRCall && nextPRCall.prCallInfo) {
      const player = getPlayerById(nextPRCall.playerId);
      if (player) {
        const [hours, minutes] = nextPRCall.startTime.split(':').map(Number);
        const slotStart = new Date(now);
        slotStart.setHours(hours, minutes, 0, 0);
        const timeUntilStart = slotStart.getTime() - currentTime;

        const prKey = `pr-${nextPRCall.id}`;

        // Special 10-minute PR call warning
        if (
          timeUntilStart > FIVE_MINUTES &&
          timeUntilStart <= 10 * 60 * 1000 &&
          !notificationState.current.fiveMinNotified.has(prKey)
        ) {
          showNotification(
            `PR Call in 10 minutes`,
            `${player.name} → ${nextPRCall.prCallInfo.outlet}${nextPRCall.prCallInfo.callIn ? ` (${nextPRCall.prCallInfo.callIn})` : ''}`,
            `pr-10min-${prKey}`
          );
          playSound();
          notificationState.current.fiveMinNotified.add(prKey);
        }
      }
    }
  }, [schedule, notificationsEnabled, showNotification, playSound]);

  // Set up interval to check for rotations
  useEffect(() => {
    if (!notificationsEnabled) return;

    // Initial check
    checkRotations();

    // Set up interval
    const intervalId = setInterval(checkRotations, CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [notificationsEnabled, checkRotations]);

  // Request notification permission on mount if enabled
  useEffect(() => {
    if (notificationsEnabled && isPushSupported()) {
      requestNotificationPermission();
    }
  }, [notificationsEnabled]);

  // Reset notification state at midnight
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        notificationState.current = {
          fiveMinNotified: new Set(),
          oneMinNotified: new Set(),
          startNotified: new Set(),
        };
      }
    };

    const intervalId = setInterval(checkMidnight, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // This component doesn't render anything
  return null;
}
