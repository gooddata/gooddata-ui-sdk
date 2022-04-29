// (C) 2007-2019 GoodData Corporation

const scenarios = require("./scenarios.config");

const asyncCaptureLimit = parseInt(process.env.BACKSTOP_CAPTURE_LIMIT) || 4;
const asyncCompareLimit = parseInt(process.env.BACKSTOP_COMPARE_LIMIT) || 40;

console.log(`Backstop concurrency settings = capture: ${asyncCaptureLimit}, compare: ${asyncCompareLimit} `);

const backstopConfig = {
    id: "storybook",
    viewports: [
        {
            label: "desktop",
            width: 1024,
            height: 768,
        },
    ],
    delay: 1000,
    onReadyScript: "puppet/onReady.js",
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
    asyncCaptureLimit,
    resembleOutputOptions: { ignoreAntialiasing: true },
    asyncCompareLimit,
};

module.exports = backstopConfig;
