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
- **State Resilience:** Ensure that changing regions instantly recalculates the chronological countdown vector without requiring a full page refresh.
