import { useEffect, useMemo, useState } from 'react';
import { Sparkles, Briefcase } from 'lucide-react';
import { calculateCountdown, countWorkingDays, formatWeekday, getDaysLater, MONTHS_FULL } from '../utils/dateUtils';
import { getMotivationalMessage } from '../utils/motivationalMessages';

// Auto-close delay for the overlay.
// Keep in sync with .animate-overlay-progress in src/index.css.
const AUTO_CLOSE_MS = 4500;

/**
 * First-arrival motivational overlay.
 *
 * Leads with the motivational message — the main focus — with the remaining
 * days ("N days left" / "TODAY") shown below in a smaller calendar frame as
 * a supporting detail. Auto-closes after AUTO_CLOSE_MS; tapping anywhere or
 * pressing Escape dismisses it early.
 */
export default function MotivationOverlay({ holiday, now, isOpen, onClose }) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Auto-close timer (started fresh each time the overlay opens)
  useEffect(() => {
    if (!isOpen) return undefined;
    const timer = setTimeout(() => onClose(), AUTO_CLOSE_MS);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  // Lock background scroll while the overlay is open
  useEffect(() => {
    if (!isOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  // Redraw the motivational message every time the overlay opens,
  // so re-showing it feels like a fresh page load
  const [openCount, setOpenCount] = useState(0);
  useEffect(() => {
    if (isOpen) setOpenCount((c) => c + 1);
  }, [isOpen]);

  const countdown = holiday ? calculateCountdown(holiday.date, now) : null;
  const daysLater = getDaysLater(countdown);
  const isToday = Boolean(countdown && countdown.isToday);

  // Calendar frame details (mirrors the hero's physical calendar design)
  const holidayMonthName = holiday
    ? MONTHS_FULL[parseInt(holiday.date.split('-')[1], 10) - 1]
    : '';
  const weekday = holiday ? formatWeekday(holiday.date) : '';
  const workStats = holiday
    ? countWorkingDays(now, holiday.date)
    : { workDays: 0, weekendDays: 0 };

  // Stabilized across 1-sec clock ticks so the message doesn't flicker;
  // openCount forces a fresh draw each time the overlay re-opens
  const message = useMemo(() => {
    if (daysLater === null) return '';
    return getMotivationalMessage(daysLater, isToday);
  }, [daysLater, isToday, openCount]);

  if (!holiday || !isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-stone-900/70 backdrop-blur-md cursor-pointer"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Motivational message"
    >
      <div className="w-full max-w-sm bg-sheet rounded-3xl shadow-2xl border border-stone-200/90 dark:border-stone-700 overflow-hidden animate-pop-in select-none">
        {/* The motivational message — the star of this overlay, shown first */}
        <div className="mx-5 mt-5 p-5 rounded-3xl bg-amber-500/10 border border-amber-500/25 flex flex-col items-center gap-2.5 text-center">
          <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-base sm:text-lg font-bold leading-snug text-amber-950 dark:text-amber-200">
            {message}
          </p>
        </div>

        {/* Supporting detail: days-left count in a smaller, quieter calendar frame */}
        <div className="relative mt-4 mb-3 px-5 flex flex-col items-center">
          {/* Calendar Hanging Binder Rings */}
          <div className="flex justify-between w-36 px-5 -mb-2 z-10">
            <div className="w-3.5 h-5 rounded-full bg-stone-300 dark:bg-stone-600 border-2 border-stone-100 dark:border-stone-800 shadow-sm" />
            <div className="w-3.5 h-5 rounded-full bg-stone-300 dark:bg-stone-600 border-2 border-stone-100 dark:border-stone-800 shadow-sm" />
          </div>

          {/* Calendar Card Frame (compact — the message above is the focus) */}
          <div className="w-44 rounded-2xl bg-card dark:bg-inset border-2 border-stone-200 dark:border-stone-600/80 shadow-md overflow-hidden flex flex-col items-center">
            {/* Calendar Top Header Bar */}
            <div className="w-full bg-accent-grad text-on-accent px-3 py-1.5 flex items-center justify-between border-b border-amber-700/50">
              <span className="text-[9px] font-extrabold uppercase tracking-widest">
                Next Day Off
              </span>
              <span className="text-[9px] font-bold opacity-90 tracking-wider">
                {holidayMonthName}
              </span>
            </div>

            {/* Calendar Center Sheet */}
            <div className="w-full py-3 px-3 bg-gradient-to-b from-stone-50 to-white calendar-grad flex flex-col items-center justify-center">
              {isToday ? (
                <div className="flex flex-col items-center">
                  <span className="text-2xl select-none mb-0.5">🎉</span>
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-sans tracking-tight">
                    TODAY!
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-black text-stone-900 dark:text-stone-100 font-sans tracking-tighter tabular-numbers leading-none select-none">
                    {daysLater}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 mt-1.5">
                    {daysLater === 1 ? 'Day Left' : 'Days Left'}
                  </span>
                </div>
              )}

              {/* Working shifts remaining — below the days-left count */}
              {!isToday && (
                <div className="mt-2 flex items-start gap-1 text-[9px] text-stone-500 dark:text-stone-400 text-center leading-snug">
                  <Briefcase className="w-2.5 h-2.5 text-stone-400 dark:text-stone-400 shrink-0 mt-px" />
                  <div className="leading-snug">
                    <span>
                      <strong className="text-stone-700 dark:text-stone-300">{workStats.workDays}</strong>{' '}
                      working shifts remaining
                    </span>
                    {workStats.weekendDays > 0 && (
                      <div>(+{workStats.weekendDays} weekend days)</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Calendar Bottom Perforated Edge Accent */}
            <div className="w-full border-t border-dashed border-stone-200 dark:border-stone-600/60 py-1 bg-stone-50/80 dark:bg-stone-800/40 text-[9px] text-stone-400 dark:text-stone-400 tracking-wider uppercase font-semibold text-center">
              {weekday} • {holiday.date}
            </div>
          </div>
        </div>

        {/* Tap hint + auto-close progress bar */}
        <p className="text-center text-[10px] text-stone-400 dark:text-stone-400 pb-2.5">
          Tap anywhere to continue
        </p>
        <div className="h-1 w-full bg-stone-200 dark:bg-stone-700">
          <div className="h-full bg-amber-500 animate-overlay-progress" />
        </div>
      </div>
    </div>
  );
}
