// (C) 2026 GoodData Corporation

import { GoodmockMode, goodmockMode } from "@gooddata/sdk-e2e-utils";
import { presets } from "@gooddata/toolchain-config/playwright";

const isRecording = goodmockMode() === GoodmockMode.Record;

export default presets.e2e({
    baseURL: "http://gooddata-ui-sdk-scenarios:9600",
    recording: isRecording,
    chromiumLaunchArgs: [
        // Allow HTTP iframes on HTTPS pages (e.g. S3 iframe test page loading
        // the dashboard from the Docker-internal HTTP host). Cypress proxies all
        // requests through its local server which bypasses this check; Playwright
        // does not, so we need the flag explicitly.
        "--allow-running-insecure-content",
        "--ignore-certificate-errors",
    ],
});
