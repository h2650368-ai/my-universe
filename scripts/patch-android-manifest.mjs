import { readFileSync, writeFileSync } from "node:fs";
const path = "android/app/src/main/AndroidManifest.xml";
let xml = readFileSync(path, "utf8");
const permissions = [
  "android.permission.INTERNET",
  "android.permission.RECORD_AUDIO",
  "android.permission.MODIFY_AUDIO_SETTINGS",
  "android.permission.POST_NOTIFICATIONS"
];
for (const permission of permissions) {
  const tag = `<uses-permission android:name="${permission}" />`;
  if (!xml.includes(tag)) xml = xml.replace("<manifest", "<manifest\\n    " + tag);
}
writeFileSync(path, xml);
console.log("Android permissions added.");
