import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import HeroCountdown from './components/HeroCountdown';
import HolidayList from './components/HolidayList';
import RegionSelector from './components/RegionSelector';
import HolidayDetailModal from './components/HolidayDetailModal';
import InstallBanner from './components/InstallBanner';
import InfoModal from './components/InfoModal';

import { PROVINCES, getProvinceByCode, DEFAULT_PROVINCE_CODE } from './data/provinces';
import { getNextHoliday, getUpcomingHolidays } from './utils/dateUtils';
import {
  getStoredRegion,
  setStoredRegion,
  getStoredTheme,
  setStoredTheme,
  getStoredIncludeOptional,
  setStoredIncludeOptional,
} from './utils/storage';
import { detectRegionFromGeolocation, detectRegionFromTimezone } from './utils/geoUtils';

export default function App() {
  const [selectedRegion, setSelectedRegion] = useState(() => getStoredRegion(DEFAULT_PROVINCE_CODE));
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
      if (diffX > 0 && activeTab === 'countdown') {
        // Swiped Left on Countdown -> Go to Upcoming
        setActiveTab('upcoming');
      } else if (diffX < 0 && activeTab === 'upcoming') {
        // Swiped Right on Upcoming -> Return to Countdown
        setActiveTab('countdown');
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
        const prov = getProvinceByCode(tzResult.code);
        setSelectedRegion(prov.code);
        setStoredRegion(prov.code);
        setLocationFeedback(`📍 Matched to ${prov.name} via local timezone.`);
      } else {
        setLocationFeedback('Could not determine your Canadian province automatically.');
      }
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const currentProvince = getProvinceByCode(selectedRegion);
  const nextHoliday = getNextHoliday(selectedRegion, includeOptional, now);
  const upcomingHolidays = getUpcomingHolidays(selectedRegion, includeOptional, 15, now);

  // Quick switch chips for common provinces
  const quickChips = ['BC', 'ON', 'QC', 'AB', 'FED'];

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
          setActiveTab((prev) => (prev === 'countdown' ? 'upcoming' : 'countdown'))
        }
        isDetectingLocation={isDetectingLocation}
      />

      {/* Main Mobile-first Container */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-4 safe-pb flex flex-col justify-between">
        <div>
          {/* Quick Region Selector Bar */}
          <div className="flex items-center justify-between gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex items-center gap-1.5">
              {quickChips.map((code) => {
                const p = getProvinceByCode(code);
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
              All 13+
            </button>
          </div>

          {/* Segmented View Switcher & Swipe Hint */}
          <div className="flex items-center justify-between gap-2 mb-3 px-0.5">
            <div className="inline-flex p-0.5 bg-stone-200/70 dark:bg-stone-800/80 rounded-2xl border border-stone-300/40 dark:border-stone-700/50 text-xs">
              <button
                onClick={() => setActiveTab('countdown')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  activeTab === 'countdown'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                ⏱ Next Day Off
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  activeTab === 'upcoming'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                📅 Upcoming ({upcomingHolidays.length})
              </button>
            </div>

            {/* Pagination Dots indicator */}
            <div className="flex items-center gap-1.5 text-stone-400 dark:text-stone-500 text-[11px]">
              <span className="hidden sm:inline">Swipe</span>
              <span
                onClick={() => setActiveTab('countdown')}
                className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                  activeTab === 'countdown'
                    ? 'bg-amber-500 w-4'
                    : 'bg-stone-300 dark:bg-stone-700'
                }`}
              />
              <span
                onClick={() => setActiveTab('upcoming')}
                className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                  activeTab === 'upcoming'
                    ? 'bg-amber-500 w-4'
                    : 'bg-stone-300 dark:bg-stone-700'
                }`}
              />
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
                transform:
                  activeTab === 'countdown' ? 'translateX(0%)' : 'translateX(-100%)',
              }}
            >
              {/* Slide 1: Hero Countdown */}
              <div className="w-full shrink-0">
                <HeroCountdown
                  holiday={nextHoliday}
                  selectedRegion={selectedRegion}
                  now={now}
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
            </div>
          </div>
        </div>

        {/* Minimal Footer */}
        <footer className="mt-8 mb-4 pt-4 border-t border-stone-200/60 dark:border-stone-800/60 text-center text-xs text-stone-400 dark:text-stone-500 space-y-1">
          <p className="flex items-center justify-center gap-1">
            <span>Built with precision for Canadian workers</span>
            <span>🍁</span>
          </p>
          <p className="text-[10px] text-stone-400/80 dark:text-stone-600">
            Statutory entitlement verified under Federal & Provincial Employment Standards.
          </p>
        </footer>
      </main>

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
      />
    </div>
  );
}
