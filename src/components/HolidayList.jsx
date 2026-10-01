import { useState } from 'react';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import {
  formatMediumDate,
  formatWeekday,
  isStatForRegion,
  getLocalDateString,
} from '../utils/dateUtils';

export default function HolidayList({
  holidays,
  selectedRegion,
  now,
  onSelectHoliday,
  onBackToCountdown,
}) {
  const todayStr = getLocalDateString(now);

  // Year filter pills derive from the clock — never hardcoded — so they roll
  // over automatically: current year, next year, then "All".
  const currentYear = String(now.getFullYear());
  const nextYear = String(now.getFullYear() + 1);
  const availableYears = [currentYear, nextYear];

  // Default to the current year (what's left this year); fall back to next
  // year when the current year has no upcoming holidays left (late December).
  const [filterYear, setFilterYear] = useState(() =>
    holidays.some((h) => h.date.startsWith(currentYear)) ? currentYear : nextYear
  );

  // If a session crosses New Year, the stored year can fall out of the pill
  // set — fall back to the fresh current year so the filter never goes stale.
  const effectiveYear =
    filterYear === 'all' || availableYears.includes(filterYear) ? filterYear : currentYear;

  const filteredHolidays = holidays.filter((h) => {
    if (effectiveYear === 'all') return true;
    return h.date.startsWith(effectiveYear);
  });

  function getDaysRemaining(targetDateStr) {
    if (targetDateStr === todayStr) return 'Today!';
    const [y, m, d] = targetDateStr.split('-').map(Number);
    const target = new Date(y, m - 1, d);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Tomorrow';
    return `in ${diffDays} days`;
  }

  return (
    <section className="w-full rounded-3xl bg-white dark:bg-[#18181B] border border-stone-200/90 dark:border-stone-800 shadow-card dark:shadow-card-dark p-4 sm:p-6 transition-all">
      {/* Top Header of the Upcoming Holidays view */}
      <div className="pb-3 mb-3 border-b border-stone-100 dark:border-stone-800 space-y-2">
        {/* Row 1: back + title */}
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToCountdown}
            className="p-1.5 -ml-1 rounded-xl text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-400/10 hover:bg-amber-500/20 transition active:scale-95"
            title="Return to Countdown"
            aria-label="Back to Countdown"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
            <span>Upcoming Holidays</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-mono">
              {filteredHolidays.length}
            </span>
          </h2>
        </div>

        {/* Row 2: Year Filter Pills — current year first, then next year, "All" last */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800/80 p-0.5 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
          {availableYears.map((yr) => (
            <button
              key={yr}
              onClick={() => setFilterYear(yr)}
              className={`flex-1 px-2 py-1 rounded-lg text-xs font-semibold transition ${
                effectiveYear === yr
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-400 dark:text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              {yr}
            </button>
          ))}
          <button
            onClick={() => setFilterYear('all')}
            className={`flex-1 px-2 py-1 rounded-lg text-xs font-semibold transition ${
              effectiveYear === 'all'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-400 dark:text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Scrollable list — scrollbar gutter reserved so layout never shifts between year filters */}
      <div className="space-y-2 max-h-[62vh] overflow-y-auto [scrollbar-gutter:stable] pr-0.5">
        {filteredHolidays.length === 0 ? (
          <div className="p-8 rounded-2xl bg-stone-50 dark:bg-stone-900/40 text-center text-xs text-stone-400 border border-dashed border-stone-200 dark:border-stone-800">
            No holidays found for this year.
          </div>
        ) : (
          filteredHolidays.map((holiday) => {
            const isMandatory = isStatForRegion(holiday, selectedRegion);
            const daysRemaining = getDaysRemaining(holiday.date);
            const isToday = holiday.date === todayStr;
            const weekday = formatWeekday(holiday.date);

            const [year, monthNum, dayNum] = holiday.date.split('-');
            const monthNames = [
              'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
            ];
            const monthName = monthNames[parseInt(monthNum, 10) - 1];

            return (
              <div
                key={holiday.id}
                onClick={() => onSelectHoliday(holiday)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onSelectHoliday(holiday)}
                className="group relative flex items-center justify-between p-3 rounded-2xl bg-stone-50/80 dark:bg-[#201E1B] border border-stone-200/80 dark:border-stone-800/80 shadow-xs hover:shadow-md hover:border-amber-500/40 dark:hover:border-amber-500/40 transition active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Calendar Month/Day Block */}
                  <div
                    className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center border shrink-0 ${
                      isToday
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100'
                    }`}
                  >
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider ${
                        isToday ? 'text-amber-100' : 'text-stone-400 dark:text-stone-500'
                      }`}
                    >
                      {monthName}
                    </span>
                    <span className="text-sm font-extrabold font-mono -mt-0.5">
                      {parseInt(dayNum, 10)}
                    </span>
                  </div>

                  {/* Holiday Info */}
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {holiday.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
                      <span>{weekday}</span>
                      <span>•</span>
                      <span>{formatMediumDate(holiday.date)}</span>
                      {holiday.longWeekend && (
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                          • Long Weekend
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Days Remaining Badge & Arrow */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex flex-col items-end">
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? 'text-amber-600 dark:text-amber-400 animate-pulse'
                          : 'text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {daysRemaining}
                    </span>
                    <span
                      className={`text-[9px] font-medium ${
                        isMandatory
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-stone-400 dark:text-stone-500'
                      }`}
                    >
                      {isMandatory ? 'Stat' : 'Optional'}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-200 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
