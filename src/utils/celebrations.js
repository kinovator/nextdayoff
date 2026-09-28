import confetti from 'canvas-confetti';

/**
 * Tiered celebration effects for NextDayOff.
 *
 * Tier boundaries intentionally mirror the motivational-message categories
 * (see src/utils/motivationalMessages.js) so the quote and the celebration
 * always belong to the same "distance" mood. Energy escalates as the day off
 * gets closer:
 *
 *   today        -> Grand confetti finale (multi-shot bursts)
 *   upTo3Days    -> Staggered firework pops (extra bursts on the final day)
 *   upTo5Days    -> Twin rocket streaks launching from the bottom corners
 *   upToOneWeek  -> Gentle shimmer rain drifting from the top
 *   beyond       -> Tiny understated sparkle (fallback tier)
 *
 * NOTE: All presets below are temporary and intentionally easy to tweak —
 * particle counts, colors, timing, origins, gravity, etc. can be adjusted
 * freely without touching the UI layer. Timers are fire-and-forget.
 */

// Shared color palettes (warm stone/amber brand family)
const COLORS = {
  festive: ['#D97706', '#FAF8F5', '#F59E0B', '#10B981', '#EC4899'],
  amber: ['#F59E0B', '#FBBF24', '#D97706'],
  emerald: ['#10B981', '#34D399', '#059669'],
  soft: ['#F59E0B', '#FBBF24', '#DCD1C0', '#C4B59F', '#A8A29E'],
  muted: ['#F59E0B', '#DCD1C0', '#A8A29E'],
};

/**
 * 0 days left (today is the day off): the grand finale.
 * Center burst followed by twin side cannons.
 */
function celebrateToday() {
  confetti({
    particleCount: 100,
    spread: 80,
    origin: { y: 0.6 },
    colors: COLORS.festive,
  });
  setTimeout(() => {
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: COLORS.amber,
    });
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: COLORS.emerald,
    });
  }, 250);
}

/**
 * 1-3 days left: staggered firework pops across the top of the hero card.
 * The final day before the holiday (1 day left) gets extra bursts at a
 * faster cadence — more change as the day gets closer.
 */
function celebrateFireworks(daysLater) {
  const isFinalRun = daysLater <= 1;
  const bursts = isFinalRun
    ? [
        { x: 0.22, y: 0.3 },
        { x: 0.78, y: 0.24 },
        { x: 0.5, y: 0.36 },
        { x: 0.35, y: 0.2 },
        { x: 0.65, y: 0.42 },
      ]
    : [
        { x: 0.25, y: 0.3 },
        { x: 0.75, y: 0.24 },
        { x: 0.5, y: 0.35 },
      ];

  bursts.forEach((origin, i) => {
    setTimeout(() => {
      confetti({
        particleCount: 45,
        spread: 360,
        startVelocity: 14,
        gravity: 1,
        scalar: 0.9,
        ticks: 180,
        shapes: ['circle', 'star'],
        origin,
        colors: i % 2 === 0 ? COLORS.amber : COLORS.festive,
      });
    }, i * (isFinalRun ? 180 : 260));
  });
}

/**
 * 4-5 days left: twin rocket streaks shooting up from the bottom corners,
 * plus a final center launch — energy building toward the day off.
 */
function celebrateRockets() {
  const launch = (angle, origin, colors) =>
    confetti({
      angle,
      particleCount: 45,
      spread: 22,
      startVelocity: 28,
      gravity: 1.1,
      ticks: 220,
      scalar: 0.9,
      origin,
      colors,
    });

  launch(60, { x: 0, y: 0.85 }, COLORS.amber);
  setTimeout(() => launch(120, { x: 1, y: 0.85 }, COLORS.emerald), 220);
  setTimeout(() => launch(75, { x: 0.5, y: 0.9 }, COLORS.festive), 440);
}

/**
 * 6-7 days left: calm shimmer rain slowly drifting down from the top.
 * Deliberately understated — the week is still mostly ahead of you.
 */
function celebrateShimmer() {
  confetti({
    particleCount: 50,
    spread: 120,
    startVelocity: 4,
    gravity: 0.4,
    ticks: 320,
    scalar: 0.75,
    origin: { x: 0.5, y: 0.08 },
    colors: COLORS.soft,
  });
}

/**
 * Fallback (more than a week out): a tiny, understated sparkle.
 */
function celebrateSparkle() {
  confetti({
    particleCount: 25,
    spread: 60,
    startVelocity: 8,
    gravity: 0.8,
    ticks: 200,
    scalar: 0.7,
    origin: { y: 0.45 },
    colors: COLORS.muted,
  });
}

// Tier key -> effect. Keys match the motivational-message categories so both
// systems stay in sync; add/rename tiers here to tweak the schedule.
const CELEBRATION_EFFECTS = {
  today: celebrateToday,
  upTo3Days: celebrateFireworks,
  upTo5Days: celebrateRockets,
  upToOneWeek: celebrateShimmer,
  upToTwoWeeks: celebrateSparkle,
  upToOneMonth: celebrateSparkle,
  moreThanMonth: celebrateSparkle,
};

/**
 * Maps the remaining days until the day off to a celebration tier key,
 * using the same boundaries as getMotivationalMessage().
 */
export function getCelebrationTier(daysLater, isToday = false) {
  if (isToday || daysLater <= 0) return 'today';
  if (daysLater <= 3) return 'upTo3Days';
  if (daysLater <= 5) return 'upTo5Days';
  if (daysLater <= 7) return 'upToOneWeek';
  if (daysLater <= 14) return 'upToTwoWeeks';
  if (daysLater <= 31) return 'upToOneMonth';
  return 'moreThanMonth';
}

/**
 * Fires the celebration effect matching the current time remaining.
 * Returns the tier key that was played (or null if it failed/was skipped),
 * so the UI can react if needed. Never throws.
 */
export function triggerCelebration(daysLater, isToday = false) {
  try {
    const tier = getCelebrationTier(daysLater, isToday);
    const effect = CELEBRATION_EFFECTS[tier] || celebrateSparkle;
    effect(daysLater);
    return tier;
  } catch (e) {
    // Celebrations must never break the UI
    return null;
  }
}
