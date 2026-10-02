import { X, Check } from 'lucide-react';
import { THEMES, FONTS } from '../themes';

/**
 * Colour + font picker (bottom sheet on mobile, centered on desktop — same
 * pattern as RegionSelector). The two choices are independent: packaged
 * themes pick the colour package, the font row picks the display face, so
 * e.g. Blossom pinks can pair with Fredoka. Selections apply immediately and
 * the sheet stays open to mix and match; dismiss via ✕ or the backdrop.
 */
export default function ThemePickerModal({
  isOpen,
  onClose,
  selectedId,
  onSelect,
  selectedFontId,
  onSelectFont,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-sheet rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200/90 dark:border-stone-700 flex flex-col max-h-[90vh] overflow-hidden animate-sheet-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span>Pick Your Vibe</span>
              <span>🎨</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Colours + font — mix and match
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-700 transition"
            aria-label="Close theme picker"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto">
          {/* Colours — packaged themes */}
          <div className="p-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
              Colours
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {THEMES.map((theme) => {
            const isActive = theme.id === selectedId;
            return (
              <button
                key={theme.id}
                onClick={() => onSelect(theme.id)}
                className={`relative flex items-center gap-3 p-3 rounded-2xl border text-left transition active:scale-[0.98] cursor-pointer ${
                  isActive
                    ? 'border-transparent shadow-md ring-2 ring-offset-2 ring-offset-[var(--page)] bg-accent-soft'
                    : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200/80 dark:border-stone-700/60 hover:border-amber-500/40'
                }`}
                style={isActive ? { '--tw-ring-color': theme.swatch } : undefined}
                aria-pressed={isActive}
              >
                {/* Swatch */}
                <span
                  className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm border border-black/5"
                  style={{ backgroundColor: theme.swatch }}
                >
                  <span className="select-none">{theme.emoji}</span>
                </span>

                {/* Name + tagline */}
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                      {theme.name}
                    </span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                      {theme.tagline}
                    </span>
                  </span>
                </span>

                {isActive && (
                  <span
                    className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: theme.swatch, color: theme.swatchInk }}
                  >
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
            </div>
          </div>

          {/* Font — independent of the colour theme */}
          <div className="p-4 border-t border-stone-200 dark:border-stone-700">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
              Font
            </h3>
            <div className="flex flex-wrap gap-2">
              {FONTS.map((font) => {
                const isActive = font.id === selectedFontId;
                return (
                  <button
                    key={font.id}
                    onClick={() => onSelectFont(font.id)}
                    aria-pressed={isActive}
                    // Sample rendered in the font itself
                    style={{ fontFamily: font.stack }}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border transition active:scale-95 cursor-pointer ${
                      isActive
                        ? 'bg-stone-800 text-stone-50 border-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-100'
                        : 'bg-stone-100 text-stone-600 border-transparent hover:bg-stone-200 dark:bg-stone-800/60 dark:text-stone-300 dark:hover:bg-stone-700'
                    }`}
                  >
                    {font.name}
                    {isActive && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}