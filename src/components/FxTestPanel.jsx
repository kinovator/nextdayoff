import { useState } from 'react';
import { triggerCelebration } from '../utils/celebrations';

/**
 * TEMP test panel: replay every celebration tier from a UI list so the
 * effects can be previewed (and "felt") without waiting for the real
 * countdown. Rendered only while FX_TEST_PANEL is true in src/App.jsx.
 *
 * Tiers mirror getTierKey() in src/utils/dateUtils.js.
 */
const TIERS = [
  { key: 'today', label: '🎉 Finale + fireworks', hint: '0 days — today is the day off', days: 0, today: true },
  { key: 'upTo3Days', label: '🚀 Launch almost here', hint: '1–3 days out', days: 2 },
  { key: 'upTo5Days', label: '⏰ Countdown ticking', hint: '4–5 days out', days: 5 },
  { key: 'upToOneWeek', label: '📅 Mark the date', hint: '6–7 days out', days: 7 },
  { key: 'upToTwoWeeks', label: '💪 Power pops', hint: '8–14 days out', days: 11 },
  { key: 'upToOneMonth', label: '🌱 Growth sprouts', hint: '15–31 days out', days: 25 },
  { key: 'moreThanMonth', label: '⏳ Waiting drift', hint: 'more than a month', days: 45 },
];

export default function FxTestPanel() {
  const [open, setOpen] = useState(false);
  const [lastPlayed, setLastPlayed] = useState(null);

  const play = (tier) => {
    const result = triggerCelebration(tier.days, tier.today);
    setLastPlayed(result);
  };

  return (
    <div className="fixed bottom-3 left-3 z-50 print:hidden">
      {open && (
        <div className="mb-2 w-64 rounded-2xl border border-stone-300 dark:border-stone-700 bg-white/95 dark:bg-stone-900/95 backdrop-blur shadow-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-200">
              FX Test Panel
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 cursor-pointer"
              aria-label="Close FX test panel"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5 max-h-[50vh] overflow-y-auto">
            {TIERS.map((tier) => (
              <button
                key={tier.key}
                onClick={() => play(tier)}
                className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-left text-xs bg-stone-100 hover:bg-amber-100 dark:bg-stone-800 dark:hover:bg-amber-900/40 transition cursor-pointer"
                title={`Play effect for ${tier.hint}`}
              >
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  {tier.label}
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 shrink-0">
                  {tier.hint}
                </span>
              </button>
            ))}
          </div>

          <p className="text-[10px] text-stone-400 dark:text-stone-500">
            Played tier: {lastPlayed ?? '—'}
          </p>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="w-11 h-11 rounded-full flex items-center justify-center bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 text-lg shadow-lg active:scale-95 transition cursor-pointer"
        title="Toggle FX test panel"
        aria-label="Toggle FX test panel"
      >
        🧪
      </button>
    </div>
  );
}
