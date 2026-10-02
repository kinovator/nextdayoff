import { X, Calendar, Share2, Info } from 'lucide-react';
import { REGIONS, getRegionByCode, getCountryForRegion } from '../data/regions';
import {
  formatLongDate,
  formatWeekday,
  getActualDate,
  isStatForRegion,
  isOptionalForRegion,
} from '../utils/dateUtils';

export default function HolidayDetailModal({
  holiday,
  selectedRegion,
  isOpen,
  onClose,
}) {
  if (!isOpen || !holiday) return null;

  const currentRegion = getRegionByCode(selectedRegion);
  const currentCountry = getCountryForRegion(selectedRegion);
  const isMandatoryHere = isStatForRegion(holiday, selectedRegion);
  const isOptionalHere = isOptionalForRegion(holiday, selectedRegion);
  const actualDate = getActualDate(holiday);

  const handleShare = async () => {
    const text = `${currentCountry.flag} ${holiday.name} is on ${formatLongDate(holiday.date)}! Check the countdown on NextDayOff.`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: holiday.name,
          text,
          url: window.location.href,
        });
      } catch (e) {
        // fallback
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Holiday details copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-sheet rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200/90 dark:border-stone-700 flex flex-col max-h-[90vh] overflow-hidden animate-sheet-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-700 flex items-start justify-between">
          <div className="pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isMandatoryHere
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300'
                    : isOptionalHere
                    ? 'bg-blue-100 text-blue-900 dark:bg-blue-950/70 dark:text-blue-300'
                    : 'bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300'
                }`}
              >
                {isMandatoryHere
                  ? `Statutory in ${currentRegion.code}`
                  : isOptionalHere
                  ? `Optional in ${currentRegion.code}`
                  : `Not Stat in ${currentRegion.code}`}
              </span>

              {holiday.longWeekend && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Long Weekend
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              {holiday.name}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 mt-1">
              <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{formatLongDate(holiday.date)}</span>
              <span>•</span>
              <span className="font-semibold text-stone-700 dark:text-stone-300">
                {formatWeekday(holiday.date)}
              </span>
            </div>

            {/* Observed vs. actual date note (weekend-shifted holidays only) */}
            {actualDate && (
              <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-stone-200 dark:border-stone-600 bg-stone-100/80 dark:bg-stone-700/60 px-2.5 py-1.5 text-[11px] leading-snug text-stone-600 dark:text-stone-400">
                <Info className="w-3.5 h-3.5 mt-px shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  Actual date: <strong className="font-semibold text-stone-700 dark:text-stone-300">{formatWeekday(actualDate)}, {formatLongDate(actualDate)}</strong>
                  {' — '}observed as the day off on {formatWeekday(holiday.date)}.
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-700 transition"
            aria-label="Close holiday modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Description */}
          <div className="p-3.5 rounded-xl bg-card dark:bg-inset border border-stone-200/80 dark:border-stone-700 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
            {holiday.description || `General public holiday observed in ${currentCountry.name}.`}
          </div>

          {/* National Coverage Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
              Statutory Observance Across {currentCountry.name}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {REGIONS.filter((r) => r.country === currentCountry.code).map((prov) => {
                const isStat = isStatForRegion(holiday, prov.code);
                const isOpt = isOptionalForRegion(holiday, prov.code);
                const isCurrent = prov.code === selectedRegion;

                return (
                  <div
                    key={prov.code}
                    className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                      isCurrent
                        ? 'ring-2 ring-amber-500 border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20'
                        : 'bg-card dark:bg-inset border-stone-200/80 dark:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate pr-1">
                      <span className="text-sm">{prov.flag}</span>
                      <span className="font-semibold text-stone-800 dark:text-stone-200 truncate">
                        {prov.code}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isStat
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-300'
                          : isOpt
                          ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/60 dark:text-blue-300'
                          : 'bg-stone-100 text-stone-400 dark:bg-stone-700 dark:text-stone-400'
                      }`}
                    >
                      {isStat ? 'Stat' : isOpt ? 'Civic' : 'No'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 bg-stone-100/90 dark:bg-stone-800/90 border-t border-stone-200 dark:border-stone-700 flex gap-2 safe-pb">
          <button
            onClick={handleShare}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-accent-grad text-on-accent flex items-center justify-center gap-2 transition shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Holiday</span>
          </button>
        </div>
      </div>
    </div>
  );
}
