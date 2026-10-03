/**
 * Time-based randomized motivational messages for NextDayOff
 * 
 * Boundaries:
 * - 0 days (today)
 * - 1-3 days
 * - 4-5 days
 * - 6-7 days (approx 1 week)
 * - 8-14 days (approx 2 weeks)
 * - 15-31 days (approx 1 month)
 * - > 31 days (> 1 month)
 *
 * Boundaries come from getTierKey() in dateUtils.js, shared with the
 * celebration FX so both systems always bucket the same way.
 *
 * Wording rules:
 * - No exact day counts — the hero card already shows the number. The
 *   message is a vibe, not a readout.
 * - Every message must be true for its WHOLE tier range: qualify any
 *   period word so it never overstates ("a week or less" for 6-7 days,
 *   "two weeks at most" for 8-14, "less than a month" for 15-31).
 */
import { getTierKey } from './dateUtils';

const MOTIVATIONAL_MESSAGES = {
  today: [
    "Today is the day! Put your feet up and relax. 🎉",
    "It's finally here! Enjoy your well-earned holiday! ✨",
    "No alarms, no rush. Soak in every minute today! 🏖️",
    "Happy holiday! Today belongs completely to you. 🥳",
  ],
  upTo3Days: [
    "Just days away! The finish line is right there! 🏃💨",
    "Final stretch! The long break is practically here. 💪",
    "Almost there! Wrap up your tasks with a smile. ✨",
    "Hold tight! Only a few more sunrises until your day off. 🌅",
    "No time at all stands between you and your day off! 🎈",
  ],
  upTo5Days: [
    "Under a week now! The countdown is seriously on. ⏳",
    "Keep your energy up — you're doing great! 🔥",
    "Just a handful of days left! Power through. 💼✨",
    "The countdown is ticking down fast. Hang in there! 🎯",
    "Only a few days stand between you and freedom! 🚀",
  ],
  upToOneWeek: [
    "A week or less to go! Keep at it! 💪",
    "One week at most — stay focused and finish strong. 🌟",
    "Days away now! Holiday bliss is nearly within reach. 🙌",
    "A week or less separates you from a well-deserved break! ☕",
    "Just days from your break! Take it one day at a time. 🌈",
  ],
  upToTwoWeeks: [
    "Two weeks at most! Stay consistent, pace yourself, and conquer the days. ⚡",
    "A fortnight or fewer — you're cruising through the schedule nicely. 🚴",
    "Keep chipping away — a fortnight or fewer remains. 📋✨",
    "Not far now — your next day off is just a short stretch away! 🌤️",
    "Stay motivated — your next recharge is closer than you think! 🔋",
  ],
  upToOneMonth: [
    "Less than a month of work left! Keep the momentum going! 🚀",
    "Under a month to go! Consistency is key! 🔑",
    "Less than a month until your break! Every productive day counts. 📈",
    "Stay focused and keep your eyes on the prize! 🏆",
    "Less than a month remaining! Steady progress wins the race. 🐢💨",
    "A few short weeks left at most! You're closer than you think. ⏳✨",
  ],
  moreThanMonth: [
    "A bit of a stretch ahead, but every day closer counts! 🌄",
    "Patience and persistence! Each completed day brings the break closer. 📆",
    "The journey has begun. Take pride in the daily grind! 💼✨",
    "Keep up the great rhythm! Good things come to those who stay consistent. ⏳",
    "Eyes on the horizon! Your future day off is already waiting for you. 🌟",
  ],
};

/**
 * Returns a randomized motivational message based on remaining days.
 * On every page load or refresh, it advances/randomizes the seed so returning users
 * get fresh messages each time.
 */
export function getMotivationalMessage(daysLater, isToday = false) {
  const categoryKey = getTierKey(daysLater, isToday);

  const messages = MOTIVATIONAL_MESSAGES[categoryKey];

  // Pick a fresh index across visits/refreshes
  let seed = 0;
  try {
    const stored = localStorage.getItem('ndo_motivational_seed');
    const prevSeed = stored !== null ? parseInt(stored, 10) : -1;
    // Step forward by 1 (or random leap) so each page load gets the next message
    seed = (prevSeed + 1 + Math.floor(Math.random() * (messages.length - 1 || 1))) % messages.length;
    localStorage.setItem('ndo_motivational_seed', String(seed));
  } catch (e) {
    seed = Math.floor(Math.random() * messages.length);
  }

  return messages[seed];
}
