import React from 'react';
import { X, ExternalLink, HelpCircle, ShieldCheck, Heart } from 'lucide-react';

export default function InfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#FAF8F5] dark:bg-[#18181B] rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200/90 dark:border-stone-800 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍁</span>
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
              <span>How Stat Holidays Work in Canada</span>
            </h3>
            <p className="leading-relaxed">
              In Canada, public and statutory holidays are designated under provincial, territorial, or federal employment standards legislation.
            </p>
            <p className="leading-relaxed">
              When a holiday is statutory in your jurisdiction, eligible workers have a legal right to take the day off with regular statutory holiday pay.
            </p>
          </section>

          <section className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-2">
            <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-xs uppercase tracking-wide">
              Key Rules by Province
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400 list-disc list-inside">
              <li><strong>BC & SK:</strong> 10 standard statutory holidays.</li>
              <li><strong>Ontario:</strong> 9 standard statutory holidays (Boxing Day is stat, but Remembrance Day is not).</li>
              <li><strong>Quebec:</strong> 8 statutory holidays under the Act Respecting Labour Standards.</li>
              <li><strong>Federal:</strong> Applies to federally regulated workers (e.g., banks, airlines, rail, telecommunications, Canada Post).</li>
            </ul>
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
