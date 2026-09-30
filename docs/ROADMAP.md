# Product Roadmap: NextDayOff - Stat Holiday Countdown PWA

This roadmap outlines the future evolution of the application, categorized by phase and complexity. 
Do not begin implementation on these tasks until user explicitly request implementation.

## Phase 1: Smart Notifications & Habit Loops
*Goal: Bring users back to the app without requiring them to manually open it.*

- [x] **International Country Support:** 
  - Expand the data schema to support US holidays. Implement in a scalable way so that adding new countries is easy and doesn't impact performance.
  - _Shipped:_ flat multi-country region registry (`src/data/regions.js`) covering 65 jurisdictions across Canada and the US, per-country holiday modules merged into a single `HOLIDAYS` dataset, a country switcher, country-aware region chips, and a per-country observance matrix. Adding a country is a data-only change — see `docs/DATA_SCHEMA.md`.
- [ ] **Observed vs. Actual Date Notes:** 
  - Holiday `date` values store the observed day off (weekend shifting); surface the literal calendar date in the holiday detail modal whenever the two differ.
- [ ] **Web Push Notifications:** 
  - Implement Service Worker Push API to send local reminders 48 hours prior to an upcoming statutory holiday.


## Phase 2: Advanced Optimization & Expansion
*Goal: Broaden market and offer deeper productivity features.*

- [ ] **Support for more countries and regions:** 
  - After having support for Canada and US holidays, expand to support more countries like UK, and EU.
- [ ] **Multi-Country Pinning:** 
  - Enable users tracking multiple regions (e.g., remote workers with colleagues in different countries) to pin and compare upcoming holiday timelines side-by-side.
- [ ] **Custom User Holidays:** 
  - Allow users to manually add floating holidays, organization closures, or personal days off.