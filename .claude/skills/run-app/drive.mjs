// Generic Playwright driver for the Theia frontend.
// Launches headless Chromium, loads the app, waits for the map to render,
// and reports console errors + a full-page screenshot. Extend inline for
// feature-specific checks (see SKILL.md for a worked example and for the
// gotchas around leaflet overlay-pane vs marker-pane selectors).
//
// Usage: node drive.mjs [baseUrl] [screenshotPath]
import { chromium } from "playwright";

const baseUrl = process.argv[2] ?? "http://localhost:5173";
const screenshotPath = process.argv[3] ?? "./screenshot.png";

const consoleErrors = [];
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});

await page.goto(baseUrl, { waitUntil: "networkidle" });
// The map is the reliable "app has rendered" signal (Gui -> RadarMap -> react-leaflet).
await page.waitForSelector(".leaflet-container", { timeout: 15000 });
await page.waitForTimeout(1000); // let the first data fetch/render settle

await page.screenshot({ path: screenshotPath, fullPage: true });

console.log(JSON.stringify({ screenshotPath, consoleErrors }, null, 2));
await browser.close();
