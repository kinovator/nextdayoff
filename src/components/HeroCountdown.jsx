import { useEffect, useState, useCallback } from 'react';
import {
  Share2,
  Briefcase,
  Info,
  Clock,
} from 'lucide-react';
import {
  calculateCountdown,
  countWorkingDays,
  formatLongDate,
  formatWeekday,
  isStatForRegion,
  getDaysLater,
  MONTHS_FULL,
} from '../utils/dateUtils';
import { getRegionByCode } from '../data/regions';
import { triggerCelebration } from '../utils/celebrations';

export default function HeroCountdown({
  holiday,
  selectedRegion,
  now,
  onOpenDetailModal,
  celebrationReady = true,
  onShowMotivation = () => {},
}) {
  const region = getRegionByCode(selectedRegion);

  if (!holiday) {
    return (
      <div className="w-full p-8 rounded-3xl bg-card dark:bg-inset border border-stone-200/80 dark:border-stone-700 text-center shadow-card">
        <p className="text-stone-500 dark:text-stone-400 text-sm">
          No statutory holidays found for {region.name}.
        </p>
      </div>
    );
  }

  const countdown = calculateCountdown(holiday.date, now);
  const { workDays, weekendDays } = countWorkingDays(now, holiday.date);
  const isMandatoryStat = isStatForRegion(holiday, selectedRegion);
  const weekday = formatWeekday(holiday.date);

  // Month name for calendar header
  const monthNum = holiday.date.split('-')[1];
  const holidayMonthName = MONTHS_FULL[parseInt(monthNum, 10) - 1];

  // Rounded up days to the holiday:
  const daysLater = getDaysLater(countdown);

  // Counter used to restart the hero card flash animation on every celebration
  const [celebrationNonce, setCelebrationNonce] = useState(0);

  // Trigger the tiered celebration animation on the main screen hero section.
  // The effect is chosen by time remaining (see src/utils/celebrations.js):
  // confetti finale today (the only party effect), motivational emoji pops
  // before that — 📅 ⏰ 🚀 💪 🌱 ⏳ escalating as the day off gets closer.
  const handleCelebration = useCallback(() => {
    triggerCelebration(daysLater, countdown.isToday);
    setCelebrationNonce((n) => n + 1);
  }, [daysLater, countdown.isToday]);

  // When app opens, the first-arrival overlay shows the motivational message;
  // once it closes (celebrationReady), fire the tiered celebration on the hero
  // screen — the tier (and effect intensity) always scales with time remaining:
  // a motivational emoji beat (📅 ⏰ 🚀 💪 🌱 ⏳) until the day off, then the
  // full confetti finale.
  useEffect(() => {
    if (celebrationReady) {
      handleCelebration();
    }
  }, [holiday.id, celebrationReady, handleCelebration]);

  const handleShare = async () => {
    const text = countdown.isToday
      ? `🎉 Today is ${holiday.name} in ${region.name}! Happy statutory holiday!`
      : `⏳ Only ${daysLater} day${daysLater === 1 ? '' : 's'} left until ${holiday.name} (${region.name})!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `NextDayOff: ${holiday.name}`,
          text,
          url: window.location.href,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard(text);
        }
      }
    } else {
      copyToClipboard(text);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied countdown to clipboard!');
  };

  return (
    <section className="w-full relative overflow-hidden rounded-3xl bg-card border border-stone-200/90 dark:border-stone-700 shadow-card dark:shadow-card-dark p-5 sm:p-7 flex flex-col items-center text-center transition-all">
      {/* Background subtle ambient warmth */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 dark:bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-stone-500/5 dark:bg-stone-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Celebration flash ring — remounts via key so it restarts on every celebration */}
      {celebrationNonce > 0 && (
        <div
          key={celebrationNonce}
          className="absolute inset-0 rounded-3xl pointer-events-none animate-celebrate-flash"
        />
      )}

      {/* Top minimal status pills */}
      <div className="w-full flex items-center justify-between gap-2 mb-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
              isMandatoryStat
                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300/40 dark:border-amber-700/40'
                : 'bg-stone-200/80 text-stone-700 dark:bg-stone-700 dark:text-stone-300'
            }`}
          >
            {isMandatoryStat ? 'Stat Holiday' : 'Optional / Civic'}
          </span>
          {holiday.longWeekend && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold pill-weekend pill-weekend-bordered">
              Long Weekend
            </span>
          )}
        </div>
        <span className="text-stone-400 dark:text-stone-400 text-[11px] font-medium">
          {region.code} • {region.name}
        </span>
      </div>

      {/* THE HERO: Centered Physical Calendar Frame */}
      <div className="relative my-3 flex flex-col items-center">
        {/* Calendar Hanging Binder Rings */}
        <div className="flex justify-between w-48 sm:w-56 px-6 -mb-2 z-10">
          <div className="w-4 h-6 rounded-full bg-stone-300 dark:bg-stone-600 border-2 border-stone-100 dark:border-stone-800 shadow-sm" />
          <div className="w-4 h-6 rounded-full bg-stone-300 dark:bg-stone-600 border-2 border-stone-100 dark:border-stone-800 shadow-sm" />
        </div>

        {/* Calendar Card Frame */}
        <div className="w-64 sm:w-72 rounded-2xl bg-card dark:bg-inset border-2 border-stone-200 dark:border-stone-600/80 shadow-xl overflow-hidden flex flex-col items-center">
          {/* Calendar Top Header Bar */}
          <div className="w-full bg-accent-grad text-on-accent px-4 py-2.5 flex items-center justify-between border-b border-amber-700/50">
            <span className="text-[11px] font-extrabold uppercase tracking-widest">
              NEXT DAY OFF
            </span>
            <span className="text-[11px] font-bold opacity-90 tracking-wider">
              {holidayMonthName}
            </span>
          </div>

          {/* Calendar Center Sheet with Giant Number */}
          <div className="w-full py-6 px-4 bg-gradient-to-b from-stone-50 to-white calendar-grad flex flex-col items-center justify-center">
            {countdown.isToday ? (
              <div className="py-2 flex flex-col items-center">
                <span className="text-5xl select-none animate-bounce mb-1">🎉</span>
                <span className="text-5xl sm:text-6xl font-black text-amber-600 dark:text-amber-400 font-sans tracking-tight">
                  TODAY!
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-400 mt-1">
                  Enjoy Your Holiday
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {/* THE AT-A-GLANCE NUMBER */}
                <span className="text-8xl sm:text-9xl font-black text-stone-900 dark:text-stone-100 font-sans tracking-tighter tabular-numbers leading-none select-none drop-shadow-xs">
                  {daysLater}
                </span>
                <span className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 mt-2">
                  {daysLater === 1 ? 'day left' : 'days left'}
                </span>
              </div>
            )}

            {/* Remaining shifts — inside the calendar frame (consistent with the overlay) */}
            {!countdown.isToday && (
              <div className="mt-3 text-[11px] text-stone-400 dark:text-stone-400 flex items-start gap-1">
                <Briefcase className="w-3 h-3 text-stone-400 mt-0.5 shrink-0" />
                <div className="leading-snug">
                  <span>
                    <strong className="text-stone-600 dark:text-stone-300">{workDays} working shifts</strong> remaining
                  </span>
                  {weekendDays > 0 && (
                    <div>(+{weekendDays} weekend days)</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Calendar Bottom Perforated Edge Accent */}
          <div className="w-full border-t border-dashed border-stone-200 dark:border-stone-600/60 py-1.5 bg-stone-50/80 dark:bg-stone-800/40 text-[10px] text-stone-400 dark:text-stone-400 tracking-wider uppercase font-semibold">
            {weekday} • {holiday.date}
          </div>
        </div>
      </div>

      {/* Target Holiday Name & Date */}
      <div className="mt-4 mb-2 max-w-md">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100 font-sans">
          {holiday.name}
        </h1>
        <p className="text-xs sm:text-sm font-medium text-stone-500 dark:text-stone-400 mt-1">
          {formatLongDate(holiday.date)}
        </p>
      </div>

      {/* Motivation opener + emoji celebrate — left spacer balances the circle so the button text stays app-centered */}
      <div className="my-2.5 max-w-sm w-full flex items-center gap-2">
        <div className="w-11 shrink-0" aria-hidden="true" />
        <button
          onClick={onShowMotivation}
          type="button"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border transition-all active:scale-[0.98] cursor-pointer bg-amber-500/10 hover:bg-amber-500/15 dark:bg-amber-400/10 dark:hover:bg-amber-400/15 border-amber-500/20 dark:border-amber-400/20 shadow-xs"
          title="Show motivational message"
        >
          <span className="text-base leading-none select-none shrink-0">🔥🔥🔥</span>
          <span className="text-xs sm:text-[13px] font-semibold text-amber-950 dark:text-amber-200 tracking-tight">
            Fire Me Up!
          </span>
        </button>

        {/* Animated circle emoji — click to celebrate (tier scales with time left) */}
        <button
          onClick={handleCelebration}
          type="button"
          className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center bg-amber-500/15 hover:bg-amber-500/25 dark:bg-amber-400/15 dark:hover:bg-amber-400/25 border border-amber-500/30 dark:border-amber-400/30 animate-bounce transition active:scale-95 cursor-pointer shadow-xs"
          title="Celebrate"
          aria-label="Celebrate"
        >
          <span className="text-xl leading-none select-none">🎉</span>
        </button>
      </div>

      {/* Exact wait — hidden on the day itself (nothing left to wait for) */}
      {!countdown.isToday && (
        <div className="flex justify-center my-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 text-[11px] text-stone-500 dark:text-stone-400 tabular-numbers">
            <Clock className="w-3 h-3 text-stone-400 shrink-0" />
            <span>Exact wait:</span>
            <span className="font-semibold text-stone-700 dark:text-stone-300 font-mono">
              {countdown.days}d {String(countdown.hours).padStart(2, '0')}h {String(countdown.minutes).padStart(2, '0')}m {String(countdown.seconds).padStart(2, '0')}s
            </span>
          </div>
        </div>
      )}

      {/* Minimal Action Buttons Bar */}
      <div className="w-full grid grid-cols-2 gap-2 pt-3 mt-3 border-t border-stone-100 dark:border-stone-700/80">
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-200/80 dark:hover:bg-stone-600 transition active:scale-95"
          title="Share countdown"
        >
          <Share2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Share</span>
        </button>

        <button
          onClick={() => onOpenDetailModal(holiday)}
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-200/80 dark:hover:bg-stone-600 transition active:scale-95"
          title="Holiday details"
        >
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Details</span>
        </button>
      </div>
    </section>
  );
}
