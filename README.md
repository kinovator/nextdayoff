# NextDayOff 🍁

> Mobile-first Progressive Web App (PWA) counting down to your next statutory holiday in Canada.

## Features

- **Live Countdown Ticker:** Real-time ticker counting down Days, Hours, Minutes, and Seconds to your next statutory holiday.
- **Location Aware:** One-tap GPS auto-detection with automatic fallback to Canadian system timezones (e.g. `America/Vancouver`, `America/Toronto`, `America/Edmonton`, etc.).
- **Jurisdiction Coverage:** Covers all 10 provinces, 3 territories, and the Federal jurisdiction (banks, airlines, telecom, federal public service).
- **Working-Days Estimator:** Computes remaining Monday-to-Friday work shifts before the holiday, accounting for weekends.
- **Upcoming Holidays Dashboard:** Filterable chronological list of holidays by year, highlighting mandatory statutory holidays vs. optional civic holidays.
- **National Observance Matrix:** Tap any holiday to see statutory rules and holiday status across all 13 provinces and territories.
- **Calendar & Sharing Integration:** One-click download for `.ics` calendar events and native Web Share integration.
- **PWA & Offline Ready:** Configured with `vite-plugin-pwa` and Service Worker asset precaching for full offline functionality.
- **Install Prompt:** Customized install instructions for both iOS (Safari) and Android / Chromium browsers.
- **Celebration Mode:** Fires celebratory confetti when today is an official statutory day off!
- **Aesthetics & Theme:** Clean, neutral palette with warm stone accents and dark/light mode toggle. Compliant with mobile hardware safe areas (`env(safe-area-inset-*)`).

## Tech Stack

- **Framework:** React 19 + Vite 8
- **Styling:** Tailwind CSS with Plus Jakarta Sans & JetBrains Mono typography
- **PWA:** `vite-plugin-pwa` + Workbox
- **Icons:** `lucide-react`
- **Celebration:** `canvas-confetti`

## Getting Started

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle with PWA service worker
npm run build

# Preview production build locally
npm run preview
```
