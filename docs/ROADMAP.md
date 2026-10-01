# Product Roadmap: NextDayOff - Stat Holiday Countdown PWA

This roadmap outlines the future evolution of the application, categorized by phase and complexity. 
Do not begin implementation on these tasks until user explicitly request implementation.

**Reminder delivery ladder.** Holiday reminders are built in three steps inside Phase 1 — Step 1 (Background Sync, no backend, **shipped**) → Step 2 (server-delivered Web Push on Vercel Hobby) → Step 3 (Android app push via FCM). Head-ups are milestone-based (a week before, then 48 hours before) and configured in `REMINDER_OFFSETS_DAYS`. Steps 1–3 are deliberately scoped to free tiers only (Vercel Hobby + Upstash free Redis + Firebase Spark); the researched limits and costs are recorded in _Platform Cost Notes_ at the bottom of this document.

## Phase 1: Smart Notifications & Habit Loops
*Goal: Bring users back to the app without requiring them to manually open it.*

- [x] **International Country Support:** 
  - Expand the data schema to support US holidays. Implement in a scalable way so that adding new countries is easy and doesn't impact performance.
  - _Shipped:_ flat multi-country region registry (`src/data/regions.js`) covering 65 jurisdictions across Canada and the US, per-country holiday modules merged into a single `HOLIDAYS` dataset, a country switcher, country-aware region chips, and a per-country observance matrix. Adding a country is a data-only change — see `docs/DATA_SCHEMA.md`.
- [x] **Observed vs. Actual Date Notes:** 
  - Holiday `date` values store the observed day off (weekend shifting); surface the literal calendar date in the holiday detail modal whenever the two differ.
  - _Shipped:_ optional `actualDate` field on the 2026–2027 shifted entries, rendered as an "Actual date" note in the holiday detail modal via `getActualDate()`.
- [x] **In-App Holiday Reminders:**
  - Opt-in reminders a week and 48 hours before an upcoming statutory holiday, delivered through the service worker notification API.
  - _Shipped:_ de-duplicated per holiday *and* milestone (`holidayId@offsetDays`), checked on load, every 15 minutes while open, and whenever the app returns to the foreground. The most urgent due milestone supplies the wording and every due milestone is marked, so a less urgent one can never fire late. Tapping a reminder focuses or opens the app.
  - _Limitation:_ the check only runs while the app is open or resumed, so nothing arrives when the app is fully closed. The ladder below removes that limitation, cheapest step first.
- [x] **Reminder Step 1 — Background Sync reminders (no backend):**
  - Goal: reminders that still arrive while the app is closed, on Chromium/Android, without adding a server, database, or third-party account.
  - _Shipped:_ `public/notification-sw.js` gained a `periodicsync` listener that replays the reminder plan the app publishes to IndexedDB (`src/utils/reminderPlan.js`) — plan contents: region, milestone offsets, resolved copy table, upcoming holidays, and already-sent milestone keys. The app refreshes that plan on load, on region/optional/reminder changes, and on every foreground resume, then registers the `nextdayoff-reminders` tag with `minInterval: 12h` (unregistered on opt-out, feature-detected, and failure-tolerant so an install-less browser never breaks the app).
  - _Shipped:_ one de-duplication list (`stat_app_notified`) shared by both delivery paths, and a visible-window guard so the worker stands down while an open tab is on screen and the in-app checker owns that moment. The worker mirrors the milestone maths and renders the copy table shipped in the plan, keeping all wording defined once in `src/utils/notifications.js`.
  - _Verified:_ headless-Chrome run of the real worker — plan contents, visible-window guard, exactly one notification per milestone, the 48h milestone superseding the week-ahead one, no stale week-ahead ping afterwards, a disabled plan staying silent, and byte-identical copy between the page module and the worker; plus a Node harness for the milestone/copy rules.
  - _Remaining:_ step 2 replaces the plan-snapshot approach with server push, which is what iOS and Firefox need (this step cannot reach them — see the platform reality below).
  - Platform reality: Chromium only (Android Chrome, desktop Chrome/Edge). Chrome grants the `periodic-background-sync` permission only to _installed_ web apps launched standalone and weighs site engagement when deciding how often the event fires, so `minInterval` is a hint rather than a schedule. Safari and Firefox have no equivalent, so iOS stays on the in-app path until Step 2.
  - Rejected alternative: bringing back an "Add to Calendar" (.ics / `webcal://`) reminder as the iOS workaround. Deliberately out of scope — the app replaced calendar downloads with a single share action, and iOS coverage comes from the installed-app push path in Step 2.
  - Cost: $0 — no backend, no external service.
  - Acceptance: with reminders on and the app fully closed, an Android Chrome-installed user receives exactly one reminder per holiday inside the 48-hour window; turning reminders off unregisters the sync; overlapping paths never double-notify.
