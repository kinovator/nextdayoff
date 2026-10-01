import { Sun, Moon, MapPin, Calendar, Clock, Info } from 'lucide-react';
import { getRegionByCode, getCountryForRegion } from '../data/regions';

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
  const region = getRegionByCode(selectedRegion);
  const country = getCountryForRegion(selectedRegion);

  return (
    <header className="sticky top-0 z-30 w-full glass-panel safe-pt border-b border-stone-200/80 dark:border-stone-800/80 transition-colors">
      <div className="max-w-xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* Brand — min-w-0 lets the title truncate on 320-360px phones
            instead of shoving the right-hand buttons off the screen */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-xl bg-amber-500/10 dark:bg-amber-400/15 border border-amber-500/20 dark:border-amber-400/25 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
            <span className="text-base sm:text-lg select-none">⏳</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-extrabold text-[15px] sm:text-base tracking-tight text-stone-900 dark:text-stone-100 font-sans truncate">
                NextDayOff
              </span>
              {/* Country badge: flag + code on phones, full name from sm up */}
              <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider bg-stone-200/70 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                <span className="sm:hidden">
                  {country.flag} {country.code}
                </span>
                <span className="hidden sm:inline">{country.name}</span>
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium truncate">
              Stat Holiday Countdown
            </p>
          </div>
        </div>

        {/* Right actions — shrink-0 keeps every control reachable on small screens */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Region Switcher Button — the primary location control on phones */}
          <button
            id="region-selector-btn"
            onClick={onOpenRegionModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800/90 text-stone-800 dark:text-stone-200 hover:bg-stone-200/80 dark:hover:bg-stone-700/80 border border-stone-300/60 dark:border-stone-700/60 transition active:scale-95 shadow-sm"
            title="Change region or auto-detect location"
            aria-label={`Current region: ${region.name}. Click to change.`}
          >
            <MapPin
              className={`w-3.5 h-3.5 text-amber-600 dark:text-amber-400 ${
                isDetectingLocation ? 'animate-bounce' : ''
              }`}
            />
            <span>{region.code}</span>
            <span className="text-stone-400 dark:text-stone-500 text-[10px]">▼</span>
          </button>

          {/* Toggle between Countdown & Upcoming Holidays — hidden on phones
              because it is already offered by the in-page segmented switcher
              and swipe gesture; it returns from sm up where there is room */}
          <button
            id="header-toggle-tab-btn"
            onClick={onToggleTab}
            className={`hidden sm:flex p-2 rounded-full transition active:scale-90 ${
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
            title="About Statutory Holidays"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
