import { useState } from 'react';
import { Bell, X } from 'lucide-react';

const DISMISS_KEY = 'reminder_prompt_dismissed';

/**
 * One-time opt-in strip for holiday reminders. Hidden once reminders are
 * enabled, and dismissible for the rest of the session (mirrors InstallBanner).
 */
export default function ReminderPrompt({ isVisible, holidayName, onEnable }) {
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === 'true';
    } catch {
      return false;
    }
  });

  if (!isVisible || isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, 'true');
    } catch {
      // sessionStorage unavailable — dismiss for this render only
    }
  };

  return (
    <div className="mb-3 p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 dark:border-amber-400/20 flex items-start gap-2.5">
      <Bell className="w-4 h-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-amber-950 dark:text-amber-200">
          Never miss a day off
        </p>
        <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-snug mt-0.5">
          {holidayName
            ? `Get a heads-up 48 hours before ${holidayName} and every day off after that.`
            : 'Get a heads-up 48 hours before your next statutory holiday.'}
        </p>
        <button
          onClick={onEnable}
          type="button"
          className="mt-2 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-amber-500 text-white hover:bg-amber-600 transition active:scale-95 shadow-xs"
        >
          Turn on reminders
        </button>
      </div>
      <button
        onClick={handleDismiss}
        type="button"
        className="p-1 -mt-0.5 -mr-0.5 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition"
        aria-label="Dismiss reminder prompt"
        title="Not now"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
