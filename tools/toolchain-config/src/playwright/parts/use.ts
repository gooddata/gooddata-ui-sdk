// (C) 2026 GoodData Corporation

import { type PlaywrightTestConfig } from "@playwright/test";

import { E2E_TIMEOUTS } from "./timeouts.js";

/**
 * Options for {@link browserUse}.
 */
export interface IBrowserUseOptions {
    /**
     * Base URL for relative navigation. Undefined leaves it to the overrides or to absolute URLs
     * in the tests.
     */
    baseURL?: string;

    /**
     * Whether this run records goodmock mappings rather than replaying them.
     */
    recording?: boolean;

    /**
     * Turn trace and video collection off while recording. Recording runs against a live backend
     * and is a maintenance flow, so long record sessions should not be starved by the heavy
     * artifact collection. Defaults to false.
     */
    skipArtifactsWhenRecording?: boolean;
}

/**
 * The `use` block every e2e suite shares: self-signed certificates accepted, trace always on,
 * video and screenshot kept on failure, and the shared action and navigation timeouts.
 */
export function browserUse(options: IBrowserUseOptions = {}): PlaywrightTestConfig["use"] {
    const { baseURL, recording = false, skipArtifactsWhenRecording = false } = options;
    const skipArtifacts = recording && skipArtifactsWhenRecording;

    return {
        baseURL,
        ignoreHTTPSErrors: true,
        trace: skipArtifacts ? "off" : "on",
        video: skipArtifacts ? "off" : "retain-on-failure",
        screenshot: "only-on-failure",
        actionTimeout: E2E_TIMEOUTS.action,
        navigationTimeout: E2E_TIMEOUTS.navigation,
    };
}
