// (C) 2007-2019 GoodData Corporation

const scenarios = require("./scenarios.config");

const backstopConfig = {
    id: "storybook",
    viewports: [
        {
            label: "desktop",
            width: 1024,
            height: 768,
        },
    ],
    scenarios,
    paths: {
        bitmaps_reference: "reference",
        bitmaps_test: "output/tests",
        html_report: "output/html-report",
        ci_report: "output/ci-report",
    },
    engine: "puppeteer",
    engineOptions: {
        args: [
            "--disable-infobars",
            "--disable-background-networking",
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-breakpad",
            "--disable-client-side-phishing-detection",
            "--disable-default-apps",
            "--disable-dev-shm-usage",
            "--disable-extensions",
            "--disable-features=site-per-process",
            "--disable-hang-monitor",
            "--disable-ipc-flooding-protection",
            "--disable-popup-blocking",
            "--disable-prompt-on-repost",
            "--disable-renderer-backgrounding",
            "--disable-sync",
            "--disable-translate",
            "--metrics-recording-only",
            "--no-first-run",
            "--safebrowsing-disable-auto-update",
            "--enable-automation",
            "--disable-component-update",
            "--disable-web-resource",
            "--mute-audio",
            "--no-sandbox",
            "--disable-software-rasterizer",
            "--disable-gpu",
        ],
    },
    report: ["CI"],
    asyncCaptureLimit: 5,
    resembleOutputOptions: { ignoreAntialiasing: true },
    asyncCompareLimit: 50,
};

module.exports = backstopConfig;
