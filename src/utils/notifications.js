/**
 * Holiday reminder notifications.
 *
 * Reminders are scheduled client-side against the milestones in
 * `REMINDER_OFFSETS_DAYS` (two weeks, a week, 48 hours, 24 hours and the day
 * itself). While the app
 * is open it checks whether a milestone has come due and asks the service worker
 * to display a notification, de-duplicated per holiday *and* milestone.
 *
 * Once reminders are on, the app also writes a reminder plan to IndexedDB (see
 * `utils/reminderPlan.js`) which `periodicsync` in `public/notification-sw.js`
 * replays when the app is closed — so Chromium/Android users get reminders
 * without any backend. That worker mirrors the milestone maths defined here and
 * renders the copy table shipped inside the plan, keeping this file the only
 * place where reminder wording is written down.
 *
 * Delivery goes through the service worker registration so Android/Chromium
 * accept it (the `Notification` constructor is unsupported there).
 */
import { calculateCountdown } from './dateUtils';
import {
  getNotifiedKeys,
  getStoredRemindersEnabled,
  markNotifiedKeys,
  setStoredRemindersEnabled,
} from './storage';

/**
 * Reminder milestones, in days before the holiday begins (descending). Add an
 * entry here (and optionally an override in `REMINDER_COPY`) to schedule
 * another heads-up. Offset 0 means the day itself and is due by calendar day,
 * since the hours-based maths counts hours *left in the day* once midnight hits.
 */
export const REMINDER_OFFSETS_DAYS = [14, 7, 2, 1, 0];

/** How often to re-check while the app stays open. */
export const REMINDER_CHECK_INTERVAL_MS = 15 * 60 * 1000;

/**
 * Generic body per moment, with `{days}`, `{hours}`, `{plural}` and `{where}`
 * filled in at delivery time.
 */
export const BASE_REMINDER_COPY = {
  today: "It's today{where} — enjoy the day off! 🎉",
  hours: 'Starts in {hours} hour{plural}{where}. Nearly there!',
  tomorrow: 'Tomorrow{where} — one sleep to go!',
  twoWeeks: 'Two weeks to go{where} — a good moment to plan your time off. 🗓️',
  week: 'One week to go{where} — a good moment to plan your time off. 🗓️',
  days: '{days} days to go{where}. Hang in there!',
};

/**
 * Per-milestone overrides of `BASE_REMINDER_COPY`, keyed by offset in days.
 * Milestones without an entry simply use the generic wording.
 */
export const REMINDER_COPY = {
  // The week-ahead nudge stays about planning even when it fires a day late.
  7: { days: '{days} days to go{where} — time to plan your time off. 🗓️' },
  // A late two-week nudge (fired at 8–13 days) lands in the `week` bucket, so
  // say the actual day count instead of "one week".
  14: { week: '{days} days to go{where} — time to plan your time off. 🗓️' },
};

// Canonical app logo (public/icons/icon-512.png), also used by the PWA
// manifest, apple-touch-icon and the in-app header badge.
const ICON_PATH = '/icons/icon-512.png';

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
 * Whole calendar days until the holiday (0 on the day itself), so "tomorrow"
 * and "2 days to go" read the way people count days off. DST-safe by rounding.
 */
