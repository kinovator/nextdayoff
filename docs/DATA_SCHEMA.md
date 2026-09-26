# Data Schema Specification: Canada Stat Holiday PWA

## Overview
This document outlines the data structures required for tracking, filtering, and displaying Canadian statutory holidays across all provincial and territorial jurisdictions.

## 1. Province Metadata Structure
The application must maintain a standard lookup list for Canadian provinces and territories to support region-switching functionality.
- **Entity Attributes:**
  - `code`: Standard two-letter postal abbreviation (e.g., AB, BC, ON, QC).
  - `name`: Full official English name of the province or territory.
  - `type`: Classification distinguishing provinces from federal jurisdictions or territories if necessary.

## 2. Statutory Holiday Object Schema
Every holiday entry processed by the countdown engine must comply with a strict schema to ensure clean filtering by region and date.
- **Schema Fields:**
  - `id`: Unique string slug combining region, holiday name, and year (e.g., bc-family-day-2026).
  - `name`: Official legal name of the statutory holiday.
  - `date`: Standard ISO-8601 date string formatted strictly as `YYYY-MM-DD`.
  - `regions`: Array of applicable two-letter province/territory strings where the holiday is legally mandated as a statutory day off.
  - `type`: Enumerated string value (`stat` for mandatory statutory holidays, `optional` for civic or non-statutory holidays).
  - `description`: Optional brief explanatory text detailing observance rules or historical context.

## 3. Storage Schema (`localStorage`)
The application state persistence layer relies on lightweight client-side storage keys:
- `stat_app_region`: Stores the user's selected province code string as a persistent fallback default.
- `stat_app_theme`: Stores user UI theme preference (`dark` or `light`).
