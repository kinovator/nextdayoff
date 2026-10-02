import { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import {
  formatMediumDate,
  formatWeekday,
  getLocalDateString,
  isStatForRegion,
  isOptionalForRegion,
} from '../utils/dateUtils';

const WEEKDAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function pad(n) {
  return String(n).padStart(2, '0');
}

/**
 * Month-by-month calendar view of the upcoming holidays.
 * Same data as the Upcoming list, rendered on a grid: amber day cells are
 * holidays (tap to open the detail modal), plus the month's holidays listed
 * below with their countdown. Navigation is clamped between the current
 * month and the month of the last upcoming holiday.
 */
export default function HolidayCalendar({
  holidays,
  selectedRegion,
  now,
  onSelectHoliday,
  onBackToCountdown,
}) {
  const todayStr = getLocalDateString(now);

  const minMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastHoliday = holidays[holidays.length - 1];
  const maxMonth = lastHoliday
    ? new Date(
        Number(lastHoliday.date.slice(0, 4)),
        Number(lastHoliday.date.slice(5, 7)) - 1,
        1
      )
    : minMonth;

  const [viewMonth, setViewMonth] = useState(
    () => new Date(now.getFullYear(), now.getMonth(), 1)
  );

  // If the clock crosses into a new month while open, never stay behind today
  const monthDate = viewMonth.getTime() < minMonth.getTime() ? minMonth : viewMonth;
  const canGoPrev = monthDate.getTime() > minMonth.getTime();
  const canGoNext = monthDate.getTime() < maxMonth.getTime();

  const year = monthDate.getFullYear();
  const monthIndex = monthDate.getMonth();
  const monthName = monthDate.toLocaleDateString('en-CA', {
    month: 'long',
    year: 'numeric',
  });

  const goToPrevMonth = () => setViewMonth(new Date(year, monthIndex - 1, 1));
  const goToNextMonth = () => setViewMonth(new Date(year, monthIndex + 1, 1));

  // Holidays of the displayed month, indexed by day-of-month
  const monthPrefix = `${year}-${pad(monthIndex + 1)}`;
  const monthHolidays = holidays.filter((h) => h.date.startsWith(monthPrefix));
  const holidayByDay = {};
  monthHolidays.forEach((h) => {
    const day = Number(h.date.slice(8, 10));
    if (!holidayByDay[day]) holidayByDay[day] = [];
    holidayByDay[day].push(h);
  });

  // Grid cells: leading blanks, day numbers, trailing blanks to a full week
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startWeekday = new Date(year, monthIndex, 1).getDay();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  function getDaysRemaining(targetDateStr) {
    if (targetDateStr === todayStr) return 'Today!';
    const [y, m, d] = targetDateStr.split('-').map(Number);
    const target = new Date(y, m - 1, d);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Tomorrow';
    return `in ${diffDays} days`;
  }

  return (
    <section className="w-full rounded-3xl bg-card border border-stone-200/90 dark:border-stone-700 shadow-card dark:shadow-card-dark p-4 sm:p-6 transition-all">
      {/* Header: back + title */}
      <div className="pb-3 mb-3 border-b border-stone-100 dark:border-stone-700 flex items-center gap-2">
        <button
          onClick={onBackToCountdown}
          className="p-1.5 -ml-1 rounded-xl text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-400/10 hover:bg-amber-500/20 transition active:scale-95"
          title="Return to Countdown"
          aria-label="Back to Countdown"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
          <span>Calendar</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400 font-mono">
            {monthHolidays.length}
          </span>
        </h2>
        {canGoPrev && (
          <button
            onClick={() => setViewMonth(new Date(now.getFullYear(), now.getMonth(), 1))}
            className="ml-auto px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-400/10 hover:bg-amber-500/20 transition active:scale-95"
            aria-label="Jump to current month"
          >
            View Today
          </button>
        )}
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={goToPrevMonth}
          disabled={!canGoPrev}
          className={`p-2 rounded-xl transition active:scale-95 ${
            canGoPrev
              ? 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
              : 'text-stone-300 dark:text-stone-700 cursor-not-allowed'
          }`}
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs sm:text-sm font-bold text-accent tracking-wide">
          {monthName}
        </span>
        <button
          onClick={goToNextMonth}
          disabled={!canGoNext}
          className={`p-2 rounded-xl transition active:scale-95 ${
            canGoNext
              ? 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
              : 'text-stone-300 dark:text-stone-700 cursor-not-allowed'
          }`}
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_HEADERS.map((wd, i) => (
          <span
            key={`${wd}-${i}`}
            className="text-center text-[10px] font-bold uppercase tracking-wider text-accent py-1"
          >
            {wd}
          </span>
        ))}
      </div>


      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) {
            return <span key={`blank-${i}`} className="aspect-square" />;
          }

          const dateStr = `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
          const dayHolidays = holidayByDay[day] || [];
          const hasHoliday = dayHolidays.length > 0;
          const isToday = dateStr === todayStr;
          const isWeekend = i % 7 === 0 || i % 7 === 6;

          const handleDayClick = () => {
            if (hasHoliday && onSelectHoliday) onSelectHoliday(dayHolidays[0]);
          };

          return (
            <button
              key={dateStr}
              onClick={handleDayClick}
              disabled={!hasHoliday}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-semibold transition active:scale-95 ${
                hasHoliday
                  ? 'bg-accent-grad text-on-accent shadow-xs cursor-pointer'
                  : isToday
                  ? 'ring-2 ring-amber-500 text-stone-900 dark:text-stone-100'
                  : isWeekend
                  ? 'text-stone-400 dark:text-stone-600'
                  : 'text-stone-700 dark:text-stone-300'
              }`}
              aria-label={
                hasHoliday
                  ? `${dayHolidays[0].name} on ${formatMediumDate(dateStr)}`
                  : undefined
              }
            >
              <span className={hasHoliday ? 'font-bold' : ''}>{day}</span>
              {hasHoliday && (
                <span className="text-[8px] font-extrabold uppercase tracking-wider opacity-90 leading-none mt-0.5 truncate max-w-full px-0.5">
                  {dayHolidays[0].name.split(' ')[0]}
                </span>
              )}
            </button>
          );
        })}
      </div>


      {/* This month's holidays — same info as the list view */}
      <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-700 space-y-2">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-accent">
          Holidays in {monthDate.toLocaleDateString('en-CA', { month: 'long' })}
        </h3>

        {monthHolidays.length === 0 ? (
          <p className="text-xs text-stone-400 dark:text-stone-400 py-2">
            No holidays this month.
          </p>
        ) : (
          monthHolidays.map((holiday) => {
            const isStat = isStatForRegion(holiday, selectedRegion);
            const isOptional = isOptionalForRegion(holiday, selectedRegion);
            const isToday = holiday.date === todayStr;

            return (
              <button
                key={holiday.id}
                onClick={() => onSelectHoliday && onSelectHoliday(holiday)}
                className="w-full group flex items-center justify-between p-3 rounded-2xl bg-stone-50/80 dark:bg-inset border border-stone-200/80 dark:border-stone-700/80 shadow-xs hover:shadow-md hover:border-amber-500/40 transition active:scale-[0.99] cursor-pointer text-left"
              >
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                    {holiday.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
                    <span>{formatWeekday(holiday.date)}</span>
                    <span>•</span>
                    <span>{formatMediumDate(holiday.date)}</span>
                    {holiday.longWeekend && (
                      <span className="text-weekend font-semibold">
                        • Long Weekend
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 pl-2">
                  <span
                    className={`text-xs font-bold ${
                      isToday
                        ? 'text-amber-600 dark:text-amber-400 animate-pulse'
                        : 'text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {getDaysRemaining(holiday.date)}
                  </span>
                  <span
                    className={`text-[9px] font-medium ${
                      isStat
                        ? 'text-amber-600 dark:text-amber-400'
                        : isOptional
                        ? 'text-civic'
                        : 'text-stone-400 dark:text-stone-400'
                    }`}
                  >
                    {isStat ? 'Stat' : isOptional ? 'Optional' : 'Civic'}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}

