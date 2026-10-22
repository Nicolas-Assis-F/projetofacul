const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
    deviceScaleFactor: 1,
  });
  page.on("pageerror", (error) => console.error(error.message));
  await page.goto(process.env.PREVIEW_URL || "http://127.0.0.1:3000");
  await page.getByText("Grandes ideias começam").waitFor();
  await page.evaluate(() => document.fonts.ready);
  // Charts animate on first render; wait for their final plotted state.
  await page.waitForTimeout(1600);
  await page.screenshot({ path: "docs/preview-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "docs/preview-mobile.png", fullPage: true });
  console.log("Prévia desktop e mobile salva em docs/.");
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
