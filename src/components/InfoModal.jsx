import { X, ShieldCheck, Bell } from 'lucide-react';

export default function InfoModal({
  isOpen,
  onClose,
  remindersEnabled = false,
  notificationPermission = 'default',
  onToggleReminders = () => {},
}) {
  if (!isOpen) return null;

  const isSupported = notificationPermission !== 'unsupported';
  const isBlocked = notificationPermission === 'denied';
  const canToggle = isSupported && !isBlocked;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#FAF8F5] dark:bg-[#18181B] rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200/90 dark:border-stone-800 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌍</span>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              About Statutory Holidays
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
          <section className="space-y-2">
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>How Stat Holidays Work</span>
            </h3>
            <p className="leading-relaxed">
              Public and statutory holidays are designated by federal, state, provincial, or territorial employment standards legislation, depending on the jurisdiction.
            </p>
            <p className="leading-relaxed">
              When a holiday is statutory in your jurisdiction, eligible workers have a legal right to take the day off with regular statutory holiday pay.
            </p>
          </section>

          <section className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-2">
            <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-xs uppercase tracking-wide">
              Good to Know
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400 list-disc list-inside">
              <li><strong>Jurisdiction matters:</strong> Statutory holiday lists differ by country, state, province, and territory.</li>
              <li><strong>Optional holidays:</strong> Some employers offer civic holidays (e.g. Easter Monday) that aren't mandatory stat days.</li>
              <li><strong>Federal jurisdictions:</strong> Federal employees (banks, airlines, telecom, public service) often follow their own holiday schedule.</li>
            </ul>
          </section>

          {/* Holiday reminders */}
          <section className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 dark:border-amber-400/20">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="font-bold text-amber-900 dark:text-amber-200 text-xs flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5" />
                  <span>Holiday Reminders</span>
                </h4>
                <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-normal mt-1">
                  A notification 48 hours before your next statutory day off. Reminders are checked while the app is open or installed.
                </p>
                {isBlocked && (
                  <p className="text-[11px] text-red-600 dark:text-red-400 leading-normal mt-1">
                    Notifications are blocked for this site. Allow them in your browser settings to switch reminders on.
                  </p>
                )}
                {!isSupported && (
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-normal mt-1">
                    This browser doesn&apos;t support notifications.
                  </p>
                )}
              </div>

              <button
                onClick={onToggleReminders}
                type="button"
                role="switch"
                aria-checked={remindersEnabled}
                aria-label="Toggle holiday reminders"
                title={remindersEnabled ? 'Turn off holiday reminders' : 'Turn on holiday reminders'}
                disabled={!canToggle}
                className={`shrink-0 mt-0.5 w-11 h-6 rounded-full p-0.5 transition ${
                  remindersEnabled ? 'bg-amber-500' : 'bg-stone-300 dark:bg-stone-700'
                } ${canToggle ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    remindersEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
              Offline PWA Capabilities
            </h3>
            <p className="leading-relaxed text-xs text-stone-600 dark:text-stone-400">
              NextDayOff is a progressive web app. All holiday datasets and calculations run completely offline on your device once loaded. You can install it on your home screen for quick, instant access.
            </p>
          </section>
        </div>

        <div className="p-4 bg-stone-100/90 dark:bg-stone-900/90 border-t border-stone-200 dark:border-stone-800 safe-pb flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
