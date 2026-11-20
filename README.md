# MY UNIVERSE — RED MATRIX

A mobile-first personal space with a red cyber-terminal interface, local notes, goals, photos, reminders, AI chat and live voice conversations.

## Website

https://h2650368-ai.github.io/my-universe/

## What's included

- RED MATRIX visual theme with animated falling code and a safe local command-style terminal.
- Arabic and English interface with RTL/LTR switching.
- Personal sections for ideas, writing, photos, memories, goals and projects.
- Local notes and goals storage; photos stored in browser IndexedDB.
- JSON export/import for text entries and goals.
- PWA manifest, app icon and service worker.
- Reminder center with date/time, one-time or daily repeat, synthesized tones, snooze and notifications.
- PERSONAL AI text chat through a secure server-side Worker.
- LIVE VOICE interface using OpenAI Realtime speech-to-speech, with microphone permission requested only when the user starts a call.
- Capacitor Android wrapper and GitHub Actions workflow that builds a debug APK artifact.

## Deploy the AI backend (Cloudflare Workers)

1. Create a Cloudflare account. A parent/guardian should handle account and billing setup where required.
2. Create a Worker named `my-universe-ai` and connect this repository, or deploy it using the included GitHub Actions workflow.
3. In the Worker settings, add a secret named `OPENAI_API_KEY`. Never put this secret in this repository, the app, or a chat message.
4. Add GitHub repository Actions secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` if you want the included workflow to deploy the Worker automatically.
5. In MY UNIVERSE, open Settings > PERSONAL AI and enter the Worker base URL (for example, your own `https://my-universe-ai.<your-workers-subdomain>.workers.dev` address), without adding `/api/chat`.
6. Test a text message, then start a voice call and allow microphone access.

The Worker exposes:
- `POST /api/chat` for text chat using `gpt-6-luna`.
- `POST /api/realtime-token` to mint a short-lived Realtime client secret for `gpt-realtime-2.1`. The long-lived API key remains on the server.

OpenAI API usage may incur charges separate from ChatGPT. A parent/guardian should handle the API account and any billing. Set usage limits and monitor usage before enabling the public endpoint. Configure Cloudflare rate limiting for `/api/chat` and `/api/realtime-token` before sharing the app widely.

## Build the Android APK

1. Open the repository's Actions tab on GitHub.
2. Select **Build MY UNIVERSE Android APK**.
3. Choose **Run workflow** (or wait for an automatic run after a relevant push).
4. When the run succeeds, open it and download the `my-universe-debug-apk` artifact.

This is a debug APK for testing, not a Play Store release. A signed release build, final app icon, privacy policy and store review are separate release steps.

## Alarm and notification limitations

The current reminder checker runs while the app is open and the browser or WebView allows it to run. The native Android wrapper declares notification and microphone permissions, but exact alarms while the app is fully stopped require additional native scheduling and Android-version-specific permissions. Do not assume alarms are guaranteed until tested on the target device.

## Privacy and memory

- Notes, goals, photos and chat history are currently stored locally in the current browser/app installation; they are not automatically synced to another device.
- The AI backend receives the messages sent for each request. Do not send passwords, API keys or sensitive personal information.
- The current AI persona adapts to the conversation context provided to it; persistent cross-device AI memory and user-controlled memory management are not implemented yet.
- Export backups regularly. Clearing app data may remove local content.

## Publish the website

GitHub: Settings > Pages > Deploy from a branch > main > /(root) > Save. GitHub Pages may take a short time to publish a new commit.
