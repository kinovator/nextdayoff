/**
 * Reminder plan — the snapshot the service worker replays when the app is
 * closed.
 *
 * IndexedDB is the only store the page and the service worker both reach
 * (`localStorage` is window-only), so the app publishes a plan here whenever
 * reminders, region, or optional-holiday settings change and whenever it returns
 * to the foreground:
 *
 *   { version, enabled, updatedAt, regionCode, regionName, includeOptional,
 *     offsetsDays, copyByOffset, icon, holidays: [{ id, name, date }],
 *     notified: ['holidayId@offsetDays', ...] }
 *
 * `public/notification-sw.js` reads it on `periodicsync` and mirrors the
 * milestone maths from `utils/notifications.js`. The database name, store name
 * and record key are duplicated in that worker by necessity (it is plain script
 * injected by Workbox, not a bundled module) — keep both files in step.
 */
import { getRegionByCode } from '../data/regions';
import {
  REMINDER_OFFSETS_DAYS,
  getReminderCopyTable,
  getServiceWorkerRegistration,
} from './notifications';
import { getNotifiedKeys, mergeNotifiedKeys } from './storage';

export const REMINDER_DB_NAME = 'nextdayoff-reminders';
export const REMINDER_DB_VERSION = 1;
export const REMINDER_PLAN_STORE = 'plan';
export const REMINDER_PLAN_KEY = 'current';
export const REMINDER_PLAN_VERSION = 1;

/** Must match the tag registered here and filtered in the service worker. */
export const REMINDER_SYNC_TAG = 'nextdayoff-reminders';

/** Floor for background checks; Chrome schedules them at its own discretion. */
export const BACKGROUND_SYNC_MIN_INTERVAL_MS = 12 * 60 * 60 * 1000;

const REMINDER_ICON_PATH = '/icons/icon-192.png';

function openReminderDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const request = indexedDB.open(REMINDER_DB_NAME, REMINDER_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(REMINDER_PLAN_STORE)) {
        db.createObjectStore(REMINDER_PLAN_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Reads the plan the service worker will replay, or null when there is none. */
export async function readReminderPlan() {
  try {
    const db = await openReminderDb();
    try {
      return await new Promise((resolve, reject) => {
        const request = db
          .transaction(REMINDER_PLAN_STORE, 'readonly')
          .objectStore(REMINDER_PLAN_STORE)
          .get(REMINDER_PLAN_KEY);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } finally {
      db.close();
    }
  } catch (err) {
    console.warn('Could not read the reminder plan', err);
    return null;
  }
}

/**
 * Stores the plan for the background worker. Failures are logged rather than
 * thrown: reminders are an enhancement and must never break the app.
 */
export async function writeReminderPlan(plan) {
  try {
    const db = await openReminderDb();
    try {
      await new Promise((resolve, reject) => {
        const request = db
          .transaction(REMINDER_PLAN_STORE, 'readwrite')
          .objectStore(REMINDER_PLAN_STORE)
          .put(plan, REMINDER_PLAN_KEY);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } finally {
      db.close();
    }
    return true;
  } catch (err) {
    console.warn('Could not write the reminder plan', err);
    return false;
  }
}

/**
 * Snapshots the holidays worth reminding about. Only the fields the worker
 * needs are copied, so data-schema changes stay confined to the app.
 */
export function buildReminderPlan({
  regionCode,
  regionName = '',
  holidays = [],
  enabled = true,
  includeOptional = false,
  offsetsDays = REMINDER_OFFSETS_DAYS,
  notifiedKeys = getNotifiedKeys(),
  now = new Date(),
} = {}) {
  const copyByOffset = {};
  offsetsDays.forEach((offset) => {
    copyByOffset[offset] = getReminderCopyTable(offset);
  });

  return {
    version: REMINDER_PLAN_VERSION,
    enabled: Boolean(enabled) && holidays.length > 0,
    updatedAt: now.toISOString(),
    regionCode,
    regionName,
    includeOptional: Boolean(includeOptional),
    offsetsDays: [...offsetsDays],
    copyByOffset,
    icon: REMINDER_ICON_PATH,
    holidays: holidays.map((holiday) => ({
      id: holiday.id,
      name: holiday.name,
      date: holiday.date,
    })),
    notified: [...new Set(notifiedKeys.filter(Boolean))],
  };
}

/**
 * Folds reminders the worker delivered while the app was closed into the local
 * list, so the in-app check never repeats them. Returns the keys that were new.
 */
export async function mergeBackgroundReminderNotifications() {
  const plan = await readReminderPlan();
  if (!plan || !Array.isArray(plan.notified) || !plan.notified.length) return [];
  return mergeNotifiedKeys(plan.notified);
}

/**
 * Records milestones sent by the in-app path in the shared plan, so the worker
 * cannot announce the same milestone later.
 */
export async function markReminderPlanNotified(keys) {
  const list = (Array.isArray(keys) ? keys : [keys]).filter(Boolean);
  if (!list.length) return false;
  const plan = await readReminderPlan();
  if (!plan) return false;
  const notified = [...new Set([...list, ...(plan.notified || [])])];
  return writeReminderPlan({ ...plan, notified });
}

/** Whether this browser can run periodic background sync at all. */
export function isBackgroundReminderSupported() {
  return (
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    typeof ServiceWorkerRegistration !== 'undefined' &&
    'periodicSync' in ServiceWorkerRegistration.prototype
  );
}

/** True once the app is running as an installed standalone window. */
export function isAppInstalled() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches === true ||
    window.navigator.standalone === true
  );
}


/**
 * 'available' | 'install-required' | 'unsupported' — drives the wording in the
 * info modal, which must not promise background reminders this device cannot do.
 */
export function getBackgroundReminderSupport() {
  if (!isBackgroundReminderSupported()) return 'unsupported';
  return isAppInstalled() ? 'available' : 'install-required';
}

/**
 * Registers or clears the periodic background sync. Chrome only grants the
 * permission to an installed app with enough engagement, so a rejection is
 * expected and reported instead of thrown.
 *
 * Returns 'registered' | 'unregistered' | 'unsupported' | 'unavailable'.
 */
export async function updateBackgroundReminderSync(enabled) {
  if (!isBackgroundReminderSupported()) return 'unsupported';

  const registration = await getServiceWorkerRegistration();
  if (!registration || !registration.periodicSync) return 'unsupported';

  try {
    if (enabled) {
      await registration.periodicSync.register(REMINDER_SYNC_TAG, {
        minInterval: BACKGROUND_SYNC_MIN_INTERVAL_MS,
      });
      return 'registered';
    }
    await registration.periodicSync.unregister(REMINDER_SYNC_TAG);
    return 'unregistered';
  } catch (err) {
    console.info('Background reminder sync is not available on this device', err);
    return 'unavailable';
  }
}

/**
 * Brings the shared plan and the background sync registration in step with the
 * current settings, then absorbs anything the worker already delivered.
 */
export async function syncReminderPlan({
  regionCode,
  holidays = [],
  enabled = true,
  includeOptional = false,
  offsetsDays = REMINDER_OFFSETS_DAYS,
  now = new Date(),
} = {}) {
  const region = getRegionByCode(regionCode);
  const plan = buildReminderPlan({
    regionCode: region.code,
    regionName: region.name,
    holidays,
    enabled,
    includeOptional,
    offsetsDays,
    now,
  });

  await writeReminderPlan(plan);
  const mergedKeys = await mergeBackgroundReminderNotifications();
  if (mergedKeys.length) {
    await writeReminderPlan({ ...plan, notified: getNotifiedKeys() });
  }

  const backgroundSync = await updateBackgroundReminderSync(plan.enabled);
  return { plan, mergedKeys, backgroundSync };
}

