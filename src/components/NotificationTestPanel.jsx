import { useState } from 'react';
import {
  getNotificationPermission,
  requestNotificationPermission,
  showHolidayReminder,
  REMINDER_OFFSETS_DAYS,
} from '../utils/notifications';

/**
 * TEMP test panel: fire the real reminder delivery path (service-worker
 * notification) with synthetic dates so every milestone's wording can be
 * previewed without waiting for the real trigger. Rendered only while
 * NOTIFICATION_TEST_PANEL is true in src/App.jsx.
 *
 * Cases are derived from REMINDER_OFFSETS_DAYS — the actual production
 * triggers — so the panel can never drift from what the app really sends.
 * Each test holiday carries a `test-*` id, so nothing touches the dedupe keys
 * (stat_app_notified) or the reminder plan — tests are always repeatable and
 * never mute a real milestone.
 */
const LABELS = {
  14: { label: '🗓️ Two weeks', hint: '14d milestone' },
  7: { label: '📅 Week ahead', hint: '7d milestone' },
  2: { label: '⏳ 48 hours', hint: '2d milestone' },
  1: { label: '😴 Tomorrow', hint: '1d milestone' },
  0: { label: '🎉 Today', hint: 'day itself' },
};

const CASES = REMINDER_OFFSETS_DAYS.map((offset) => ({
  key: `d${offset}`,
  offsetDays: offset,
  daysOut: offset,
  ...(LABELS[offset] || { label: `${offset}d before`, hint: `${offset}d milestone` }),
}));

/** Local-timezone YYYY-MM-DD (toISOString would shift across UTC). */
const fmtDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function NotificationTestPanel({ holiday, region }) {
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState(getNotificationPermission);
  const [lastResult, setLastResult] = useState(null);

  const holidayName = holiday?.name ?? 'Test holiday';

  const request = async () => {
    setPermission(await requestNotificationPermission());
  };

  const play = async (testCase) => {
    // Synthetic timeline: the holiday sits `daysOut` midnights from now and the
    // reference `now` is today at midnight — the exact moment each milestone
    // becomes due — so getReminderBucket resolves the production wording.
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    const date = new Date(base);
    date.setDate(date.getDate() + testCase.daysOut);

    const testHoliday = { id: `test-${testCase.key}`, name: holidayName, date: fmtDate(date) };
    const shown = await showHolidayReminder(testHoliday, region, base, testCase.offsetDays);
    setLastResult(`${testCase.label} — ${shown ? 'shown ✅' : 'not shown ❌ (permission or SW)'}`);
  };

  return (
    <div className="fixed bottom-3 right-3 z-50 print:hidden">
      {open && (
        <div className="mb-2 w-64 rounded-2xl border border-stone-300 dark:border-stone-600 bg-card/95 dark:bg-stone-800/95 backdrop-blur shadow-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-200">
              Notification Test Panel
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 cursor-pointer"
              aria-label="Close notification test panel"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400">
            <span>Permission: {permission}</span>
            {permission === 'default' && (
              <button
                onClick={request}
                className="px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/70 font-semibold text-stone-700 dark:text-stone-200 cursor-pointer"
              >
                Request access
              </button>
            )}
          </div>

          <div className="space-y-1.5 max-h-[50vh] overflow-y-auto">
            {CASES.map((testCase) => (
              <button
                key={testCase.key}
                onClick={() => play(testCase)}
                disabled={permission !== 'granted'}
                className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-left text-xs bg-stone-100 hover:bg-amber-100 dark:bg-stone-700 dark:hover:bg-amber-900/40 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title={`Send test notification for ${testCase.hint}`}
              >
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  {testCase.label}
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 shrink-0">
                  {testCase.hint}
                </span>
              </button>
            ))}
          </div>

          <p className="text-[10px] text-stone-400 dark:text-stone-400">
            {lastResult ?? 'Nothing sent yet —'}
          </p>
          <p className="text-[10px] text-stone-400 dark:text-stone-400">
            Uses a test id, so real dedupe keys stay untouched.
          </p>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="ml-auto w-11 h-11 rounded-full flex items-center justify-center bg-stone-800 dark:bg-stone-100 text-stone-100 dark:text-stone-900 text-lg shadow-lg active:scale-95 transition cursor-pointer"
        title="Toggle notification test panel"
        aria-label="Toggle notification test panel"
      >
        🔔
      </button>
    </div>
  );
}
