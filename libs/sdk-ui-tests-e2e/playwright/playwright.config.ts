// (C) 2026 GoodData Corporation

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

import { defineConfig } from "@playwright/test";
const isRecording = process.env["RECORD_MODE"] === "true";

// eslint-disable-next-line no-restricted-exports
export default defineConfig({
    testDir: "./tests",
    // TODO: remove --pass-with-no-tests flag and fix the workflow logic after integrated test migration to playwright is merged
    timeout: 60_000,
    expect: {
        timeout: 45_000,
    },
    workers: 1, // serial — tests share a single goodmock instance
    retries: isRecording ? 0 : 2, // no retries when recording — they break mapping storage
    reporter: [["list"], ["json", { outputFile: "results/results.json" }]],
    use: {
        baseURL: process.env["BASE_URL"] || "http://gooddata-ui-sdk-scenarios:9500",
        ignoreHTTPSErrors: true,
        trace: "retain-on-failure",
        video: "retain-on-failure",
        screenshot: "only-on-failure",
        actionTimeout: 30_000,
        navigationTimeout: 45_000,
    },
    projects: [
        {
            name: "chromium",
            use: {
                browserName: "chromium",
                viewport: { width: 1400, height: 800 },
                launchOptions: {
                    args: [
                        "--disable-gpu",
                        "--disable-dev-shm-usage",
                        "--no-sandbox",
                        // Allow HTTP iframes on HTTPS pages (e.g. S3 iframe test page loading
                        // the dashboard from the Docker-internal HTTP host). Cypress proxies all
                        // requests through its local server which bypasses this check; Playwright
                        // does not, so we need the flag explicitly.
                        "--allow-running-insecure-content",
                        "--ignore-certificate-errors",
                    ],
                },
            },
        },
    ],
});
