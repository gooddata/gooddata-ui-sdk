// (C) 2026 GoodData Corporation

import { chromiumProject } from "../parts/chromium.js";
import { goodmockRetries } from "../parts/goodmock.js";
import { defaultReporters } from "../parts/reporters.js";
import { E2E_TIMEOUTS } from "../parts/timeouts.js";
import { allowSelfSignedTls } from "../parts/tls.js";
import { type IBrowserUseOptions, browserUse } from "../parts/use.js";

import { createPlaywrightPreset } from "./createPreset.js";

/**
 * Options for the {@link e2e} preset.
 */
export interface IE2EOptions extends IBrowserUseOptions {
    /**
     * Base URL used when the `BASE_URL` environment variable is not set, typically the Docker
     * service name of the app under test.
     */
    baseURL?: string;

    /**
     * Chromium launch flags appended to the shared base flags.
     */
    chromiumLaunchArgs?: readonly string[];

    /**
     * Accept self-signed certificates in Node for the whole test process. Defaults to true.
     */
    insecureTls?: boolean;
}

/**
 * Playwright preset for an e2e package running against a Dockerised app behind goodmock: serial
 * workers, retries unless recording, list plus json reporters, trace and failure artifacts, and a
 * single Chromium project.
 *
 * @example
 * ```ts
 * // playwright/playwright.config.ts
 * import { presets } from "@gooddata/toolchain-config/playwright";
 *
 * export default presets.e2e({ baseURL: "http://gdc-catalog:9600", recording: isRecording });
 * ```
 */
export const e2e = createPlaywrightPreset(
    ({ baseURL, recording = false, chromiumLaunchArgs, insecureTls = true, ...useOptions }: IE2EOptions) => {
        if (insecureTls) {
            allowSelfSignedTls();
        }

        return {
            testDir: "./tests",
            timeout: E2E_TIMEOUTS.test,
            expect: {
                timeout: E2E_TIMEOUTS.expect,
            },
            // Serial: the tests share a single goodmock instance.
            workers: 1,
            retries: goodmockRetries(recording),
            reporter: defaultReporters(),
            use: browserUse({
                baseURL: process.env["BASE_URL"] || baseURL,
                recording,
                ...useOptions,
            }),
            projects: [chromiumProject({ launchArgs: chromiumLaunchArgs })],
        };
    },
);