- [ ] **Reminder Step 2 — Server-delivered Web Push (Vercel Hobby, $0):**
  - Goal: reminders that arrive with the app fully closed on Android, desktop, and iOS web apps installed to the Home Screen.
  - Endpoints as Vercel Functions under `/api`: `POST /api/push/subscribe`, `POST /api/push/unsubscribe`, and `GET /api/cron/reminders`.
  - Storage: Upstash Redis via the Vercel Marketplace (free tier: 256 MB, 500K commands/month, 10 GB bandwidth). Index subscriptions in a sorted set keyed by next-due timestamp and read them with `ZRANGEBYSCORE`, so each run touches only the due subset instead of every subscriber.
  - Subscription record: `{ id, transport: 'webpush', endpoint, keys: { p256dh, auth }, regionCode, timezone, createdAt, lastSeenAt, failureCount }`.
  - Sender: `web-push` on the Node runtime with VAPID keys from env (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`); treat push-service `404`/`410` responses as "delete this subscription".
  - Schedule: a daily entry in `vercel.json` → `crons`. Hobby allows up to 100 cron jobs per project, but each job may run **only once per day** — a more frequent expression fails the deployment — with per-hour precision (±59 minutes) and no guarantee on invocation time.
  - Protect the route with a `CRON_SECRET` env var: Vercel sends `Authorization: Bearer $CRON_SECRET` automatically, and the function returns `401` on a mismatch.
  - Timing model: with a single check per day, promise a "2 days before" heads-up plus a "day before" reminder, and send only when the run falls inside the subscriber's local 08:00–10:00 window (timezone is stored per subscription). Hour-exact delivery would need Pro (per-minute crons) or several once-daily cron entries used as extra checks — record that trade-off rather than promising 48-hour precision.
  - Client: call `pushManager.subscribe()` from the existing reminder opt-in gesture and POST the subscription; add `push` and `pushsubscriptionchange` handlers to `public/notification-sw.js` so a rotated subscription re-uploads itself.
  - Send **Declarative Web Push** payloads (`{"web_push":8030,"notification":{…}}`) so iOS still renders the reminder even when the service worker has been evicted, while the `push` handler replaces the content whenever it does run.
  - iOS reality: Web Push reaches only web apps added to the Home Screen on iOS/iPadOS 16.4+; the permission prompt must follow a tap inside that installed app, and every push must display a notification (`userVisibleOnly: true`). `ReminderPrompt` should detect "iOS + not installed" and show an "Add to Home Screen to enable reminders" nudge instead of a permission button.
  - Data minimisation: store only endpoint, keys, region, and timezone; `POST /api/push/unsubscribe` plus 404/410 pruning keeps the store self-cleaning.
  - Cost: $0 — Hobby includes 1,000,000 function invocations, 4 active CPU hours, 360 GB-hrs provisioned memory, and 100 GB fast data transfer per month; a daily cron costs roughly 30 invocations per month.
  - Acceptance: a subscribed user receives a reminder with the app closed; expired or revoked subscriptions are pruned instead of retried forever; the cron returns `401` without the secret; unsubscribing stops delivery immediately.

- [ ] **Reminder Step 3 — Android app (APK) push via FCM:**
  - Goal: the planned Android build receives reminders under the app's own identity, including after the app is swiped away.
  - Wrap the existing Vite build in **Capacitor**, add `@capacitor/push-notifications`, create a Firebase project (Spark free plan), place `google-services.json` in `android/app/`, then `npx cap sync android`.
  - **Web Push cannot be reused here:** Chrome does not expose Web Push inside Android WebView, so the Capacitor build must register through FCM. On the plugin's `registration` event, POST the FCM token to the same `/api/push/subscribe` endpoint with `transport: 'fcm'`.
  - Sender: FCM HTTP v1 API from the existing reminder cron, authenticating with a Firebase service account (JSON in env plus `google-auth-library`), so web and app share one decision source — see _Shared reminder logic_ below.
  - Android 13+ requires the runtime `POST_NOTIFICATIONS` permission (the plugin requests it) and a notification channel for the reminder.
  - Signing and distribution are covered in the _Platform Track_ section below.
  - Alternative kept for context: a Bubblewrap / Trusted Web Activity APK would reuse standard Web Push delivered by Chrome with no FCM setup, but those notifications carry Chrome's identity — Chrome removed the FCM-sender-ID notification-delegation path in v113 — so Capacitor + FCM is the chosen route for an app-branded experience.
  - Cost: $0 for Firebase/FCM and the Capacitor build; publishing to Play adds a $25 one-time registration fee.
  - Acceptance: an Android 13+ device registers a token; the reminder arrives with the app closed; a denied permission or an uninstalled app surfaces as a pruned token rather than a failing cron.
- [ ] **Reminder milestones beyond a week and 48 hours:**
  - `REMINDER_OFFSETS_DAYS` in `src/utils/notifications.js` is the single list of heads-ups — a day-before nudge is one array entry plus an optional copy override in `REMINDER_COPY`. Anything added there flows through the in-app path, the plan, and the worker with no other changes.
- [ ] **Shared reminder logic (finish at step 2):**
  - The injected worker mirrors the milestone maths from `src/utils/notifications.js` because Workbox injects it as plain script; only the copy table is genuinely shared (it travels inside the plan). Step 2's `/api` functions are bundled, so they can import the real helpers — do that then, and either keep the worker's mirror with its cross-reference comment or migrate the worker to `injectManifest` so it is bundled too.
- [x] **Honest delivery UI:**
  - _Shipped:_ `InfoModal` states the milestone schedule and the delivery path that actually applies to the device (background reminders active / install the app to enable them / in-app checks only), sourced from the periodic-sync registration result rather than a promise the browser cannot keep.

## Phase 2: Advanced Optimization & Expansion
*Goal: Broaden market and offer deeper productivity features.*

- [ ] **Support for more countries and regions:** 
  - After having support for Canada and US holidays, expand to support more countries like UK, and EU.
- [ ] **Multi-Country Pinning:** 
  - Enable users tracking multiple regions (e.g., remote workers with colleagues in different countries) to pin and compare upcoming holiday timelines side-by-side.
- [ ] **Custom User Holidays:** 
  - Allow users to manually add floating holidays, organization closures, or personal days off.

## Platform Track: Deployment, PWA & Android App
*Goal: ship one codebase to the web (Vercel) and to Android, with reminders that work on both.*

- [ ] **Vercel deployment:**
  - Static Vite build on Vercel: framework preset Vite, build command `npm run build`, output directory `dist`.
  - Add `vercel.json` when Step 2 lands, for the `crons` entry (plus any security headers on top of Vercel's defaults). No SPA rewrite is needed today: the app has no client-side router, so every path already serves `index.html` and notification taps open `/`.
  - Set environment variables per environment (Production and Preview): `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `CRON_SECRET`, and the Upstash REST URL/token from the Marketplace integration.
  - Hobby constraint: personal, non-commercial use only — Vercel's fair-use guidance lists static sites, SPAs, and "functions that query DBs or APIs" as fair use. Exceeding a Hobby allotment pauses deployments instead of billing an overage, so there is no surprise invoice; there is also no way to raise a Hobby limit without upgrading.
- [ ] **PWA hardening (prerequisite for Step 2 push):**
  - Already shipped: the manifest generated by `vite-plugin-pwa` from the `manifest` block in `vite.config.js` (so edits belong there, not in a static `public/manifest.*`), `display: 'standalone'` with `orientation: 'portrait-primary'`, `public/notification-sw.js` injected through `workbox.importScripts`, an `InstallBanner`, and the iOS `apple-touch-icon` plus `apple-mobile-web-app-capable` tags in `index.html`.
  - Keep `display: 'standalone'`: it is required both for iOS Web Push and for Chrome to grant the periodic background sync permission.
  - Add `screenshots` and `display_override` to the manifest so install prompts render correctly, and ship a dedicated 512×512 maskable icon with a real safe zone — today a single file is reused as `purpose: 'any maskable'`, which crops badly under launcher icon masks.
  - Offline-first: precache the app shell and holiday data so the countdown renders offline, and surface a "data as of <date>" hint when the served copy is stale.
  - Add a Home Screen install nudge in `ReminderPrompt` for iOS — nothing can be pushed there until the user installs the web app.
  - `public/notification-sw.js` currently handles only `notificationclick`; Steps 1 and 2 add the `periodicsync`, `push`, and `pushsubscriptionchange` handlers to that same file.
- [ ] **Android build track:**
  - Capacitor wrapper around the existing `dist` build (Step 3); debug APK first, then a signed release AAB using Play App Signing, with `versionCode`/`versionName` bumps recorded in `docs/DEVELOPMENT.md`.
  - Reuse `Storage`/`dateUtils` logic (localStorage maps to the WebView's storage), and keep the native shell thin: the web app stays the single implementation, Capacitor only adds FCM registration and the Android notification channel.
  - Optional CI: a GitHub Action that runs `npm run build`, `npx cap sync android`, and `./gradlew assembleDebug`, publishing the APK as a build artifact.
  - Store readiness (sideload only at first): privacy policy page, an icon set, and a "reminders need notifications enabled" note. Play listing is what the one-time $25 registration buys.

## Platform Cost Notes
*Researched 2026-09; re-verify before implementation, since vendor limits change.*

### Vercel Hobby (the deployment target)
| Resource | Hobby allotment | Relevance to reminders |
| --- | --- | --- |
| Cron Jobs per project | 100 jobs, but **each runs at most once per day**; a more frequent expression fails the deployment | One daily run is the whole budget for Step 2; per-minute precision requires Pro |
| Cron timing | Per-hour precision (±59 min), invocation time not guaranteed | Cannot promise an exact hour; send inside a local-time window instead |
| Function Invocations | 1,000,000 / month | A daily cron ≈ 30 / month |
| Active CPU | 4 hours / month | A ~300 ms cron ≈ 9 seconds / month |
| Provisioned Memory | 360 GB-hrs / month | Negligible at this scale |
| Fast Data Transfer | First 100 GB / month | Push payloads are tiny JSON |
| Over-limit behaviour | Deployments are paused; no pay-as-you-go on Hobby | Free by design, no overage billing |
| Use policy | Personal / non-commercial | Fine for a personal utility; ads or commercial use means Pro (≈ $20 per seat / month) |
| Cron auth | `CRON_SECRET` is sent as `Authorization: Bearer …` | Four lines in the route handler |

### Supporting services (all free at this app's scale)
- **Web Push itself is free:** VAPID keys are self-generated, and FCM/APNs charge nothing per message. No Apple Developer Program is needed for iOS Web Push, because it rides on Safari in an installed web app.
- **Upstash Redis (Vercel Marketplace):** free tier = 256 MB data, 500K commands/month, 10 GB bandwidth, 1 database; pay-as-you-go is $0.20 per 100K commands. A due-date sorted set keeps a run to roughly one read plus one prune. Note `@vercel/kv` is deprecated, which is why the Marketplace integration is the path.
- **Firebase (Step 3):** Spark plan is free; FCM HTTP v1 sending has no per-message charge. A Firebase service account JSON is the only credential.

### Total cost
- Steps 1–3 as specified: **$0**, plus an optional one-time $25 Google Play registration.
- Paid only if: per-minute cron precision or commercial hosting is wanted (Vercel Pro, ≈ $20/seat/month), the app is published to Play ($25 one-time), or a native iOS app is built ($99/year Apple Developer Program — not recommended, since the installed web app already receives iOS push).
