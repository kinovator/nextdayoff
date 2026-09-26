import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Calendar as CalendarIcon,
  Share2,
  Briefcase,
  Download,
  Info,
  Clock,
} from 'lucide-react';
import {
  calculateCountdown,
  countWorkingDays,
  formatLongDate,
  formatWeekday,
  isStatForRegion,
} from '../utils/dateUtils';
import { getProvinceByCode } from '../data/provinces';

export default function HeroCountdown({
  holiday,
  selectedRegion,
  now,
  onOpenDetailModal,
}) {
  const province = getProvinceByCode(selectedRegion);

  if (!holiday) {
    return (
      <div className="w-full p-8 rounded-3xl bg-white/70 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 text-center shadow-card">
        <p className="text-stone-500 dark:text-stone-400 text-sm">
          No statutory holidays found for {province.name}.
        </p>
      </div>
    );
  }

  const countdown = calculateCountdown(holiday.date, now);
  const { workDays, weekendDays } = countWorkingDays(now, holiday.date);
  const isMandatoryStat = isStatForRegion(holiday, selectedRegion);
  const weekday = formatWeekday(holiday.date);

  // Month name for calendar header
  const [yearNum, monthNum, dayNum] = holiday.date.split('-');
  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
  ];
  const holidayMonthName = monthNames[parseInt(monthNum, 10) - 1];

  // Rounded up days to the holiday:
  const daysLater = countdown.isToday
    ? 0
    : Math.max(1, Math.ceil(countdown.totalMs / (1000 * 60 * 60 * 24)));

  // Trigger celebratory confetti if today is the holiday
  useEffect(() => {
    if (countdown.isToday) {
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.55 },
          colors: ['#D97706', '#FAF8F5', '#78716C', '#F59E0B'],
        });
      } catch (e) {
        // ignore
      }
    }
  }, [countdown.isToday]);

  const handleShare = async () => {
    const text = countdown.isToday
      ? `🎉 Today is ${holiday.name} in ${province.name}! Happy statutory holiday!`
      : `⏳ ${daysLater} day${daysLater === 1 ? '' : 's'} later is ${holiday.name} (${province.name})! Next day off is coming up!`;

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

  const handleDownloadICS = () => {
    const [y, m, d] = holiday.date.split('-').map(Number);
    const startStr = `${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`;
    const nextDate = new Date(y, m - 1, d + 1);
    const endStr = `${nextDate.getFullYear()}${String(nextDate.getMonth() + 1).padStart(2, '0')}${String(nextDate.getDate()).padStart(2, '0')}`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//NextDayOff Canada//Holiday Countdown//EN',
      'BEGIN:VEVENT',
      `UID:${holiday.id}@nextdayoff.ca`,
      `DTSTAMP:${startStr}T000000Z`,
      `DTSTART;VALUE=DATE:${startStr}`,
      `DTEND;VALUE=DATE:${endStr}`,
      `SUMMARY:${holiday.name} (Day Off)`,
      `DESCRIPTION:${holiday.description || 'Statutory Holiday in ' + province.name}`,
      `LOCATION:${province.name}, Canada`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${holiday.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="w-full relative overflow-hidden rounded-3xl bg-white dark:bg-[#18181B] border border-stone-200/90 dark:border-stone-800 shadow-card dark:shadow-card-dark p-5 sm:p-7 flex flex-col items-center text-center transition-all">
      {/* Background subtle ambient warmth */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 dark:bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-stone-500/5 dark:bg-stone-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top minimal status pills */}
      <div className="w-full flex items-center justify-between gap-2 mb-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
              isMandatoryStat
                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300/40 dark:border-amber-700/40'
                : 'bg-stone-200/80 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
            }`}
          >
            {isMandatoryStat ? 'Stat Holiday' : 'Optional / Civic'}
          </span>
          {holiday.longWeekend && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40">
              Long Weekend
            </span>
          )}
        </div>
        <span className="text-stone-400 dark:text-stone-500 text-[11px] font-medium">
          {province.code} • {province.name}
        </span>
      </div>

      {/* THE HERO: Centered Physical Calendar Frame */}
      <div className="relative my-3 flex flex-col items-center">
        {/* Calendar Hanging Binder Rings */}
        <div className="flex justify-between w-48 sm:w-56 px-6 -mb-2 z-10">
          <div className="w-4 h-6 rounded-full bg-stone-300 dark:bg-stone-700 border-2 border-stone-100 dark:border-stone-900 shadow-sm" />
          <div className="w-4 h-6 rounded-full bg-stone-300 dark:bg-stone-700 border-2 border-stone-100 dark:border-stone-900 shadow-sm" />
        </div>

        {/* Calendar Card Frame */}
        <div className="w-64 sm:w-72 rounded-2xl bg-white dark:bg-[#201E1B] border-2 border-stone-200 dark:border-stone-700/80 shadow-xl overflow-hidden flex flex-col items-center">
          {/* Calendar Top Header Bar */}
          <div className="w-full bg-amber-600 dark:bg-amber-700 text-amber-50 px-4 py-2.5 flex items-center justify-between border-b border-amber-700/50">
            <span className="text-[11px] font-extrabold uppercase tracking-widest">
              NEXT DAY OFF
            </span>
            <span className="text-[11px] font-bold opacity-90 tracking-wider">
              {holidayMonthName}
            </span>
          </div>

          {/* Calendar Center Sheet with Giant Number */}
          <div className="w-full py-6 px-4 bg-gradient-to-b from-stone-50 to-white dark:from-[#201E1B] dark:to-[#1A1816] flex flex-col items-center justify-center">
            {countdown.isToday ? (
              <div className="py-2 flex flex-col items-center">
                <span className="text-5xl select-none animate-bounce mb-1">🎉</span>
                <span className="text-5xl sm:text-6xl font-black text-amber-600 dark:text-amber-400 font-sans tracking-tight">
                  TODAY!
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mt-1">
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
                  {daysLater === 1 ? 'day later' : 'days later'}
                </span>
              </div>
            )}
          </div>

          {/* Calendar Bottom Perforated Edge Accent */}
          <div className="w-full border-t border-dashed border-stone-200 dark:border-stone-700/60 py-1.5 bg-stone-50/80 dark:bg-stone-900/40 text-[10px] text-stone-400 dark:text-stone-500 tracking-wider uppercase font-semibold">
            {weekday} • {holiday.date}
          </div>
        </div>
      </div>

      {/* Target Holiday Name & Date */}
      <div className="mt-4 mb-3 max-w-md">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100 font-sans">
          {holiday.name}
        </h1>
        <p className="text-xs sm:text-sm font-medium text-stone-500 dark:text-stone-400 mt-1">
          {formatLongDate(holiday.date)}
        </p>
      </div>

      {/* Small Prints: Refined Exact Wait & Workday Estimate */}
      <div className="flex flex-col items-center gap-1.5 my-2">
        {/* Exact Wait Time in Small Print */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400 tabular-numbers">
          <Clock className="w-3 h-3 text-stone-400 shrink-0" />
          <span>Exact wait:</span>
          <span className="font-semibold text-stone-700 dark:text-stone-300 font-mono">
            {countdown.days}d {String(countdown.hours).padStart(2, '0')}h {String(countdown.minutes).padStart(2, '0')}m {String(countdown.seconds).padStart(2, '0')}s
          </span>
        </div>

        {/* Work shifts in small print */}
        {!countdown.isToday && (
          <div className="text-[11px] text-stone-400 dark:text-stone-500 flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-stone-400" />
            <span>
              <strong className="text-stone-600 dark:text-stone-300">{workDays} working shifts</strong> remaining {weekendDays > 0 ? `(+${weekendDays} weekend days)` : ''}
            </span>
          </div>
        )}
      </div>

      {/* Minimal Action Buttons Bar */}
      <div className="w-full grid grid-cols-3 gap-2 pt-3 mt-3 border-t border-stone-100 dark:border-stone-800/80">
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-200/80 dark:hover:bg-stone-700 transition active:scale-95"
          title="Share countdown"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>

        <button
          onClick={handleDownloadICS}
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-200/80 dark:hover:bg-stone-700 transition active:scale-95"
          title="Add to calendar"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Calendar</span>
        </button>

        <button
          onClick={() => onOpenDetailModal(holiday)}
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-200/80 dark:hover:bg-stone-700 transition active:scale-95"
          title="Holiday details"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Details</span>
        </button>
      </div>
    </section>
  );
}
