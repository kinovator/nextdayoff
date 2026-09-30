# Data Schema Specification: Multi-Country Stat Holiday PWA

## Overview
This document outlines the data structures required for tracking, filtering, and displaying statutory holidays across multiple countries and their sub-national jurisdictions (provinces, territories, states, districts, and federal levels). Canada and the United States are currently supported; the registry is designed so additional countries can be layered in without touching UI code.

## 1. Country & Region Registry (`src/data/regions.js`)
Every jurisdiction lives in a single flat `REGIONS` array with an explicit `country` code, so holiday data can reference regions by globally-unique two-letter codes and the app can group, filter, and label them per country.

- **`COUNTRIES` entry attributes:**
  - `code`: ISO 3166-1 alpha-2 country code (e.g., `CA`, `US`).
  - `name`: Full display name (e.g., "United States").
  - `flag`: Flag emoji used in the country switcher and header badge.

- **`REGIONS` entry attributes:**
  - `code`: Two-letter postal abbreviation (e.g., `BC`, `ON`, `TX`, `NY`, `DC`, `FED`). Codes are globally unique across all countries — note that the country code `CA` (Canada) and the region code `CA` (California) occupy different namespaces.
  - `name`: Full official English name of the jurisdiction.
  - `shortName`: Compact label for chips and badges (e.g., "B.C.", "Washington DC").
  - `type`: Classification — `province`, `territory`, `state`, `district`, or `federal`.
  - `country`: Owning country code (`CA` or `US`), attached when the flat `REGIONS` array is assembled.
  - `capital`: Capital city, shown in region details.
  - `standardHolidaysCount`: Number of statutory holidays typically observed in that jurisdiction; used for context copy in the UI.
  - `flag`: Descriptive emoji for the region.
  - `latitude` / `longitude`: Centroid coordinates used for GPS-proximity region detection.
  - `timezone`: IANA timezone identifier (e.g., `America/Vancouver`, `America/New_York`) used as the fallback region-detection signal.

- **Registry helpers:** `getRegionByCode`, `getCountryByCode`, `getRegionsForCountry`, `getCountryForRegion`. `DEFAULT_REGION_CODE` defines the hard fallback when detection and storage both fail.

## 2. Statutory Holiday Object Schema
Every holiday entry processed by the countdown engine must comply with a strict schema to ensure clean filtering by region and date.
- **Schema Fields:**
  - `id`: Unique string slug combining country, holiday name, and year (e.g., `ca-family-day-2026`, `us-thanksgiving-2026`).
  - `name`: Official legal name of the statutory holiday.
  - `date`: Standard ISO-8601 date string formatted strictly as `YYYY-MM-DD`. Per the observance convention below, this holds the **observed** day off.
  - `actualDate`: Optional ISO-8601 date string holding the literal calendar date. Present **only** on holidays that were shifted for weekend observance, so the UI can explain the difference between the actual date and the observed day off. Omit it entirely for non-shifted holidays.
  - `regions`: Array of applicable two-letter region codes where the holiday is legally mandated as a statutory day off.
  - `optionalRegions`: Array of region codes where the holiday is observed but not statutorily mandated; rendered as optional/civic when the user enables optional holidays.
  - `type`: Enumerated string value (`stat` for mandatory statutory holidays, `optional` for civic or non-statutory holidays).
  - `description`: Optional brief explanatory text detailing observance rules or historical context.
  - `longWeekend`: Boolean flag indicating the holiday forms a long weekend, used for the weekend badge in the UI.
  - `category`: Enumerated breadth value (`national`, `provincial`, `territorial`, or `civic`) describing the holiday's scope.

- **Dataset layout:** Canadian entries live in `src/data/holidays.js`; US federal entries live in `src/data/holidaysUS.js` and are spread into the same exported `HOLIDAYS` array, so every consumer (`dateUtils`, countdown, list, celebrations) reads one combined dataset. `ALL_CANADIAN_REGIONS` and `ALL_US_REGIONS` define the "applies everywhere in that country" shorthand.

## 3. Observance Convention (Weekend Shifting)
Holiday `date` values hold the **observed** day off rather than the literal calendar date, so countdowns always target a real day off:

- Saturday holiday → preceding Friday.
- Sunday holiday → following Monday.
- If the shifted date would collide with another holiday already on that date (e.g., Christmas Friday vs. Boxing Day Saturday in Ontario), the next free weekday is used instead.

The literal calendar date is stored in the optional `actualDate` field on shifted entries only, and is surfaced as an "Actual date" note in the holiday detail modal. `getActualDate(holiday)` in `src/utils/dateUtils.js` returns the actual date when a shift exists and `null` otherwise, so callers can skip rendering the note.

## 4. Storage Schema (`localStorage`)
The application state persistence layer relies on lightweight client-side storage keys (see `src/utils/storage.js`):
- `stat_app_region`: Stores the user's selected region code string as a persistent fallback default.
- `stat_app_theme`: Stores user UI theme preference (`dark` or `light`).
- `stat_app_include_optional`: Stores whether optional/civic holidays are included in lists (`'true'` / `'false'`).
- `stat_app_reminders`: Stores whether holiday reminder notifications are opted into (`'true'` / `'false'`).
- `stat_app_notified`: Store of holiday ids already reminded about (JSON array, newest first, capped at 25) so each holiday notifies once.

## 5. Adding a New Country / Region
1. Add a `COUNTRIES` entry (code, name, flag).
2. Add the jurisdiction(s) to a country-specific region array in `src/data/regions.js` with `latitude`, `longitude`, and an IANA `timezone` so GPS and timezone detection can resolve them.
3. Add a country data module (e.g., `holidaysUS.js`) exporting its holiday entries, and spread it into `HOLIDAYS`.
4. Define an `ALL_<COUNTRY>_REGIONS` shorthand and wire the country into the region quick-switch chips if desired.
5. Detection, the country switcher, region picker, and observance matrix all derive from the registry — no UI changes should be required.
