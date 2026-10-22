import { defineConfig } from "@playwright/test";
if (process.env.TEST_DATABASE !== "true" || !process.env.DATABASE_URL) {
  throw new Error(
    "E2E requires TEST_DATABASE=true and DATABASE_URL pointing to an isolated test database.",
  );
}
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:3101",
    browserName: "chromium",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run start:demo",
    url: "http://127.0.0.1:3101/ready",
    timeout: 60000,
    reuseExistingServer: false,
    env: { PORT: "3101", NODE_ENV: "test" },
  },
});
