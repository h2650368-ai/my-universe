# MY UNIVERSE

A mobile-first, iPhone-inspired personal space with a premium dark nebula interface.

## Website
https://h2650368-ai.github.io/my-universe/

## Included
- Premium responsive interface with glass panels, nebula lighting and animated-feeling visual depth.
- Arabic and English interface with RTL/LTR switching.
- Personal sections for ideas, writing, photos, memories, goals and projects.
- Local notes and goals storage; photos stored in browser IndexedDB.
- JSON export/import for text entries and goals.
- PWA manifest, app icon, service worker and offline app-shell caching.
- PERSONAL AI chat client, ready to connect to the secure Worker backend in `worker.js`.

## Enable PERSONAL AI (requires separate hosting)
1. Deploy `worker.js` as a Cloudflare Worker. Configure the Worker route/path to accept `/api/chat`.
2. In the Worker settings, add a secret named `OPENAI_API_KEY`. Never put this secret in this repository or in the website settings.
3. Open the site, go to Settings > PERSONAL AI, and enter the Worker base URL (without `/api/chat`), then save.
4. The chat sends up to 12 recent messages to the Worker. The Worker forwards them to the OpenAI Responses API using `gpt-6-luna`.

**Important:** An API key and API usage may require billing. Have a parent or guardian handle any account, payment, and secret-key setup. Do not send an API key in chat or commit it to GitHub.

## Publish the website
GitHub: Settings > Pages > Deploy from a branch > main > /(root) > Save.

## Install
- Android: supported browser menu > Install app / Add to Home screen.
- iPhone: Safari > Share > Add to Home Screen.

## Privacy and limitations
This is a static website plus an optional separate AI Worker. Notes and goals are stored in the current browser; photos use local IndexedDB. They are not synced between devices. Clearing browser data may remove them, so export backups regularly.
The AI Worker forwards conversation messages to the AI provider when connected. Do not send sensitive personal information. The worker source contains no API key; the key must be stored as a server-side secret.
