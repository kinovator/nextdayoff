import { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import HeroCountdown from './components/HeroCountdown';
import HolidayList from './components/HolidayList';
import HolidayCalendar from './components/HolidayCalendar';
import RegionSelector from './components/RegionSelector';
import HolidayDetailModal from './components/HolidayDetailModal';
import InstallBanner from './components/InstallBanner';
import InfoModal from './components/InfoModal';
import MotivationOverlay from './components/MotivationOverlay';
import ReminderPrompt from './components/ReminderPrompt';

import { REGIONS, getRegionByCode, DEFAULT_REGION_CODE } from './data/regions';
import { getNextHoliday, getUpcomingHolidays } from './utils/dateUtils';
import {
  getStoredRegion,
  setStoredRegion,
  getStoredTheme,
  setStoredTheme,
  getStoredIncludeOptional,
  setStoredIncludeOptional,
  getStoredRemindersEnabled,
  setStoredRemindersEnabled,
} from './utils/storage';
import {
  REMINDER_CHECK_INTERVAL_MS,
  checkAndSendReminder,
  describeReminderOffsets,
  getNotificationPermission,
  isNotificationSupported,
  requestNotificationPermission,
} from './utils/notifications';
import {
  markReminderPlanNotified,
  mergeBackgroundReminderNotifications,
  syncReminderPlan,
} from './utils/reminderPlan';
import { detectRegionFromGeolocation, detectRegionFromTimezone } from './utils/geoUtils';

// Swipe/segmented tab order — index drives the slide transform
const TAB_ORDER = ['countdown', 'upcoming', 'calendar'];

export default function App() {
  const [selectedRegion, setSelectedRegion] = useState(() => getStoredRegion(DEFAULT_REGION_CODE));
  const [theme, setTheme] = useState(() => getStoredTheme());
  const [includeOptional, setIncludeOptional] = useState(() => getStoredIncludeOptional());
  const [now, setNow] = useState(() => new Date());

  // Active view: 'countdown' | 'upcoming'
  const [activeTab, setActiveTab] = useState('countdown');

  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedHolidayForModal, setSelectedHolidayForModal] = useState(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationFeedback, setLocationFeedback] = useState('');

  // Holiday reminders (a week ahead and 48h ahead, see utils/notifications.js)
  const [remindersEnabled, setRemindersEnabled] = useState(() => getStoredRemindersEnabled());
  const [notificationPermission, setNotificationPermission] = useState(() =>
    getNotificationPermission()
  );
  // Result of registering periodic background sync: 'registered' (reminders
  // arrive with the app closed), 'unavailable', 'unsupported', or 'unknown'.
  const [backgroundReminderSync, setBackgroundReminderSync] = useState('unknown');

  // First-arrival motivational overlay (auto-closes, see MotivationOverlay)
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(true);
  const handleCloseWelcome = useCallback(() => setIsWelcomeOpen(false), []);
  const handleShowMotivation = useCallback(() => setIsWelcomeOpen(true), []);

  // Horizontal swipe detection on the content container
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    // Must be a predominantly horizontal swipe
    if (Math.abs(diffX) > 50 && Math.abs(diffY) < 70) {
      const idx = TAB_ORDER.indexOf(activeTab);
      if (diffX > 0 && idx < TAB_ORDER.length - 1) {
        // Swiped left -> next tab
        setActiveTab(TAB_ORDER[idx + 1]);
      } else if (diffX < 0 && idx > 0) {
        // Swiped right -> previous tab
        setActiveTab(TAB_ORDER[idx - 1]);
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Synchronize dark mode class on <html>
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setStoredTheme(theme);
  }, [theme]);

  // Real-time second clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check timezone on first load if default
  useEffect(() => {
    const hasExplicitSaved = localStorage.getItem('stat_app_region');
    if (!hasExplicitSaved) {
      const tzMatch = detectRegionFromTimezone();
      if (tzMatch && tzMatch.code) {
        setSelectedRegion(tzMatch.code);
        setStoredRegion(tzMatch.code);
      }
    }
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSelectRegion = (code) => {
    setSelectedRegion(code);
    setStoredRegion(code);
    setLocationFeedback('');
  };

  const handleToggleIncludeOptional = (val) => {
    setIncludeOptional(val);
    setStoredIncludeOptional(val);
  };

  const handleToggleReminders = useCallback(async () => {
    if (!isNotificationSupported()) return;

    if (remindersEnabled) {
      setRemindersEnabled(false);
      setStoredRemindersEnabled(false);
      return;
    }

    // Must run inside the click gesture for browsers to honour the prompt
    let permission = getNotificationPermission();
    if (permission === 'default') {
      permission = await requestNotificationPermission();
    }
    setNotificationPermission(permission);

    if (permission === 'granted') {
      setRemindersEnabled(true);
      setStoredRemindersEnabled(true);
    }
  }, [remindersEnabled]);

  const handleAutoDetectLocation = async () => {
    setIsDetectingLocation(true);
    setLocationFeedback('Requesting device location...');

    try {
      const result = await detectRegionFromGeolocation();
      setSelectedRegion(result.code);
      setStoredRegion(result.code);
      setLocationFeedback(`📍 Detected ${result.name} (${result.code}) from your GPS location!`);
      setTimeout(() => {
        setIsRegionModalOpen(false);
        setLocationFeedback('');
      }, 1500);
    } catch (err) {
      console.warn('Geolocation error, falling back to timezone', err);
      const tzResult = detectRegionFromTimezone();
      if (tzResult) {
        const region = getRegionByCode(tzResult.code);
        setSelectedRegion(region.code);
        setStoredRegion(region.code);
        setLocationFeedback(`📍 Matched to ${region.name} via local timezone.`);
      } else {
        setLocationFeedback('Could not determine your region automatically.');
      }
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const nextHoliday = getNextHoliday(selectedRegion, includeOptional, now);
  const upcomingHolidays = getUpcomingHolidays(selectedRegion, includeOptional, 15, now);
  // Calendar browses further ahead than the reminder-backed list (15) — a
  // year+ of markers without bloating the reminder plan synced to the worker
  const calendarHolidays = getUpcomingHolidays(selectedRegion, includeOptional, 60, now);

  /**
   * Holiday reminder scheduler: checks on mount, every 15 minutes while open,
   * and whenever the app returns to the foreground. De-duplicated per holiday
   * and milestone inside checkAndSendReminder, so nothing fires twice — including
   * against reminders the service worker sent while the app was closed.
   */
  useEffect(() => {
    if (!remindersEnabled || !nextHoliday) return undefined;

    let cancelled = false;
    const run = async () => {
      // Absorb anything the background worker delivered while we were away
      // before deciding what still needs sending.
      await mergeBackgroundReminderNotifications();

      const result = await checkAndSendReminder({
        holiday: nextHoliday,
        region: getRegionByCode(selectedRegion),
        enabled: true,
      });
      if (cancelled) return;

      if (result.status === 'sent') {
        console.info(
          `Holiday reminder sent for ${nextHoliday.id} (${result.offsetDays} days before)`
        );
        await markReminderPlanNotified(result.sentKeys);
      }
    };

    run();
    const timer = setInterval(run, REMINDER_CHECK_INTERVAL_MS);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') run();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remindersEnabled, nextHoliday && nextHoliday.id, selectedRegion]);

  /**
   * Publishes the reminder plan (IndexedDB) the service worker replays when the
   * app is closed, registers periodic background sync, and keeps both in step
   * with the region, optional-holiday and reminder settings.
   */
  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      const result = await syncReminderPlan({
        regionCode: selectedRegion,
        holidays: upcomingHolidays,
        enabled: remindersEnabled,
        includeOptional,
      });
      if (!cancelled) setBackgroundReminderSync(result.backgroundSync);
    };

    sync();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') sync();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
    };
    // upcomingHolidays is recomputed from the ticking clock on every render, so
    // it is read from the closure rather than listed as a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remindersEnabled, selectedRegion, includeOptional]);

  // Quick switch chips for common regions of the current country
  const selectedCountry = getRegionByCode(selectedRegion).country;
  const quickChips = (
    selectedCountry === 'US' ? ['NY', 'CA', 'TX', 'FL', 'IL'] : ['BC', 'ON', 'QC', 'AB', 'FED']
  ).filter((code) => REGIONS.some((r) => r.code === code && r.country === selectedCountry));
  const regionCount = REGIONS.filter((r) => r.country === selectedCountry).length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#121110] text-stone-900 dark:text-stone-100 flex flex-col transition-colors duration-200 selection:bg-amber-200 dark:selection:bg-amber-900/60">
      {/* 100% Persistent Top Header with Consistent App Title */}
      <Header
        selectedRegion={selectedRegion}
        onOpenRegionModal={() => setIsRegionModalOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenInfoModal={() => setIsInfoModalOpen(true)}
        activeTab={activeTab}
        onToggleTab={() =>
          setActiveTab((prev) => {
            const idx = TAB_ORDER.indexOf(prev);
            return TAB_ORDER[(idx + 1) % TAB_ORDER.length];
          })
        }
        isDetectingLocation={isDetectingLocation}
      />

      {/* Main Mobile-first Container */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-4 safe-pb flex flex-col justify-between">
        <div>
          {/* Reminder opt-in — hidden once enabled, denied, or dismissed */}
          <ReminderPrompt
            isVisible={
              Boolean(nextHoliday) &&
              !remindersEnabled &&
              isNotificationSupported() &&
              notificationPermission !== 'denied'
            }
            leadTimeLabel={describeReminderOffsets()}
            onEnable={handleToggleReminders}
          />

          {/* Quick Region Selector Bar — shown from sm up. On phones the five
              chips plus "All N+" cannot fit, so location switching happens via
              the header location button (which opens this same picker) */}
          <div className="hidden sm:flex items-center justify-between gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex items-center gap-1.5">
              {quickChips.map((code) => {
                const p = getRegionByCode(code);
                const isActive = selectedRegion === code;
                return (
                  <button
                    key={code}
                    onClick={() => handleSelectRegion(code)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                      isActive
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <span>{p.flag} {code}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setIsRegionModalOpen(true)}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline whitespace-nowrap pl-2"
            >
              All {regionCount}+
            </button>
          </div>

          {/* Segmented View Switcher & Swipe Dots */}
          <div className="flex items-center justify-between gap-2 mb-3 px-0.5">
            <div className="flex-1 min-w-0 overflow-x-auto scrollbar-none">
              <div className="inline-flex p-0.5 bg-stone-200/70 dark:bg-stone-800/80 rounded-2xl border border-stone-300/40 dark:border-stone-700/50 text-xs">
                <button
                  onClick={() => setActiveTab('countdown')}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                    activeTab === 'countdown'
                      ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  ⏱ Countdown
                </button>
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                    activeTab === 'upcoming'
                      ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  📅 Upcoming
                </button>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                    activeTab === 'calendar'
                      ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  🗓 Calendar
                </button>
              </div>
            </div>

          {/* Pagination Dots */}
          <div className="flex items-center gap-1.5 shrink-0">
            {TAB_ORDER.map((tab) => (
              <span
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`h-2 rounded-full cursor-pointer transition-all ${
                  activeTab === tab
                    ? 'bg-amber-500 w-4'
                    : 'bg-stone-300 dark:bg-stone-700 w-2'
                }`}
              />
            ))}
          </div>
          </div>

          {/* Swipeable View Container */}
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="overflow-hidden w-full relative rounded-3xl"
          >
            <div
              className="flex w-full transition-transform duration-300 ease-out"
              style={{
                transform: `translateX(-${TAB_ORDER.indexOf(activeTab) * 100}%)`,
              }}
            >
              {/* Slide 1: Hero Countdown */}
              <div className="w-full shrink-0">
                <HeroCountdown
                  holiday={nextHoliday}
                  selectedRegion={selectedRegion}
                  now={now}
                  celebrationReady={!isWelcomeOpen || !nextHoliday}
                  onShowMotivation={handleShowMotivation}
                  onOpenDetailModal={(h) => setSelectedHolidayForModal(h)}
                />
                <InstallBanner />
              </div>

              {/* Slide 2: Upcoming Holidays */}
              <div className="w-full shrink-0">
                <HolidayList
                  holidays={upcomingHolidays}
                  selectedRegion={selectedRegion}
                  now={now}
                  onSelectHoliday={(h) => setSelectedHolidayForModal(h)}
                  onBackToCountdown={() => setActiveTab('countdown')}
                />
              </div>

              {/* Slide 3: Calendar */}
              <div className="w-full shrink-0">
                <HolidayCalendar
                  holidays={calendarHolidays}
                  selectedRegion={selectedRegion}
                  now={now}
                  onSelectHoliday={(h) => setSelectedHolidayForModal(h)}
                  onBackToCountdown={() => setActiveTab('countdown')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Footer */}
        <footer className="mt-8 mb-4 pt-4 border-t border-stone-200/60 dark:border-stone-800/60 text-center text-xs text-stone-400 dark:text-stone-500 space-y-1">
          <p className="flex items-center justify-center gap-1">
            <span>Built with precision for workers everywhere</span>
            <span>🌍</span>
          </p>
        </footer>
      </main>

      {/* First-arrival motivational overlay (auto-closes; celebration fires after) */}
      <MotivationOverlay
        holiday={nextHoliday}
        now={now}
        isOpen={isWelcomeOpen && Boolean(nextHoliday)}
        onClose={handleCloseWelcome}
      />

      {/* Region Picker Modal */}
      <RegionSelector
        isOpen={isRegionModalOpen}
        onClose={() => setIsRegionModalOpen(false)}
        selectedRegion={selectedRegion}
        onSelectRegion={handleSelectRegion}
        includeOptional={includeOptional}
        onToggleIncludeOptional={handleToggleIncludeOptional}
        onAutoDetectLocation={handleAutoDetectLocation}
        isDetectingLocation={isDetectingLocation}
        locationFeedback={locationFeedback}
      />

      {/* Holiday Detail Modal */}
      <HolidayDetailModal
        holiday={selectedHolidayForModal}
        selectedRegion={selectedRegion}
        isOpen={Boolean(selectedHolidayForModal)}
        onClose={() => setSelectedHolidayForModal(null)}
      />

      {/* About Info Modal */}
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        remindersEnabled={remindersEnabled}
        notificationPermission={notificationPermission}
        backgroundReminders={backgroundReminderSync}
        onToggleReminders={handleToggleReminders}
      />
    </div>
  );
}
