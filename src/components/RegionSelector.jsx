import React, { useState } from 'react';
import { X, Check, Navigation, Search, HelpCircle, Building2 } from 'lucide-react';
import { PROVINCES } from '../data/provinces';

export default function RegionSelector({
  isOpen,
  onClose,
  selectedRegion,
  onSelectRegion,
  includeOptional,
  onToggleIncludeOptional,
  onAutoDetectLocation,
  isDetectingLocation,
  locationFeedback,
}) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredProvinces = PROVINCES.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.capital.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#FAF8F5] dark:bg-[#18181B] rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200/90 dark:border-stone-800 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span>Select Your Jurisdiction</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Statutory holidays differ by province and territory in Canada
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition"
            aria-label="Close region selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action: Auto-Detect GPS / Location */}
        <div className="px-4 py-3 bg-stone-100/70 dark:bg-stone-800/40 border-b border-stone-200/60 dark:border-stone-800/60 flex flex-col gap-2">
          <button
            id="detect-location-btn"
            onClick={onAutoDetectLocation}
            disabled={isDetectingLocation}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 active:scale-[0.99] disabled:opacity-60 transition shadow-sm"
          >
            <Navigation className={`w-4 h-4 ${isDetectingLocation ? 'animate-spin' : ''}`} />
            <span>
              {isDetectingLocation ? 'Detecting your province...' : 'Auto-Detect Using My Location'}
            </span>
          </button>
          {locationFeedback && (
            <p className="text-[11px] text-center text-amber-700 dark:text-amber-300 font-medium">
              {locationFeedback}
            </p>
          )}
        </div>

        {/* Search */}
        <div className="p-3 border-b border-stone-200/60 dark:border-stone-800/60">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search province, territory, or capital..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700/80 text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
        </div>

        {/* Province List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 divide-y divide-stone-100 dark:divide-stone-800/40">
          {filteredProvinces.map((prov) => {
            const isSelected = prov.code === selectedRegion;
            return (
              <button
                key={prov.code}
                onClick={() => {
                  onSelectRegion(prov.code);
                  onClose();
                }}
                className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-amber-500/10 dark:bg-amber-400/15 border border-amber-500/30 dark:border-amber-400/30'
                    : 'hover:bg-stone-100/80 dark:hover:bg-stone-800/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{prov.flag}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                        {prov.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase bg-stone-200/70 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                        {prov.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      {prov.type === 'federal'
                        ? 'Banks, airlines, federal agencies'
                        : `${prov.standardHolidaysCount} official stat holidays • Capital: ${prov.capital}`}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer: Optional holidays switch */}
        <div className="p-4 bg-stone-100/90 dark:bg-stone-900/90 border-t border-stone-200 dark:border-stone-800 safe-pb">
          <label className="flex items-center justify-between cursor-pointer select-none">
            <div className="pr-3">
              <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <span>Include Civic & Optional Holidays</span>
              </span>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                Count non-mandatory holidays like Easter Monday or August Civic Day
              </p>
            </div>
            <input
              type="checkbox"
              checked={includeOptional}
              onChange={(e) => onToggleIncludeOptional(e.target.checked)}
              className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 border-stone-300 dark:border-stone-700 cursor-pointer accent-amber-500"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
