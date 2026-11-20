import { mkdirSync, copyFileSync } from "node:fs";
mkdirSync("www", { recursive: true });
for (const file of ["index.html", "manifest.webmanifest", "sw.js", "icon.svg"]) {
  copyFileSync(file, "www/" + file);
}
console.log("Prepared MY UNIVERSE web assets for Android.");
