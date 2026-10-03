# Development & Agent Instruction Guide

## Environment Initialization Strategy
Instruct the coding agent to bootstrap the project using a high-performance modern web stack optimized for rapid iteration and offline PWA capabilities.

## Setup Requirements for the Agent
1. **Scaffolding:** Initialize a lightweight frontend container using Vite with React.
2. **Styling Engine:** Install and configure Tailwind CSS for utility-first, fully responsive mobile layouts.
3. **Icons & UI Utilities:** Integrate modern icon packs (such as `lucide-react`) and lightweight animation/confetti libraries for celebratory micro-interactions.
4. **PWA Integration:** Configure a dedicated PWA asset plugin to automatically generate the Web App Manifest, handle asset caching via service workers, and support offline-first execution.

## Architectural Constraints & UX Guidelines
- **Mobile-First Paradigm:** Design all interactive elements with a strict mobile viewport focus. Ensure touch targets maintain a minimum dimension of 48x48 pixels.
- **Header Budget (no horizontal scroll):** The sticky header must fit every phone viewport from 320px up without a horizontal scrollbar. On phones the country badge collapses to flag + code, the brand wordmark truncates (`min-w-0` + `truncate`) before any action button is squeezed, and the Countdown/Upcoming header toggle is hidden — the in-page segmented switcher and swipe gesture already cover it, leaving the region, theme, and info buttons reachable.
- **Location Shortcuts:** The quick region chip bar (`App.jsx`) renders from the `sm` breakpoint (640px) up, where the five chips plus the "All N+" link fit on one line. On phones, location switching goes through the header location button, which opens the same `RegionSelector` picker.
- **Safe-Area Compliance:** Implement dynamic CSS safe-area padding (`env(safe-area-inset-bottom)`) on fixed containers to prevent UI obstruction from mobile hardware gesture bars.
- **Reminder Milestones:** The heads-up schedule lives in `REMINDER_OFFSETS_DAYS` (`src/utils/notifications.js`); wording per milestone lives in `REMINDER_COPY`, with `BASE_REMINDER_COPY` covering the generic cases. Adding a milestone is an array entry plus an optional copy override — never a second decision path.
- **Background Reminders Are a Shared Contract:** The page publishes the plan (`src/utils/reminderPlan.js`, IndexedDB) and `public/notification-sw.js` replays it. The worker is plain injected script, so it mirrors the milestone maths and the database/store/record names; when changing either, change both and re-run the headless check (see below). De-duplication keys are `holidayId@offsetDays`; a bare holiday id mutes every milestone.
- **Honest Capability Reporting:** Never promise a reminder the platform cannot deliver. `InfoModal` reports the delivery path actually in effect for the device, and periodic-sync registration failures are swallowed and downgraded, never surfaced as an error.

## Verifying Reminder Changes
The repo has no test framework, so reminder changes are verified with throwaway harnesses outside the repo (this is how Step 1 of the reminder ladder in [`SMART_NOTIFICATIONS.md`](SMART_NOTIFICATIONS.md) was signed off):

1. **Build wiring:** `npm run build`, then confirm `dist/sw.js` contains `importScripts("/notification-sw.js")` and that `dist/notification-sw.js` holds the `notificationclick` and `periodicsync` listeners (`grep -c periodicsync dist/notification-sw.js`).
2. **Milestone/copy rules (Node):** bundle `src/utils/notifications.js` with esbuild (`npx esbuild <entry> --bundle --format=esm --platform=node`), stub `localStorage`, `Notification` and `navigator.serviceWorker.ready` (define them with `Object.defineProperty`, since Node 22+ exposes read-only globals), then drive `getDueMilestones()`, `buildReminder()` and `checkAndSendReminder()` against fixed dates. Cover: both milestones due at 40h out, only the week one at 6 days out, the 48h send marking both keys, no stale week-ahead ping afterwards, and a bare holiday id muting the holiday.
3. **Worker end to end (headless Chrome):** `npx vite preview`, launch Chrome with `--headless=new --remote-debugging-port`, grant `['notifications']` via `Browser.grantPermissions`, let the app publish a real plan, then **rewrite only `plan.holidays` to synthetic dates** (keeping the real `copyByOffset`) by evaluating IndexedDB code in the service-worker target. Trigger the handler with a synthetic event, since periodic sync has no manual trigger:
   ```js
   const ev = new Event('periodicsync');
   Object.defineProperty(ev, 'tag', { value: 'nextdayoff-reminders' });
   let p; ev.waitUntil = (x) => { p = x; };
   self.dispatchEvent(ev); return p; // evaluate with awaitPromise
   ```
   Then assert `self.registration.getNotifications()` (title, body, tag) and the `notified` keys written back to the plan. Close the app tab first: the visible-window guard deliberately suppresses delivery while a tab is on screen.
4. **Copy drift:** bundle the same module for Node and compare `buildReminder(...)` output for the active moment against the notification body the worker produced — they must match exactly.
5. **On a real device:** install the PWA on Android Chrome, enable reminders, and use DevTools → Application → Service Workers → *Periodic Sync* to trigger `nextdayoff-reminders` manually (`nextdayoff-reminders` also appears in `chrome://serviceworker-internals`).
- **State Resilience:** Ensure that changing regions instantly recalculates the chronological countdown vector without requiring a full page refresh.
