# Architecture & Technical Design

## Tech Stack
- **Frontend Framework:** React (Vite bundler for fast HMR and lightweight builds).
- **Styling:** Tailwind CSS (utility-first, mobile-first responsive design).
- **Icons:** `lucide-react`.
- **PWA Capabilities:** `vite-plugin-pwa` (generates `manifest.webmanifest` and Workbox service worker).
- **State Management:** React Context + `localStorage` for user preferences (selected province).

## Directory Structure
```text
stat-holiday-pwa/
├── public/
│   ├── icons/                 # PWA icons (192x192, 512x512)
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Header.jsx         # App title, theme toggle, region badge
│   │   ├── RegionSelector.jsx # Modal/Dropdown to switch province
│   │   ├── HeroCountdown.jsx  # Main real-time countdown clock
│   │   ├── HolidayList.jsx    # Chronological list of upcoming holidays
│   │   └── InstallBanner.jsx  # PWA install prompt
│   ├── data/
│   │   ├── provinces.js       # List of Canadian provinces & territories
│   │   └── holidays.js        # Comprehensive statutory holiday data by region
│   ├── utils/
│   │   ├── dateUtils.js       # Countdown math & holiday sorting logic
│   │   └── storage.js         # localStorage helpers
│   ├── App.jsx                # Main application layout & state container
│   ├── main.jsx               # React entry point
│   └── index.css              # Tailwind directives & custom CSS
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
