/**
 * Client-side persistence helpers adhering to docs/DATA_SCHEMA.md
 */

export const STORAGE_KEYS = {
  REGION: 'stat_app_region',
  THEME: 'stat_app_theme',
  INCLUDE_OPTIONAL: 'stat_app_include_optional',
  REMINDERS: 'stat_app_reminders',
  NOTIFIED: 'stat_app_notified',
};

export function getStoredRegion(defaultRegion = 'BC') {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.REGION);
    return saved || defaultRegion;
  } catch {
    return defaultRegion;
  }
}

export function setStoredRegion(regionCode) {
  try {
    localStorage.setItem(STORAGE_KEYS.REGION, regionCode);
  } catch (e) {
    console.warn('Could not persist region preference', e);
  }
}

export function getStoredTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'dark' || saved === 'light') return saved;
    // Fall back to system preference
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  } catch {
    return 'light';
  }
}

export function setStoredTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (e) {
    console.warn('Could not persist theme preference', e);
  }
}

export function getStoredIncludeOptional() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.INCLUDE_OPTIONAL);
    return saved === 'true';
  } catch {
    return false;
  }
}

export function setStoredIncludeOptional(val) {
  try {
    localStorage.setItem(STORAGE_KEYS.INCLUDE_OPTIONAL, String(val));
  } catch (e) {
    console.warn('Could not persist optional holiday preference', e);
  }
}

export function getStoredRemindersEnabled() {
  try {
    return localStorage.getItem(STORAGE_KEYS.REMINDERS) === 'true';
  } catch {
    return false;
  }
}

export function setStoredRemindersEnabled(val) {
  try {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, String(val));
  } catch (e) {
    console.warn('Could not persist reminder preference', e);
  }
}

const NOTIFIED_LIMIT = 25;

/**
 * Holiday ids already reminded about, newest first. Keeps reminders to one
 * per holiday even across reloads.
 */
export function getNotifiedHolidayIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFIED);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function markHolidayNotified(holidayId) {
  if (!holidayId) return;
  try {
    const next = [holidayId, ...getNotifiedHolidayIds().filter((id) => id !== holidayId)].slice(
      0,
      NOTIFIED_LIMIT
    );
    localStorage.setItem(STORAGE_KEYS.NOTIFIED, JSON.stringify(next));
  } catch (e) {
    console.warn('Could not persist notified holiday', e);
  }
}
