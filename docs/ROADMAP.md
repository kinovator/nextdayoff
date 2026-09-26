# Product Roadmap: NextDayOff - Stat Holiday Countdown PWA

This roadmap outlines the future evolution of the application, categorized by phase and complexity. 
Do not begin implementation on these tasks until user explicitly request implementation.

## Phase 1: Smart Notifications & Habit Loops
*Goal: Bring users back to the app without requiring them to manually open it.*

- [ ] **International Country Support:** 
  - Expand the data schema to support US federal holidays, Hong Kong holidays, and other countries. Implement in a scalable way so that adding new countries is easy and doesn't impact performance.
- [ ] **Web Push Notifications:** 
  - Implement Service Worker Push API to send local reminders 48 hours prior to an upcoming statutory holiday.
- [ ] **Multi-Country Pinning:** 
  - Enable users tracking multiple regions (e.g., remote workers with colleagues in different countries) to pin and compare upcoming holiday timelines side-by-side.

## Phase 2: Advanced Optimization & Expansion
*Goal: Broaden market and offer deeper productivity features.*

- [ ] **Custom User Holidays:** 
  - Allow users to manually add floating holidays, organization closures, or personal days off.