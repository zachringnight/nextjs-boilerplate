'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useASWStore } from '../store';
import { players } from '../data/players';
import { parseTime, getEventDay, getCurrentMinutesPT, toPT } from '../lib/schedule-utils';
import { EVENT_DATES, SLOT_DURATION_MINUTES } from '../lib/constants';
import { isPushSupported, requestNotificationPermission, hapticFeedback } from '../lib/utils';

const FIVE_MINUTES = 5 * 60 * 1000;
const ONE_MINUTE = 60 * 1000;
const CHECK_INTERVAL = 30 * 1000;

interface NotificationState {
  fiveMinNotified: Set<string>;
  oneMinNotified: Set<string>;
  startNotified: Set<string>;
}

export default function NotificationProvider() {
  const { notificationsEnabled, notificationSound } = useASWStore();
  const notificationState = useRef<NotificationState>({
    fiveMinNotified: new Set(),
    oneMinNotified: new Set(),
    startNotified: new Set(),
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/asw/sounds/notification.mp3');
      audioRef.current.volume = 0.5;
    }
  }, []);

  const playSound = useCallback(() => {
    if (notificationSound && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, [notificationSound]);

  const showNotification = useCallback((title: string, body: string, tag: string) => {
    if (!isPushSupported() || Notification.permission !== 'granted') return;

    const notification = new Notification(title, {
      body,
      tag,
      requireInteraction: false,
      silent: !notificationSound,
    });

    setTimeout(() => notification.close(), 10000);
    hapticFeedback([100, 50, 100]);
  }, [notificationSound]);

  const checkRotations = useCallback(() => {
    if (!notificationsEnabled) return;

    const now = new Date();
    const eventDay = getEventDay(now);
    if (eventDay === null) return;

    const ptDate = toPT(now);
    const currentTimeMs = ptDate.getTime();
    const dayPlayers = players.filter(p => p.day === eventDay);

    for (const player of dayPlayers) {
      const { hours, minutes } = parseTime(player.scheduledTime);
      const slotStart = new Date(ptDate);
      slotStart.setHours(hours, minutes, 0, 0);
      const timeUntilStart = slotStart.getTime() - currentTimeMs;

      const slotKey = `${player.id}-day${eventDay}`;

      // 5-minute warning
      if (
        timeUntilStart > 0 &&
        timeUntilStart <= FIVE_MINUTES &&
        timeUntilStart > FIVE_MINUTES - CHECK_INTERVAL &&
        !notificationState.current.fiveMinNotified.has(slotKey)
      ) {
        showNotification(
          `5 min warning`,
          `${player.firstName} ${player.lastName} (${player.teamAbbr}) arriving soon`,
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
          `Starting now!`,
          `${player.firstName} ${player.lastName} rotation beginning`,
          `1min-${slotKey}`
        );
        playSound();
        hapticFeedback([200, 100, 200]);
        notificationState.current.oneMinNotified.add(slotKey);
      }
    }
  }, [notificationsEnabled, showNotification, playSound]);

  useEffect(() => {
    if (!notificationsEnabled) return;
    checkRotations();
    const intervalId = setInterval(checkRotations, CHECK_INTERVAL);
    return () => clearInterval(intervalId);
  }, [notificationsEnabled, checkRotations]);

  useEffect(() => {
    if (notificationsEnabled && isPushSupported()) {
      requestNotificationPermission();
    }
  }, [notificationsEnabled]);

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
