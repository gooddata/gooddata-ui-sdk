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
    ITestDetails,
    TestConditionsValueConstraint,
    WindowProperties,
    WorkspaceSettings,
} from "./types.js";

function peekOrEmpty<T extends Record<string, unknown>>(stack: T[]): T | Record<string, never> {
    return stack.length > 0 ? stack[stack.length - 1] : {};
}

function peekFeatures(stack: IFeatureHubFeature[][]): IFeatureHubFeature[] {
    return stack.length > 0 ? stack[stack.length - 1] : [];
}

/** Push merged settings/awp/features onto stacks, register the beforeEach hooks, call fn, pop. */
export function withDescribeDetails(
    testInstance: PlaywrightTestInstance,
    settingsStack: WorkspaceSettings[],
    awpStack: WindowProperties[],
    featuresStack: IFeatureHubFeature[][],
    details: ITestDetails<TestConditionsValueConstraint> | undefined,
    fn: Callback,
) {
    const ws = details?.workspaceSettings;
    const awp = details?.additionalWindowProperties;
    const ff = details?.featureFlags;
    if (!ws && !awp && !ff) {
        fn();
        return;
    }
    const mergedSettings = ws ? { ...peekOrEmpty(settingsStack), ...ws } : peekOrEmpty(settingsStack);
    const mergedAwp = awp ? { ...peekOrEmpty(awpStack), ...awp } : peekOrEmpty(awpStack);
    const mergedFeatures = ff
        ? mergeFeatureHubFeatures(peekFeatures(featuresStack), flagsToFeatures(ff))
        : peekFeatures(featuresStack);

    if (ws) settingsStack.push(mergedSettings);
    if (awp) awpStack.push(mergedAwp);
    if (ff) featuresStack.push(mergedFeatures);

    if (ws || awp) {
        injectWindowProperties(testInstance, mergedSettings, mergedAwp);
    }
    if (ff) {
        injectFeatureHubMock(testInstance, mergedFeatures);
    }
    try {
        fn();
    } finally {
        // Pop even if the body throws, so later describes don't inherit this level's entries.
        if (ff) featuresStack.pop();
        if (awp) awpStack.pop();
        if (ws) settingsStack.pop();
    }
}

/**
 * Register a single test's own settings/awp/features, merged on top of the enclosing describes'.
 * The beforeEach is registered next to the test, after the enclosing describes' injection hooks,
 * so it runs last and its values win.
 */
export function withTestDetails(
    testInstance: PlaywrightTestInstance,
    settingsStack: WorkspaceSettings[],
    awpStack: WindowProperties[],
    featuresStack: IFeatureHubFeature[][],
    location: IPlaywrightLocation,
    title: string,
    details: ITestDetails<TestConditionsValueConstraint> | undefined,
): void {
    const ws = details?.workspaceSettings;
    const awp = details?.additionalWindowProperties;
    const ff = details?.featureFlags;
    if (!ws && !awp && !ff) {
        return;
    }
    const mergedSettings = ws ? { ...peekOrEmpty(settingsStack), ...ws } : peekOrEmpty(settingsStack);
    const mergedAwp = awp ? { ...peekOrEmpty(awpStack), ...awp } : peekOrEmpty(awpStack);
    const mergedFeatures = ff
        ? mergeFeatureHubFeatures(peekFeatures(featuresStack), flagsToFeatures(ff))
        : peekFeatures(featuresStack);

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
        if (ws || awp) {
            await addWindowPropertiesInitScript(page, mergedSettings, mergedAwp);
        }
        if (ff) {
            await reregisterFeatureHubMock(page, mergedFeatures);
        }
    });
}

/** Inject workspace settings and additional window properties via a single addInitScript. */
function injectWindowProperties(
    testInst: PlaywrightTestInstance,
    settings: WorkspaceSettings,
    awp: WindowProperties,
): void {
    testInst.beforeEach(async ({ page }) => {
        await addWindowPropertiesInitScript(page, settings, awp);
    });
}

/** Replace the FeatureHub mock registered by the root describe with one serving `features`. */
function injectFeatureHubMock(testInst: PlaywrightTestInstance, features: IFeatureHubFeature[]): void {
    testInst.beforeEach(async ({ page }) => {
        await reregisterFeatureHubMock(page, features);
    });
}

async function addWindowPropertiesInitScript(
    page: Page,
    settings: WorkspaceSettings,
    awp: WindowProperties,
): Promise<void> {
    await page.addInitScript(
        (args: { s: WorkspaceSettings; a: WindowProperties }) => {
            const w = window as unknown as WindowProperties;
            if (Object.keys(args.s).length > 0) {
                w["customWorkspaceSettings"] = args.s;
            }
            for (const [key, value] of Object.entries(args.a)) {
                w[key] = value;
            }
        },
        { s: settings, a: awp },
    );
}
