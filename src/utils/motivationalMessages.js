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
 */

const MOTIVATIONAL_MESSAGES = {
  today: [
    "Today is the day! Put your feet up and relax. 🎉",
    "It's finally here! Enjoy your well-earned holiday! ✨",
    "No alarms, no rush. Soak in every minute today! 🏖️",
    "Happy holiday! Today belongs completely to you. 🥳",
  ],
  upTo3Days: [
    "Just a couple more days to push through! The finish line is right there! 🏃💨",
    "Final stretch! The long break is practically here. 💪",
    "Almost there! Wrap up your tasks with a smile. ✨",
    "Hold tight! Only a few more sunrises until your day off. 🌅",
    "3 days or less! Time to start making holiday plans! 🎈",
  ],
  upTo5Days: [
    "5 days or less! The countdown is seriously on. ⏳",
    "Under a week now! Keep your energy up, you're doing great! 🔥",
    "Just a handful of days left! Power through the week. 💼✨",
    "The countdown is ticking down fast. Hang in there! 🎯",
    "A few more working days and freedom awaits! 🚀",
  ],
  upToOneWeek: [
    "A week more to go! Keep at it! 💪",
    "One week countdown! Stay focused and finish strong. 🌟",
    "Seven days until holiday bliss! You've got this. 🙌",
    "Only a week separates you from a well-deserved break! ☕",
    "One week to go! Take it one day at a time. 🌈",
  ],
  upToTwoWeeks: [
    "Two weeks to go! Stay consistent, pace yourself, and conquer the days. ⚡",
    "Two weeks out! You're cruising through the schedule nicely. 🚴",
    "Just a fortnight away! Keep chipping away at that to-do list. 📋✨",
    "Half a month left! Consistency is the name of the game. 🎯",
    "Two weeks until your next recharge! Stay motivated! 🔋",
  ],
  upToOneMonth: [
    "Less than a month of work left! Keep the momentum going! 🚀",
    "Under a month to go! Consistency is key! 🔑",
    "Less than a month until your break! Every productive day counts. 📈",
    "Under 30 days away! Stay focused and keep your eyes on the prize! 🏆",
    "Less than a month remaining! Steady progress wins the race. 🐢💨",
    "A few short weeks left! You're closer than you think. ⏳✨",
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
  let categoryKey;

  if (isToday || daysLater <= 0) {
    categoryKey = 'today';
  } else if (daysLater <= 3) {
    categoryKey = 'upTo3Days';
  } else if (daysLater <= 5) {
    categoryKey = 'upTo5Days';
  } else if (daysLater <= 7) {
    categoryKey = 'upToOneWeek';
  } else if (daysLater <= 14) {
    categoryKey = 'upToTwoWeeks';
  } else if (daysLater <= 31) {
    categoryKey = 'upToOneMonth';
  } else {
    categoryKey = 'moreThanMonth';
  }

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
