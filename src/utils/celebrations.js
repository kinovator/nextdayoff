import confetti from 'canvas-confetti';

/**
 * Tiered celebration effects for NextDayOff.
 *
 * Tier boundaries intentionally mirror the motivational-message categories
 * (see src/utils/motivationalMessages.js) so the quote and the celebration
 * always belong to the same "distance" mood. Energy escalates as the day off
 * gets closer:
 *
 *   today        -> Grand finale: confetti + firework rockets launching
 *                   from the bottom and bursting — the ONE genuinely
 *                   celebratory effect (day off is here!)
 *   upTo3Days    -> 🚀 emoji pops, "launch imminent" (motivational)
 *   upTo5Days    -> ⏰ emoji pops, countdown ticking (motivational)
 *   upToOneWeek  -> 📅 emoji pops, mark the date (motivational)
 *   upToTwoWeeks -> 💪 emoji pops bursting in/out all over the screen
 *   upToOneMonth -> 🌱 emoji pops bursting in/out all over the screen
 *   moreThanMonth-> ⏳ emoji pops bursting in/out all over the screen
 *   (far-out tiers are motivational, not celebratory — many emojis
 *    popping in and out, tuned calmer as the day off gets farther)
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
  soft: ['#F59E0B', '#FBBF24', '#DCD1C0', '#C4B59F', '#A8A29E'], // unused, kept for tweaks
  muted: ['#F59E0B', '#DCD1C0', '#A8A29E'],
};

/**
 * One firework: a dot streaks up from the bottom edge, then explodes
 * into a radial burst near the peak. Random x each time.
 */
function launchFirework(delay = 0, palette = COLORS.amber) {
  const x = 0.1 + Math.random() * 0.8;
  const peakY = 0.3 + Math.random() * 0.15; // where the streak runs out of momentum

  setTimeout(() => {
    // The rocket: a tight vertical streak of small dots
    confetti({
      particleCount: 5,
      angle: 90 + (Math.random() * 10 - 5),
      spread: 6,
      startVelocity: 40,
      gravity: 0.5,
      decay: 0.95,
      ticks: 130,
      scalar: 0.6,
      shapes: ['circle'],
      origin: { x, y: 1 },
      colors: palette,
    });

    // The burst: radial "fading lines" — thin rays of small dots streaking
    // outward from the peak and fading (no stars; reads as a firework, and
    // clearly different from the square confetti pieces)
    setTimeout(() => {
      const RAYS = 10;
      for (let a = 0; a < 360; a += 360 / RAYS) {
        confetti({
          particleCount: 10, // a line of dots along the ray
          angle: a,
          spread: 3, // near-zero spread keeps the ray thin
          startVelocity: 18,
          gravity: 0.7,
          decay: 0.94,
          ticks: 150,
          scalar: 0.5,
          shapes: ['circle'],
          origin: { x, y: peakY },
          colors: palette,
        });
      }
    }, 330);
  }, delay);
}

/**
 * 0 days left (today is the day off): the grand finale.
 * Confetti: center burst + twin side cannons. Fireworks: four rockets
 * launching from the bottom and bursting across the sky — party AND pyro.
 */
function celebrateToday() {
  // --- Confetti layer ---
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

  // --- Firework layer: dot shoots up from the bottom, explodes ---
  launchFirework(0, COLORS.amber);
  launchFirework(450, COLORS.festive);
  launchFirework(900, COLORS.emerald);
  launchFirework(1350, COLORS.amber);
}

/**
 * 6-7 days left: MOTIVATIONAL — 📅 emoji pops: "mark the date, it's
 * coming." Calmest of the close tiers (slow tempo, few particles).
 */
function celebrateMarkingDate() {
  emojiPop('📅', {
    bursts: 10,
    perBurst: 3,
    stagger: 130,
    startVelocity: 10,
    gravity: 0.6,
    ticks: 130,
  });
}

/**
 * 4-5 days left: MOTIVATIONAL — ⏰ emoji pops: the countdown is ticking,
 * "almost time." Medium tempo.
 */
function celebrateCountingDown() {
  emojiPop('⏰', {
    bursts: 14,
    perBurst: 5, // bigger volley as the day off gets closer
    stagger: 90,
    startVelocity: 28, // shoot deep into the screen from the corners
    decay: 0.94, // sustains momentum so they travel far before fading
    gravity: 0.6,
    ticks: 170, // lives long enough to complete the flight
    scalar: 1.6, // noticeably bigger hourglass
    from: 'corners', // diagonal pops from the bottom corners, alternating
    spread: 60, // wider fans — bigger-feeling bursts
    angleJitter: 15,
  });
}

/**
 * 1-3 days left: MOTIVATIONAL — 🚀 emoji pops: "so close, launch is
 * imminent." Fastest, punchiest of the close tiers (final day included).
 */
function celebrateAlmostThere() {
  emojiPop('🚀', {
    bursts: 14,
    perBurst: 4,
    stagger: 80,
    startVelocity: 32, // fast enough to fly all the way across the screen
    decay: 0.95, // little slowdown — sustains the flight instead of sputtering
    gravity: 0.7, // gentle arc while crossing
    ticks: 190, // lives long enough to complete the fly-through
    scalar: 2, // big rockets
    from: 'bottom', // real launches from random spots along the bottom
    angle: 90, // ...shot upward, in random directions
    angleJitter: 40, // ...with a wide +/-40° wobble each burst
    spread: 12, // tight fan — each burst reads as one aimed rocket
  });
}

