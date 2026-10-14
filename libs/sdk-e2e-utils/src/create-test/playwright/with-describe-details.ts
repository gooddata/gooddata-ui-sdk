// (C) 2026 GoodData Corporation

import type { Page } from "@playwright/test";

import { mergeFeatureHubFeatures } from "../feature-hub/merge.js";
import { reregisterFeatureHubMock } from "../feature-hub/mock.js";
import type { IFeatureHubFeature } from "../feature-hub/types.js";

import { flagsToFeatures } from "./flag-to-feature.js";
import type { IPlaywrightLocation } from "./playwright-internals.js";
import type { PlaywrightTestInstance } from "./playwright-types.js";
import type {
    Callback,
    FeatureFlags,
    ITestDetails,
    TestConditionsValueConstraint,
    WindowProperties,
} from "./types.js";

function peekOrEmpty<T extends Record<string, unknown>>(stack: T[]): T | Record<string, never> {
    return stack.length > 0 ? stack[stack.length - 1] : {};
}

/** Push merged awp/flags onto stacks, register the beforeEach hooks, call fn, pop. */
export function withDescribeDetails(
    testInstance: PlaywrightTestInstance,
    defaultFeatures: IFeatureHubFeature[],
    awpStack: WindowProperties[],
    flagsStack: FeatureFlags[],
    details: ITestDetails<TestConditionsValueConstraint> | undefined,
    fn: Callback,
) {
    const awp = details?.additionalWindowProperties;
    const ff = details?.featureFlags;
    if (!awp && !ff) {
        fn();
        return;
    }
    const mergedAwp = awp ? { ...peekOrEmpty(awpStack), ...awp } : peekOrEmpty(awpStack);
    const mergedFlags = ff ? { ...peekOrEmpty(flagsStack), ...ff } : peekOrEmpty(flagsStack);

    if (awp) awpStack.push(mergedAwp);
    if (ff) flagsStack.push(mergedFlags);

    if (awp) {
        injectWindowProperties(testInstance, mergedAwp);
    }
    if (ff) {
        injectFeatureFlags(testInstance, defaultFeatures, mergedFlags);
    }
    try {
        fn();
    } finally {
        // Pop even if the body throws, so later describes don't inherit this level's entries.
        if (ff) flagsStack.pop();
        if (awp) awpStack.pop();
    }
}

/**
 * Register a single test's own awp/flags, merged on top of the enclosing describes'.
 * The beforeEach is registered next to the test, after the enclosing describes' injection hooks,
 * so it runs last and its values win.
 */
export function withTestDetails(
    testInstance: PlaywrightTestInstance,
    defaultFeatures: IFeatureHubFeature[],
    awpStack: WindowProperties[],
    flagsStack: FeatureFlags[],
    location: IPlaywrightLocation,
    title: string,
    details: ITestDetails<TestConditionsValueConstraint> | undefined,
): void {
    const awp = details?.additionalWindowProperties;
    const ff = details?.featureFlags;
    if (!awp && !ff) {
        return;
    }
    const mergedAwp = awp ? { ...peekOrEmpty(awpStack), ...awp } : peekOrEmpty(awpStack);
    const mergedFlags = ff ? { ...peekOrEmpty(flagsStack), ...ff } : peekOrEmpty(flagsStack);

    testInstance.beforeEach(async ({ page }, testInfo) => {
        // A beforeEach applies to every test in its describe; only act for this test. Title is part
        // of the match because tests generated in a loop share one location.
        if (
            testInfo.title !== title ||
            testInfo.file !== location.file ||
            testInfo.line !== location.line ||
            testInfo.column !== location.column
        ) {
            return;
        }
        if (awp) {
            await addWindowPropertiesInitScript(page, mergedAwp);
        }
        if (ff) {
            await applyFeatureFlags(page, defaultFeatures, mergedFlags);
        }
    });
}

/** Inject additional window properties via a single addInitScript. */
function injectWindowProperties(testInst: PlaywrightTestInstance, awp: WindowProperties): void {
    testInst.beforeEach(async ({ page }) => {
        await addWindowPropertiesInitScript(page, awp);
    });
}

/** Apply the merged feature flags of a describe level to every test in it. */
function injectFeatureFlags(
    testInst: PlaywrightTestInstance,
    defaultFeatures: IFeatureHubFeature[],
    flags: FeatureFlags,
): void {
    testInst.beforeEach(async ({ page }) => {
        await applyFeatureFlags(page, defaultFeatures, flags);
    });
}

/**
 * Serve `flags` on top of `defaultFeatures` from the FeatureHub mock and expose the raw flags as
 * `window.customWorkspaceSettings`. Init scripts cannot be removed, but each one assigns the whole
 * object, so the last registered level (the innermost) wins.
 */
async function applyFeatureFlags(
    page: Page,
    defaultFeatures: IFeatureHubFeature[],
    flags: FeatureFlags,
): Promise<void> {
    await reregisterFeatureHubMock(page, mergeFeatureHubFeatures(defaultFeatures, flagsToFeatures(flags)));
    await addCustomWorkspaceSettingsInitScript(page, flags);
}

async function addCustomWorkspaceSettingsInitScript(page: Page, flags: FeatureFlags): Promise<void> {
    await page.addInitScript((s: FeatureFlags) => {
        (window as unknown as Record<string, unknown>)["customWorkspaceSettings"] = s;
    }, flags);
}

async function addWindowPropertiesInitScript(page: Page, awp: WindowProperties): Promise<void> {
    await page.addInitScript((a: WindowProperties) => {
        const w = window as unknown as WindowProperties;
        for (const [key, value] of Object.entries(a)) {
            w[key] = value;
        }
    }, awp);
}
