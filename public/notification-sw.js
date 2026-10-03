/**
 * Extra service-worker code injected into the generated Workbox worker via
 * `workbox.importScripts` in vite.config.js.
 *
 * Two jobs:
 *
 * 1. `notificationclick` — bring an existing app window back to the front when
 *    a reminder is tapped, otherwise open a new one.
 * 2. `periodicsync` — replay the reminder plan the app leaves in IndexedDB so
 *    reminders still arrive while the app is closed. Chromium only; Chrome
 *    grants the permission to installed web apps with enough engagement, and
 *    the page registers the tag in `src/utils/reminderPlan.js`.
 *
 * This file is plain script (Workbox injects it, it is not bundled), so the
 * constants and the milestone/copy helpers below deliberately mirror
 * `src/utils/notifications.js` and `src/utils/reminderPlan.js`. Keep all three
 * in step — the plan itself carries the copy table, so only the maths is
 * duplicated here.
 */

const SYNC_TAG = 'nextdayoff-reminders';
const DB_NAME = 'nextdayoff-reminders';
const DB_VERSION = 1;
const PLAN_STORE = 'plan';
const PLAN_KEY = 'current';

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PLAN_STORE)) {
        db.createObjectStore(PLAN_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readPlan() {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction(PLAN_STORE, 'readonly').objectStore(PLAN_STORE).get(PLAN_KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

/** Re-reads the plan before writing, so a concurrent page write is not lost. */
async function markPlanNotified(keys) {
  if (!keys || !keys.length) return;
  const plan = await readPlan();
  if (!plan) return;

  const notified = [...new Set([...keys, ...(Array.isArray(plan.notified) ? plan.notified : [])])];
  const db = await openDb();
  try {
    await new Promise((resolve, reject) => {
      const request = db
        .transaction(PLAN_STORE, 'readwrite')
        .objectStore(PLAN_STORE)
        .put({ ...plan, notified }, PLAN_KEY);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

/* -------------------------------------------------------------------------- *
 * Milestone maths — mirrors src/utils/notifications.js
 * -------------------------------------------------------------------------- */

function calendarDaysUntil(dateStr, now) {
  const [year, month, day] = String(dateStr).split('-').map(Number);
  if (!year || !month || !day) return Infinity;
  const target = new Date(year, month - 1, day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

/** Hours until the holiday starts; on the day itself, the hours left in it. */
function hoursUntil(dateStr, now) {
  const days = calendarDaysUntil(dateStr, now);
  if (days < 0) return -1;
  if (days === 0) {
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return (endOfDay.getTime() - now.getTime()) / 3600000;
  }
  const [year, month, day] = String(dateStr).split('-').map(Number);
  return (new Date(year, month - 1, day, 0, 0, 0, 0).getTime() - now.getTime()) / 3600000;
}

function reminderBucket(hoursLeft, calendarDays) {
  if (calendarDays <= 0) return 'today';
  if (hoursLeft <= 12) return 'hours';
  if (calendarDays === 1) return 'tomorrow';
  if (calendarDays >= 14) return 'twoWeeks';
  if (calendarDays >= 7) return 'week';
  return 'days';
}

function fillTemplate(template, { days, hours, where } = {}) {
  return String(template || '')
    .replace(/\{days\}/g, String(days))
    .replace(/\{hours\}/g, String(hours))
    .replace(/\{plural\}/g, hours === 1 ? '' : 's')
    .replace(/\{where\}/g, where || '');
}

function milestoneKey(holidayId, offsetDays) {
  return `${holidayId}@${offsetDays}`;
}

function isMilestoneSent(notified, holidayId, offsetDays) {
  return notified.includes(milestoneKey(holidayId, offsetDays)) || notified.includes(holidayId);
}

/* -------------------------------------------------------------------------- *
 * Notification taps
 * -------------------------------------------------------------------------- */

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      const appClient = clientList.find(
        (client) => client.url && client.url.startsWith(self.location.origin)
      );

      if (appClient && 'focus' in appClient) {
        await appClient.focus();
        return;
      }

      if (self.clients.openWindow) {
        await self.clients.openWindow(targetUrl);
      }
    })()
  );
});

/* -------------------------------------------------------------------------- *
 * Background reminders
 * -------------------------------------------------------------------------- */

/**
 * Oldest-first holiday with a milestone that is due and unsent. Mirrors
 * `getDueMilestones` in src/utils/notifications.js, including the rule that the
 * most urgent milestone supplies the wording while every due milestone is
 * marked, so a less urgent one can never fire afterwards.
 */
function pickDueReminder(plan, now) {
  const offsets = Array.isArray(plan.offsetsDays) ? plan.offsetsDays : [];
  const notified = Array.isArray(plan.notified) ? plan.notified : [];
  const holidays = (Array.isArray(plan.holidays) ? plan.holidays : [])
    .filter((holiday) => holiday && holiday.id && holiday.date)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));

  for (const holiday of holidays) {
    const hoursLeft = hoursUntil(holiday.date, now);
    if (hoursLeft < 0) continue;

    // Due-ness by calendar day (mirrors getDueMilestones): hours-based maths
    // counts hours *left in the day* once midnight hits and would never fire
    // the offset-0 (day itself) milestone.
    const calendarDays = calendarDaysUntil(holiday.date, now);
    const due = offsets
      .filter((offset) => calendarDays <= offset)
      .filter((offset) => !isMilestoneSent(notified, holiday.id, offset))
      .sort((a, b) => a - b);

    if (!due.length) continue;

    const offsetDays = due[0];
    const table = (plan.copyByOffset && plan.copyByOffset[String(offsetDays)]) || {};
    const body = fillTemplate(table[reminderBucket(hoursLeft, calendarDays)] || table.days, {
      days: Math.max(calendarDays, 0),
      hours: Math.max(1, Math.round(hoursLeft)),
      where: plan.regionName ? ` in ${plan.regionName}` : '',
    });

    return {
      holiday,
      body,
      keys: due.map((offset) => milestoneKey(holiday.id, offset)),
    };
  }

  return null;
}

/** True while an app window is on screen — the in-app checker owns that moment. */
async function hasVisibleAppWindow() {
  const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  return clientList.some(
    (client) =>
      client.visibilityState === 'visible' &&
      client.url &&
      client.url.startsWith(self.location.origin)
  );
}

async function runReminderCheck() {
  const plan = await readPlan();
  if (!plan || !plan.enabled) return;

  // The page re-checks every 15 minutes while it is visible, so standing down
  // here is what keeps a closed-app reminder from being announced twice.
  if (await hasVisibleAppWindow()) return;

  const reminder = pickDueReminder(plan, new Date());
  if (!reminder) return;

  // A rejected or failed show throws, leaving the milestone unmarked so the
  // next run can try again instead of silently swallowing the reminder.
  await self.registration.showNotification(`🎉 ${reminder.holiday.name}`, {
    body: reminder.body,
    icon: plan.icon,
    badge: plan.icon,
    // Same tag as the in-app path, so a newer milestone replaces the older one.
    tag: `nextdayoff-${reminder.holiday.id}`,
    data: { url: '/' },
  });

  await markPlanNotified(reminder.keys);
}

self.addEventListener('periodicsync', (event) => {
  if (event.tag !== SYNC_TAG) return;

  event.waitUntil(
    runReminderCheck().catch((err) => {
      console.warn('Background reminder check failed', err);
    })
  );
});
