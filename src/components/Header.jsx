import React from 'react';
import { Sun, Moon, MapPin, Calendar, Clock, Info } from 'lucide-react';
import { getProvinceByCode } from '../data/provinces';

export default function Header({
  selectedRegion,
  onOpenRegionModal,
  theme,
  onToggleTheme,
  onOpenInfoModal,
  activeTab,
  onToggleTab,
  isDetectingLocation,
}) {
  const province = getProvinceByCode(selectedRegion);

  return (
    <header className="sticky top-0 z-30 w-full glass-panel safe-pt border-b border-stone-200/80 dark:border-stone-800/80 transition-colors">
      <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-400/15 border border-amber-500/20 dark:border-amber-400/25 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
            <span className="text-lg select-none">🍁</span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base tracking-tight text-stone-900 dark:text-stone-100 font-sans">
                NextDayOff
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider bg-stone-200/70 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                Canada
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
              Stat Holiday Countdown
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center space-x-1 sm:space-x-1.5">
          {/* Region Switcher Button */}
          <button
            id="region-selector-btn"
            onClick={onOpenRegionModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800/90 text-stone-800 dark:text-stone-200 hover:bg-stone-200/80 dark:hover:bg-stone-700/80 border border-stone-300/60 dark:border-stone-700/60 transition active:scale-95 shadow-sm"
            title="Change province or auto-detect location"
            aria-label={`Current province: ${province.name}. Click to change.`}
          >
            <MapPin
              className={`w-3.5 h-3.5 text-amber-600 dark:text-amber-400 ${
                isDetectingLocation ? 'animate-bounce' : ''
              }`}
            />
            <span>{province.code}</span>
            <span className="text-stone-400 dark:text-stone-500 text-[10px]">▼</span>
          </button>

          {/* Toggle between Countdown & Upcoming Holidays */}
          <button
            id="header-toggle-tab-btn"
            onClick={onToggleTab}
            className={`p-2 rounded-full transition active:scale-90 ${
              activeTab === 'upcoming'
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
            aria-label={
              activeTab === 'upcoming'
                ? 'Switch back to Hero Countdown'
                : 'Switch to Upcoming Holidays Calendar'
            }
            title={
              activeTab === 'upcoming'
                ? 'Back to Countdown'
                : 'View Upcoming Holidays'
            }
          >
            {activeTab === 'upcoming' ? (
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            ) : (
              <Calendar className="w-4 h-4 text-stone-600 dark:text-stone-300" />
            )}
          </button>

          {/* Theme toggle */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            className="p-2 rounded-full text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition active:scale-90"
            aria-label="Toggle dark/light theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-stone-600" />
            )}
          </button>

          {/* Info Modal Button */}
          <button
            id="info-btn"
            onClick={onOpenInfoModal}
            className="p-2 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition active:scale-90"
            aria-label="App info & rules"
            title="About Statutory Holidays in Canada"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
