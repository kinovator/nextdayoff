import { HOLIDAYS } from '../data/holidays';

/**
 * Returns YYYY-MM-DD string for a given Date in local time
 */
export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks if a holiday applies to a region as a mandatory stat
 */
export function isStatForRegion(holiday, regionCode) {
  if (!holiday || !regionCode) return false;
  return holiday.regions.includes(regionCode.toUpperCase());
}

/**
 * Checks if a holiday is optional/civic in a region
 */
export function isOptionalForRegion(holiday, regionCode) {
  if (!holiday || !regionCode) return false;
  return holiday.optionalRegions ? holiday.optionalRegions.includes(regionCode.toUpperCase()) : false;
}

/**
 * Returns the literal calendar date for holidays whose stored `date` is the
 * observed day off (see docs/DATA_SCHEMA.md §3 Observance Convention).
 * Returns null when the holiday is not shifted, so callers can simply skip
 * rendering the note.
 */
export function getActualDate(holiday) {
  if (!holiday || !holiday.actualDate) return null;
  return holiday.actualDate !== holiday.date ? holiday.actualDate : null;
}

/**
 * Checks if a holiday qualifies for the user's region and filter preferences
 */
export function holidayAppliesToRegion(holiday, regionCode, includeOptional = false) {
  const isStat = isStatForRegion(holiday, regionCode);
  if (isStat) return true;
  if (includeOptional && isOptionalForRegion(holiday, regionCode)) return true;
  return false;
}

/**
 * Finds the immediate next statutory (or optional) holiday
 */
export function getNextHoliday(regionCode, includeOptional = false, now = new Date()) {
  const todayStr = getLocalDateString(now);
  const eligible = HOLIDAYS.filter(
    (h) => holidayAppliesToRegion(h, regionCode, includeOptional) && h.date >= todayStr
  ).sort((a, b) => a.date.localeCompare(b.date));

  return eligible[0] || null;
}

/**
 * Gets chronological upcoming holidays for the selected region
 */
export function getUpcomingHolidays(regionCode, includeOptional = false, limit = 12, now = new Date()) {
  const todayStr = getLocalDateString(now);
  return HOLIDAYS.filter(
    (h) => holidayAppliesToRegion(h, regionCode, includeOptional) && h.date >= todayStr
  )
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}

/**
 * Calculates countdown breakdown targeting the midnight of the holiday date
 */
export function calculateCountdown(targetDateStr, now = new Date()) {
  if (!targetDateStr) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isToday: false, isPassed: true, totalMs: 0 };
  }

  const todayStr = getLocalDateString(now);
  const isToday = targetDateStr === todayStr;

  // Holiday begins at 00:00:00 of that day
  const [year, month, day] = targetDateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day, 0, 0, 0, 0);
  const endOfHolidayDate = new Date(year, month - 1, day, 23, 59, 59, 999);

  const diffMs = targetDate.getTime() - now.getTime();

  if (isToday) {
    const remainingTodayMs = Math.max(0, endOfHolidayDate.getTime() - now.getTime());
    const totalSecs = Math.floor(remainingTodayMs / 1000);
    return {
      days: 0,
      hours: Math.floor(totalSecs / 3600),
      minutes: Math.floor((totalSecs % 3600) / 60),
      seconds: totalSecs % 60,
      isToday: true,
      isPassed: false,
      totalMs: remainingTodayMs,
    };
  }

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isToday: false, isPassed: true, totalMs: 0 };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    isToday: false,
    isPassed: false,
    totalMs: diffMs,
  };
}

/**
 * Counts working days (Mon-Fri) remaining before the holiday.
 * Today counts as remaining only if it's before the end of a work shift
 * (a shift is assumed to end at 6pm local time), so early in the day
 * today's shift is still included.
 */
export function countWorkingDays(startDate = new Date(), targetDateStr) {
  if (!targetDateStr) return { workDays: 0, weekendDays: 0 };

  const [y, m, d] = targetDateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);

  const SHIFT_END_HOUR = 18; // a work shift is assumed to end at 6pm local time

  let cur = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

  // Count today only while its shift is still ahead of us;
  // once it's 6pm or later, start counting from tomorrow
  if (startDate.getHours() >= SHIFT_END_HOUR) {
    cur.setDate(cur.getDate() + 1);
  }

  let workDays = 0;
  let weekendDays = 0;

  while (cur < target) {
    const dayOfWeek = cur.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendDays++;
    } else {
      workDays++;
    }
    cur.setDate(cur.getDate() + 1);
  }

  return { workDays, weekendDays };
}

/**
 * Friendly formatted date: "Wednesday, September 30, 2026"
 */
export function formatLongDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-CA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Compact date format: "Sep 30, 2026"
 */
export function formatMediumDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Returns weekday name: "Monday"
 */
export function formatWeekday(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-CA', { weekday: 'long' });
}
