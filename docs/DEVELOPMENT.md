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
- **Safe-Area Compliance:** Implement dynamic CSS safe-area padding (`env(safe-area-inset-bottom)`) on fixed containers to prevent UI obstruction from mobile hardware gesture bars.
- **State Resilience:** Ensure that changing regions instantly recalculates the chronological countdown vector without requiring a full page refresh.
