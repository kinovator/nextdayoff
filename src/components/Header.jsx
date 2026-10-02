import { MapPin, Info, Palette } from 'lucide-react';
import { getRegionByCode, getCountryForRegion } from '../data/regions';
import { getNextTab } from '../tabs';

export default function Header({
  selectedRegion,
  onOpenRegionModal,
  onOpenInfoModal,
  onOpenThemePicker,
  activeTab,
  onToggleTab,
  isDetectingLocation,
}) {
  const region = getRegionByCode(selectedRegion);
  const country = getCountryForRegion(selectedRegion);

  // Cycle button: shows the icon of the tab it will switch to —
  // cycle order comes from src/tabs.js, same source the swipe/dots use
  const nextTab = getNextTab(activeTab);
  const NextTabIcon = nextTab.icon;

  return (
    <header className="sticky top-0 z-30 w-full glass-panel safe-pt border-b border-stone-200/80 dark:border-stone-700/80 transition-colors">
      <div className="max-w-xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* Brand — min-w-0 lets the title truncate on 320-360px phones
            instead of shoving the right-hand buttons off the screen */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          {/* App logo — the same art the PWA manifest and apple-touch-icon use
              (public/icons/icon-512.png). Decorative: the wordmark next to it
              already names the app. */}
          <img
            src="/icons/icon-512.png"
            alt=""
            width="512"
            height="512"
            className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-extrabold text-[15px] sm:text-base tracking-tight text-stone-900 dark:text-stone-100 font-sans truncate">
                NextDayOff
              </span>
              {/* Country badge: flag + code on phones, full name from sm up */}
              <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider bg-stone-200/70 text-stone-700 dark:bg-stone-700 dark:text-stone-300">
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
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-700/90 text-stone-800 dark:text-stone-200 hover:bg-stone-200/80 dark:hover:bg-stone-600/80 border border-stone-300/60 dark:border-stone-600/60 transition active:scale-95 shadow-sm"
            title="Change region or auto-detect location"
            aria-label={`Current region: ${region.name}. Click to change.`}
          >
            <MapPin
              className={`w-3.5 h-3.5 text-amber-600 dark:text-amber-400 ${
                isDetectingLocation ? 'animate-bounce' : ''
              }`}
            />
            <span>{region.code}</span>
            <span className="text-stone-400 dark:text-stone-400 text-[10px]">▼</span>
          </button>

          {/* Tab-cycle button — hidden on phones because the in-page segmented
              switcher and swipe gesture already cover navigation; it returns
              from sm up where there is room */}
          <button
            id="header-toggle-tab-btn"
            onClick={onToggleTab}
            className={`hidden sm:flex p-2 rounded-full transition active:scale-90 ${
              activeTab === 'upcoming'
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
            }`}
            aria-label={nextTab.cycleLabel}
            title={nextTab.cycleLabel}
          >
            <NextTabIcon
              className={`w-4 h-4 ${
                nextTab.key === 'countdown'
                  ? 'text-stone-600 dark:text-stone-300'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            />
          </button>

          {/* Theme (color + font) picker */}
          <button
            id="theme-picker-btn"
            onClick={onOpenThemePicker}
            className="p-2 rounded-full text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-700 transition active:scale-90"
            aria-label="Choose color theme"
            title="Pick your vibe 🎨"
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* Info Modal Button */}
          <button
            id="info-btn"
            onClick={onOpenInfoModal}
            className="p-2 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 transition active:scale-90"
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
