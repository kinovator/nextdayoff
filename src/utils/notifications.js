/**
 * Holiday reminder notifications.
 *
 * Reminders are scheduled client-side rather than pushed from a server: while
 * the app is open it checks whether the next holiday has entered the reminder
 * window and asks the service worker to display a notification, de-duplicated
 * per holiday. Nothing is sent while the app is closed — true background push
 * requires a backend with VAPID keys and is tracked as follow-up work in
 * docs/ROADMAP.md.
 *
 * Delivery goes through the service worker registration so Android/Chromium
 * accept it (the `Notification` constructor is unsupported there).
 */
import { calculateCountdown } from './dateUtils';
import {
  getNotifiedHolidayIds,
  getStoredRemindersEnabled,
  markHolidayNotified,
  setStoredRemindersEnabled,
} from './storage';

/** Remind this many hours before the holiday begins (see docs/ROADMAP.md). */
export const REMINDER_WINDOW_HOURS = 48;

/** How often to re-check while the app stays open. */
export const REMINDER_CHECK_INTERVAL_MS = 15 * 60 * 1000;

const ICON_PATH = '/icons/icon-192.png';

export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * One of 'default' | 'granted' | 'denied' | 'unsupported'
 */
export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Prompts for permission. Must be called from a user gesture to be honoured
 * by browsers. Returns the resulting permission string.
 */
export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch (err) {
    console.warn('Notification permission request failed', err);
    return 'denied';
  }
}

/**
 * Hours until the holiday day begins (local midnight). Negative when passed.
 */
export function getHoursUntilHoliday(dateStr, now = new Date()) {
  if (!dateStr) return -1;
  const { totalMs, isPassed } = calculateCountdown(dateStr, now);
  if (isPassed) return -1;
  return totalMs / 3600000;
}

/**
 * True when the holiday is inside the reminder window and has not started.
 */
export function isWithinReminderWindow(
  dateStr,
  now = new Date(),
  windowHours = REMINDER_WINDOW_HOURS
) {
  const hours = getHoursUntilHoliday(dateStr, now);
  return hours >= 0 && hours <= windowHours;
}

/**
 * Friendly notification copy for the given holiday and region.
 */
export function buildReminder(holiday, region, now = new Date()) {
  const { days, hours, isToday } = calculateCountdown(holiday.date, now);
  const where = region?.name ? ` in ${region.name}` : '';
  const name = holiday.name;

  let body;
  if (isToday) {
    body = `It's today${where} — enjoy the day off! 🎉`;
  } else if (days === 0) {
    body = `Starts in ${hours} hour${hours === 1 ? '' : 's'}${where}. Nearly there!`;
  } else if (days === 1) {
    body = `Tomorrow${where} — one sleep to go!`;
  } else {
    body = `${days} days to go${where}. Hang in there!`;
  }

  return { title: `🎉 ${name}`, body };
}

/**
 * Resolves the active service worker registration, or null when unavailable
 * (e.g. dev server without SW enabled, or a browser without support).
 */
async function getServiceWorkerRegistration(timeoutMs = 3000) {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    return await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);
  } catch {
    return null;
  }
}

/**
 * Displays the reminder. Returns true when the notification was handed off.
 */
export async function showHolidayReminder(holiday, region, now = new Date()) {
  if (!holiday) return false;
  if (!isNotificationSupported() || getNotificationPermission() !== 'granted') return false;

  const { title, body } = buildReminder(holiday, region, now);
  const options = {
    body,
    icon: ICON_PATH,
    badge: ICON_PATH,
    tag: `nextdayoff-${holiday.id}`,
    data: { url: '/' },
  };

  const registration = await getServiceWorkerRegistration();
  try {
    if (registration) {
      await registration.showNotification(title, options);
      return true;
    }
    // Fallback for browsers without a registration (desktop only).
    new Notification(title, options);
    return true;
  } catch (err) {
    console.warn('Could not display holiday reminder', err);
    return false;
  }
}

/**
 * Single entry point used by the app. Returns a status string describing what
 * happened, which keeps the caller simple and the behaviour testable.
 */
export async function checkAndSendReminder({
  holiday,
  region,
  now = new Date(),
  enabled,
  windowHours = REMINDER_WINDOW_HOURS,
} = {}) {
  if (!holiday) return { status: 'no-holiday' };

  const isEnabled = enabled === undefined ? getStoredRemindersEnabled() : enabled;
  if (!isEnabled) return { status: 'disabled' };
  if (!isNotificationSupported()) return { status: 'unsupported' };
  if (getNotificationPermission() !== 'granted') return { status: 'permission' };
  if (!isWithinReminderWindow(holiday.date, now, windowHours)) {
    return { status: 'outside-window' };
  }
  if (getNotifiedHolidayIds().includes(holiday.id)) return { status: 'already-sent' };

  const sent = await showHolidayReminder(holiday, region, now);
  if (!sent) return { status: 'failed' };

  markHolidayNotified(holiday.id);
  return { status: 'sent' };
}

export { getStoredRemindersEnabled, setStoredRemindersEnabled };
