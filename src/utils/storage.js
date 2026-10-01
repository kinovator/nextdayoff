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

const NOTIFIED_LIMIT = 60;

/**
 * Reminder milestones already sent, newest first — `holidayId@offsetDays` keys,
 * or a bare holiday id to mute every milestone for that holiday. Keeps a
 * holiday from being announced twice, both across reloads and across the in-app
 * and background delivery paths.
 */
export function getNotifiedKeys() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFIED);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Marks one or more milestone keys as sent, keeping the newest first.
 */
export function markNotifiedKeys(keys) {
  const list = (Array.isArray(keys) ? keys : [keys]).filter(Boolean);
  if (!list.length) return;
  try {
    const next = [
      ...list,
      ...getNotifiedKeys().filter((key) => !list.includes(key)),
    ].slice(0, NOTIFIED_LIMIT);
    localStorage.setItem(STORAGE_KEYS.NOTIFIED, JSON.stringify(next));
  } catch (e) {
    console.warn('Could not persist notified holidays', e);
  }
}

/**
 * Merges milestones delivered elsewhere (e.g. by the service worker while the
 * app was closed) into the local list. Returns the keys that were new, so the
 * caller can tell whether someone else already sent this reminder.
 */
export function mergeNotifiedKeys(keys) {
  const known = getNotifiedKeys();
  const added = (Array.isArray(keys) ? keys : []).filter((key) => key && !known.includes(key));
  if (added.length) markNotifiedKeys(added);
  return added;
}
