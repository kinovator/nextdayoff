# Architecture & Technical Design

## Tech Stack
- **Frontend Framework:** React 19 (Vite bundler for fast HMR and lightweight builds).
- **Styling:** Tailwind CSS (utility-first, mobile-first responsive design).
- **Icons:** `lucide-react`.
- **Celebrations:** `canvas-confetti` (tiered, time-remaining-based effects).
- **PWA Capabilities:** `vite-plugin-pwa` (generates `manifest.webmanifest` and Workbox service worker).
- **State Management:** Local component state + `localStorage` for user preferences (selected region and theme).
- **Data Layer:** A flat multi-country region registry (`src/data/regions.js`) plus per-country holiday modules merged into a single dataset, so adding a country requires no UI changes.

## Directory Structure
```text
nextdayoff/
├── public/
│   ├── icons/                     # PWA icons (192x192, 512x512, SVG)
│   ├── notification-sw.js         # notificationclick handler imported by the SW
│   ├── apple-touch-icon.png
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Header.jsx             # App title, theme toggle, region + country badge
│   │   ├── RegionSelector.jsx     # Country tabs + region picker with GPS detection
│   │   ├── HeroCountdown.jsx      # Main real-time countdown clock + action bar
│   │   ├── HolidayList.jsx        # Chronological list with year filters
│   │   ├── HolidayDetailModal.jsx # Holiday details & statutory observance matrix
│   │   ├── MotivationOverlay.jsx  # First-arrival motivational message overlay
│   │   ├── ReminderPrompt.jsx     # Opt-in strip for holiday reminders
│   │   ├── InfoModal.jsx          # Rules reference + reminder toggle
│   │   └── InstallBanner.jsx      # PWA install prompt
│   ├── data/
│   │   ├── regions.js             # Countries + all regions (codes, geo, timezones)
│   │   ├── holidays.js            # Canadian statutory holiday data
│   │   └── holidaysUS.js          # US federal holiday data (merged into HOLIDAYS)
│   ├── utils/
│   │   ├── dateUtils.js           # Countdown math, working-day counting, filtering
│   │   ├── geoUtils.js            # GPS proximity + timezone-based region detection
│   │   ├── celebrations.js        # Tiered effect presets and dispatcher
│   │   ├── notifications.js       # Reminder window, dedupe, notification delivery
│   │   ├── motivationalMessages.js # Message pools keyed by time-remaining tier
│   │   └── storage.js             # localStorage helpers
│   ├── App.jsx                    # Main application layout & state container
│   ├── main.jsx                   # React entry point + service worker registration
│   └── index.css                  # Tailwind directives & custom CSS
├── docs/                          # Architecture, data schema, roadmap, dev guide
├── scripts/
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## Key Architectural Flows
- **Region Resolution:** stored preference → GPS proximity (`detectRegionFromGeolocation`) → IANA timezone match (`detectRegionFromTimezone`) → `DEFAULT_REGION_CODE`.
- **Countdown Pipeline:** `getNextHoliday(regionCode)` selects the soonest applicable holiday, `calculateCountdown` derives the day/hour/minute/second vector, and `countWorkingDays` derives remaining Monday–Friday shifts (today's shift counts until 6pm local).
- **Celebration Pipeline:** `getCelebrationTier(daysLeft)` maps time remaining to an effect preset in `celebrations.js`; the hero dispatches it after the motivational overlay closes.
- **Reminder Pipeline:** `checkAndSendReminder()` in `notifications.js` gates on opt-in → permission → 48-hour window → per-holiday dedupe, then delivers via `ServiceWorkerRegistration.showNotification`. `App.jsx` runs it on load, every 15 minutes while open, and on foreground resume; `public/notification-sw.js` (injected through `workbox.importScripts`) focuses or opens the app when a reminder is tapped.
