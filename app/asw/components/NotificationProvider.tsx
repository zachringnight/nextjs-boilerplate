'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useASWStore } from '../store';
import { useSchedulePlayers } from '../data/schedule';
import { isCurrentPlayer, getEventDay, getTimeRemaining } from '../lib/schedule-utils';
import { isPushSupported, requestNotificationPermission, hapticFeedback } from '../lib/utils';

const CHECK_INTERVAL = 30 * 1000;

interface NotificationState {
  fiveMinNotified: Set<string>;
  oneMinNotified: Set<string>;
  startNotified: Set<string>;
}

export default function NotificationProvider() {
  const { players } = useSchedulePlayers();
  const { notificationsEnabled, notificationSound } = useASWStore();
  const notificationState = useRef<NotificationState>({
    fiveMinNotified: new Set(),
    oneMinNotified: new Set(),
    startNotified: new Set(),
  });

  // Show browser notification
  const showNotification = useCallback((title: string, body: string, tag: string) => {
    if (!isPushSupported() || Notification.permission !== 'granted') {
      return;
    }

    const notification = new Notification(title, {
      body,
      icon: '/prizm/icons/icon.svg',
      badge: '/prizm/icons/icon.svg',
      tag,
      requireInteraction: false,
      silent: !notificationSound,
    });

    setTimeout(() => notification.close(), 10000);

    hapticFeedback([100, 50, 100]);
  }, [notificationSound]);

  // Check for upcoming player rotations
  const checkRotations = useCallback(() => {
    if (!notificationsEnabled) return;

    const now = new Date();
    const eventDay = getEventDay(now);
    if (!eventDay) return;

    // Find current player and check time remaining
    const currentPlayer = players.find(p => isCurrentPlayer(p, now, eventDay));
    if (currentPlayer) {
      const remaining = getTimeRemaining(currentPlayer, now);
      const totalSeconds = remaining.minutes * 60 + remaining.seconds;
      const playerKey = `${currentPlayer.id}-day${eventDay}`;

      // 5-minute warning
      if (
        totalSeconds <= 300 &&
        totalSeconds > 270 &&
        !notificationState.current.fiveMinNotified.has(playerKey)
      ) {
        showNotification(
          '5 min remaining',
          `${currentPlayer.firstName} ${currentPlayer.lastName} - wrapping up soon`,
          `5min-${playerKey}`
        );
        notificationState.current.fiveMinNotified.add(playerKey);
      }

      // 1-minute warning
      if (
        totalSeconds <= 60 &&
        totalSeconds > 30 &&
        !notificationState.current.oneMinNotified.has(playerKey)
      ) {
        showNotification(
          '1 min remaining!',
          `${currentPlayer.firstName} ${currentPlayer.lastName} - almost done`,
          `1min-${playerKey}`
        );
        hapticFeedback([200, 100, 200]);
        notificationState.current.oneMinNotified.add(playerKey);
      }
    }
  }, [notificationsEnabled, players, showNotification]);

  // Set up interval
  useEffect(() => {
    if (!notificationsEnabled) return;

    checkRotations();
    const intervalId = setInterval(checkRotations, CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [notificationsEnabled, checkRotations]);

  // Request permission on mount if enabled
  useEffect(() => {
    if (notificationsEnabled && isPushSupported()) {
      requestNotificationPermission();
    }
  }, [notificationsEnabled]);

  // Reset at midnight
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

  return null;
}
