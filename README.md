# MY UNIVERSE — RED MATRIX

A mobile-first personal space with a red cyber-terminal interface, local notes, goals, photos, AI chat integration and reminders.

## Website
https://h2650368-ai.github.io/my-universe/

## What's included
- RED MATRIX visual theme with animated falling code and a local command-style terminal.
- Arabic and English interface with RTL/LTR switching.
- Personal sections for ideas, writing, photos, memories, goals and projects.
- Local notes and goals storage; photos stored in browser IndexedDB.
- JSON export/import for text entries and goals.
- PWA manifest, app icon, service worker and offline app-shell caching.
- Reminder center with date/time, one-time or daily repeat, selectable synthesized tones, snooze, and notification permission.
- PERSONAL AI chat client, ready to connect to the secure Worker backend in `worker.js`.

## Alarm and notification limitations
The web reminder checker runs while the page is open and the browser allows it to run. Mobile browsers may suspend background pages, and a PWA cannot request Android's special "display over other apps" permission or guarantee exact alarms after the app is fully closed. For reliable alarms after process exit, a native Android app with Android alarm scheduling and notification permissions is required. Notification delivery also depends on browser and device settings.

## Enable PERSONAL AI (requires separate hosting)
1. Deploy `worker.js` as a Cloudflare Worker. Configure the Worker route/path to accept `/api/chat`.
2. In the Worker settings, add a secret named `OPENAI_API_KEY`. Never put this secret in this repository or in the website settings.
3. Open the site, go to Settings > PERSONAL AI, and enter the Worker base URL (without `/api/chat`), then save.
4. The chat sends up to 12 recent messages to the Worker. The Worker forwards them to the OpenAI Responses API.

An API key and API usage may require billing. Have a parent or guardian handle any account, payment, and secret-key setup. Never send an API key in chat or commit it to GitHub.

## Publish the website
GitHub: Settings > Pages > Deploy from a branch > main > /(root) > Save. GitHub Pages may take a short time to publish a new commit.

## Install
- Android: open the HTTPS website in a supported browser, then choose Install app / Add to Home screen.
- iPhone: Safari > Share > Add to Home Screen.

## Privacy and limitations
This is a static website plus an optional separate AI Worker. Notes and goals are stored in the current browser; photos use local IndexedDB. They are not synced between devices. Clearing browser data may remove them, so export backups regularly.
The AI Worker forwards conversation messages to the AI provider when connected. Do not send sensitive personal information. The worker source contains no API key; the key must be stored as a server-side secret.
