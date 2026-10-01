import { Calendar, Clock, LayoutGrid } from 'lucide-react';

/**
 * Single source of truth for the three top-level views. Everything that
 * renders or navigates tabs — segmented switcher, pagination dots, swipe
 * order, header cycle button — derives from this list, so adding/reordering
 * a tab is a one-line change here.
 */
export const TAB_META = [
  {
    key: 'countdown',
    label: '⏱ Countdown',
    icon: Clock,
    cycleLabel: 'Switch back to Countdown',
  },
  {
    key: 'upcoming',
    label: '📅 Upcoming',
    icon: Calendar,
    cycleLabel: 'Switch to Upcoming Holidays',
  },
  {
    key: 'calendar',
    label: '🗓 Calendar',
    icon: LayoutGrid,
    cycleLabel: 'Switch to Calendar view',
  },
];

/** Swipe/dots order — derived, never restate it elsewhere. */
export const TAB_ORDER = TAB_META.map((tab) => tab.key);

/** The tab a cycle action moves to: countdown → upcoming → calendar → … */
export function getNextTab(activeKey) {
  const idx = TAB_META.findIndex((tab) => tab.key === activeKey);
  return TAB_META[(idx + 1) % TAB_META.length];
}