export function getCalendarDaysUntil(dateStr, now = new Date()) {
  if (!dateStr) return Infinity;
  const [year, month, day] = dateStr.split('-').map(Number);
  const target = new Date(year, month - 1, day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

/**
 * Which body of `BASE_REMINDER_COPY` fits the moment. Mirrored in
 * `public/notification-sw.js`, which cannot import this module.
 */
export function getReminderBucket(hoursLeft, calendarDays) {
  if (calendarDays <= 0) return 'today';
  if (hoursLeft <= 12) return 'hours';
  if (calendarDays === 1) return 'tomorrow';
  if (calendarDays >= 14) return 'twoWeeks';
  if (calendarDays >= 7) return 'week';
  return 'days';
}

/** Substitutes the placeholders in a reminder body template. */
export function fillReminderTemplate(template, { days, hours, where } = {}) {
  return String(template || '')
    .replace(/\{days\}/g, String(days))
    .replace(/\{hours\}/g, String(hours))
    .replace(/\{plural\}/g, hours === 1 ? '' : 's')
    .replace(/\{where\}/g, where || '');
}

/**
 * Complete copy table for a milestone: the generic wording plus that
 * milestone's overrides.
 */
export function getReminderCopyTable(offsetDays) {
  return { ...BASE_REMINDER_COPY, ...(REMINDER_COPY[offsetDays] || {}) };
}

/** `holidayId@7d` — one reminder per holiday per milestone. */
export function getMilestoneKey(holidayId, offsetDays) {
  return `${holidayId}@${offsetDays}`;
}

/**
 * A bare holiday id (legacy entries, or a deliberate "mute this holiday")
 * covers every milestone for that holiday.
 */
export function isMilestoneSent(notifiedKeys, holidayId, offsetDays) {
  return (
    notifiedKeys.includes(getMilestoneKey(holidayId, offsetDays)) ||
    notifiedKeys.includes(holidayId)
  );
}

/**
 * Milestones that have come due for this holiday and have not been sent yet,
 * most urgent first. A milestone stays due from its threshold until the holiday
 * begins, so a check that runs late still delivers (with accurate copy).
 *
 * Due-ness is decided by calendar day, not by hours: the two agree for every
 * offset ≥ 1 (a milestone becomes due at local midnight of its threshold day),
 * and calendar days are the only rule that works for offset 0, where the
 * hours-based maths would count hours *left in the day* and never reach zero
 * before the holiday passes.
 */
export function getDueMilestones(
  holiday,
  now = new Date(),
  { offsetsDays = REMINDER_OFFSETS_DAYS, notifiedKeys = getNotifiedKeys() } = {}
) {
  if (!holiday || !holiday.date) return [];
  const hoursLeft = getHoursUntilHoliday(holiday.date, now);
  if (hoursLeft < 0) return [];
  const calendarDays = getCalendarDaysUntil(holiday.date, now);

  return offsetsDays
    .filter((offset) => calendarDays <= offset)
    .filter((offset) => !isMilestoneSent(notifiedKeys, holiday.id, offset))
    .sort((a, b) => a - b)
    .map((offset) => ({
      offsetDays: offset,
      hoursLeft,
      key: getMilestoneKey(holiday.id, offset),
    }));
}

/**
 * Human phrasing of the milestone list for UI copy, e.g. "two weeks before, a
 * week before, 2 days before — and on the day itself". Offset 0 gets its own
 * preposition, since "0 days before" would read wrong.
 */
export function describeReminderOffsets(offsetsDays = REMINDER_OFFSETS_DAYS) {
  const labels = offsetsDays
    .filter((days) => days > 0)
    .map((days) => {
      if (days === 14) return 'two weeks before';
      if (days === 7) return 'a week before';
      if (days === 1) return 'a day before';
      return `${days} days before`;
    });

  let phrase = '';
  if (labels.length === 1) phrase = labels[0];
  else if (labels.length > 1) {
    phrase = `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`;
  }

  if (offsetsDays.includes(0)) {
    phrase = phrase ? `${phrase} — and on the day itself` : 'on the day itself';
  }
  return phrase;
}

/**
 * Friendly notification copy for the given holiday, region and milestone.
 */
export function buildReminder(
  holiday,
  region,
  now = new Date(),
  offsetDays = REMINDER_OFFSETS_DAYS[REMINDER_OFFSETS_DAYS.length - 1]
) {
  const copy = getReminderCopyTable(offsetDays);
  const hoursLeft = Math.max(0, getHoursUntilHoliday(holiday.date, now));
  const calendarDays = getCalendarDaysUntil(holiday.date, now);
  const bucket = getReminderBucket(hoursLeft, calendarDays);
  const where = region?.name ? ` in ${region.name}` : '';

  const body = fillReminderTemplate(copy[bucket] || copy.days, {
    days: Math.max(calendarDays, 0),
    hours: Math.max(1, Math.round(hoursLeft)),
    where,
  });

  return { title: `🎉 ${holiday.name}`, body };
}

/**
 * Resolves the active service worker registration, or null when unavailable
 * (e.g. dev server without SW enabled, or a browser without support). Shared
 * with `utils/reminderPlan.js`, which registers background reminder sync.
 */
export async function getServiceWorkerRegistration(timeoutMs = 3000) {
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
 * Displays the reminder for the given milestone. Returns true when the
 * notification was handed off.
 */
export async function showHolidayReminder(holiday, region, now = new Date(), offsetDays) {
  if (!holiday) return false;
  if (!isNotificationSupported() || getNotificationPermission() !== 'granted') return false;

  const { title, body } = buildReminder(holiday, region, now, offsetDays);
  const options = {
    body,
    icon: ICON_PATH,
    badge: ICON_PATH,
    // One tag per holiday, so a newer milestone replaces the older reminder.
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
 * happened, plus the milestone that fired and the storage keys involved, which
 * keeps the caller simple and the behaviour testable.
 */
export async function checkAndSendReminder({
  holiday,
  region,
  now = new Date(),
  enabled,
  offsetsDays = REMINDER_OFFSETS_DAYS,
} = {}) {
  if (!holiday) return { status: 'no-holiday' };

  const isEnabled = enabled === undefined ? getStoredRemindersEnabled() : enabled;
  if (!isEnabled) return { status: 'disabled' };
  if (!isNotificationSupported()) return { status: 'unsupported' };
  if (getNotificationPermission() !== 'granted') return { status: 'permission' };

  const hoursLeft = getHoursUntilHoliday(holiday.date, now);
  if (hoursLeft < 0 || hoursLeft > Math.max(...offsetsDays) * 24) {
    return { status: 'outside-window' };
  }

  const due = getDueMilestones(holiday, now, { offsetsDays });
  if (!due.length) return { status: 'already-sent' };

  // The most urgent milestone supplies the wording; every due milestone is then
  // marked, so a less urgent one can never fire afterwards.
  const milestone = due[0];
  const sent = await showHolidayReminder(holiday, region, now, milestone.offsetDays);
  if (!sent) return { status: 'failed' };

  const sentKeys = due.map((entry) => entry.key);
  markNotifiedKeys(sentKeys);
  return { status: 'sent', offsetDays: milestone.offsetDays, sentKeys };
}

export { getStoredRemindersEnabled, setStoredRemindersEnabled };
