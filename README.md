# NextDayOff 🌍

> Mobile-first Progressive Web App (PWA) counting down to your next statutory holiday in Canada and the US.

## Features

- **Live Countdown Ticker:** Real-time ticker counting down Days, Hours, Minutes, and Seconds to your next statutory holiday.
- **Location Aware:** One-tap GPS auto-detection with automatic fallback to system timezones (e.g. `America/Vancouver`, `America/Toronto`, `America/New_York`, `America/Chicago`, etc.).
- **Jurisdiction Coverage:** Canada — all 10 provinces, 3 territories, and the Federal jurisdiction (banks, airlines, telecom, federal public service). United States — all 50 states, DC, and federal holidays.
- **Country Switcher:** Quick country tabs plus region quick-switch chips in the region picker; the header badge always reflects the active country.
- **Working-Days Estimator:** Computes remaining Monday-to-Friday work shifts before the holiday, accounting for weekends and including today's shift until 6pm local time.
- **Upcoming Holidays Dashboard:** Filterable chronological list of holidays with year filters ordered current year, next year, then All — highlighting mandatory statutory holidays vs. optional civic holidays.
- **Observance Matrix:** Tap any holiday to see statutory rules and holiday status across every region in the selected country.
- **Weekend-Aware Dates:** Holiday `date` values hold the observed day off (Sat → preceding Fri, Sun → following Mon, collision-safe), so countdowns always target a real day off.
- **Sharing Integration:** Native Web Share integration for one-tap sharing of countdowns and holidays.
- **PWA & Offline Ready:** Configured with `vite-plugin-pwa` and Service Worker asset precaching for full offline functionality.
- **Install Prompt:** Customized install instructions for both iOS (Safari) and Android / Chromium browsers.
- **Motivational Overlay:** A message-first overlay shown on first arrival (and re-openable from the countdown page) with the motivational message and days left — auto-closes, then triggers the celebration.
- **Tiered Celebrations:** Time-remaining-based effects that escalate as the day off approaches — grand confetti on the day itself, fireworks at 1–3 days, rocket streaks at 4–5 days, and a gentle shimmer within a week — with a matching hero-card flash.
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

# Start dev server exposed on the local network (mobile testing)
npm run dev:lan
```

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — tech stack, directory structure, and key data flows
- [`docs/DATA_SCHEMA.md`](docs/DATA_SCHEMA.md) — country/region registry, holiday schema, and observance conventions
- [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) — setup guidance and UX/mobile constraints
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — planned features and future phases