/**
 * Fallback (unmapped tier): a tiny, understated sparkle.
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

// Emoji particle shapes — built once and cached. Base confetti pieces are
// ~10px, and shapeFromText renders text at 10px * scalar, so scalar 2.2
// yields ~22px glyphs (before the particle's own scalar multiplier).
const emojiShapeCache = {};
function emojiShape(text) {
  if (!emojiShapeCache[text]) {
    emojiShapeCache[text] = confetti.shapeFromText({ text, scalar: 2.2 });
  }
  return emojiShapeCache[text];
}

/**
 * Shared "pop in and out" runner: a volley of emoji particles appears in
 * quick staggered bursts, then vanishes. Short ticks + short overall
 * duration keep them snappy — prominent and busy, never a slow
 * drifting-shower feel.
 *
 * `from` varies the placement/style so no two tiers look alike:
 *   'anywhere' -> random spot across the whole screen, radial burst
 *   'bottom'   -> random x along the bottom edge, launched upward
 *                 (angle/angleJitter aim the launch; 90 = straight up)
 *   'top'      -> random x along the top edge, drifting downward (270 = down)
 *   'sides'    -> alternating left/right edges, jabbed inward
 *   'corners'  -> alternating bottom corners, diagonal pops upward-inward
 */
function emojiPop(emoji, opts = {}) {
  const {
    bursts = 12,
    perBurst = 4,
    stagger = 90,
    startVelocity = 14,
    gravity = 0.8,
    ticks = 100,
    spread = 360,
    scalar = 1.2,
    from = 'anywhere',
    angle,
    angleJitter = 0,
    decay, // optional velocity retention (lower = slows fast; closer to 1 = flies farther)
  } = opts;
  const shape = emojiShape(emoji);

  for (let i = 0; i < bursts; i++) {
    setTimeout(() => {
      const origin = {};
      let baseAngle = angle;

      if (from === 'bottom') {
        origin.x = 0.05 + Math.random() * 0.9;
        origin.y = 1;
        if (baseAngle === undefined) baseAngle = 90;
      } else if (from === 'top') {
        origin.x = 0.05 + Math.random() * 0.9;
        origin.y = 0;
        if (baseAngle === undefined) baseAngle = 270;
      } else if (from === 'sides') {
        const fromLeft = i % 2 === 0;
        origin.x = fromLeft ? 0 : 1;
        origin.y = 0.3 + Math.random() * 0.4;
        baseAngle = fromLeft ? 30 : 150; // inward diagonals (0 = right, 180 = left)
      } else if (from === 'corners') {
        const fromLeft = i % 2 === 0;
        origin.x = fromLeft ? 0 : 1;
        origin.y = 1;
        baseAngle = fromLeft ? 60 : 120; // diagonal inward-up from bottom corners
      } else {
        origin.x = 0.08 + Math.random() * 0.84;
        origin.y = 0.15 + Math.random() * 0.7;
      }

      const finalAngle =
        angleJitter > 0
          ? baseAngle + (Math.random() * 2 - 1) * angleJitter
          : baseAngle;

      confetti({
        particleCount: perBurst,
        spread,
        startVelocity,
        gravity,
        ticks,
        scalar,
        flat: true, // no spin/flip — keeps the emoji upright and readable
        ...(finalAngle !== undefined && { angle: finalAngle }),
        ...(decay !== undefined && { decay }),
        origin,
        shapes: [shape],
      });
    }, i * stagger);
  }
}

/**
 * 8-14 days left: MOTIVATIONAL — 💪 popping in and out all over the screen.
 * Fastest, punchiest volley of the three far-out tiers: strength is
 * building as the day off approaches.
 */
function celebratePower() {
  emojiPop('💪', {
    bursts: 14,
    perBurst: 4,
    stagger: 80,
    startVelocity: 16,
    gravity: 1,
    ticks: 90,
    scalar: 1.3,
    from: 'sides', // alternating left/right edge jabs aimed inward
    spread: 25,
    angleJitter: 10,
  });
}

/**
 * 15-31 days left: MOTIVATIONAL — 🌱 popping in and out across the screen.
 * Medium tempo: steady "keep growing" beat, calmer than the 💪 volley.
 */
function celebrateGrowth() {
  emojiPop('🌱', {
    bursts: 12,
    perBurst: 3,
    stagger: 110,
    startVelocity: 12,
    gravity: 0.5, // gentler float-up than the 🚀 launches
    ticks: 120,
    from: 'bottom', // sprouting upward from random spots along the bottom
    angle: 90,
    angleJitter: 8, // nearly straight up — calm, small sway
    spread: 30,
  });
}

/**
 * More than a month out: calmest tier — ⏳ popping gently in and out.
 * Slowest tempo and fewest particles: still clearly visible on screen,
 * but relaxed — "time is passing, the day off is coming."
 */
function celebrateWaiting() {
  emojiPop('⏳', {
    bursts: 10,
    perBurst: 3,
    stagger: 130,
    startVelocity: 9,
    gravity: 0.6,
    ticks: 140,
    from: 'top', // trickling down from random spots along the top edge
    angle: 270,
    spread: 30,
  });
}

// Tier key -> effect. Keys match the motivational-message categories so both
// systems stay in sync; add/rename tiers here to tweak the schedule.
const CELEBRATION_EFFECTS = {
  today: celebrateToday,
  upTo3Days: celebrateAlmostThere,
  upTo5Days: celebrateCountingDown,
  upToOneWeek: celebrateMarkingDate,
  upToTwoWeeks: celebratePower,
  upToOneMonth: celebrateGrowth,
  moreThanMonth: celebrateWaiting,
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
