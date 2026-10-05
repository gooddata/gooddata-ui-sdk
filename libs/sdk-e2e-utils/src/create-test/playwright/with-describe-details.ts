// (C) 2026 GoodData Corporation

import type { Page } from "@playwright/test";

import type { IPlaywrightLocation } from "./playwright-internals.js";
import type { PlaywrightTestInstance } from "./playwright-types.js";
import type {
    Callback,
    ITestDetails,
    TestConditionsValueConstraint,
    WindowProperties,
    WorkspaceSettings,
} from "./types.js";

function peekOrEmpty(stack: WorkspaceSettings[] | WindowProperties[]): WorkspaceSettings | WindowProperties {
    return stack.length > 0 ? stack[stack.length - 1] : {};
}

/** Push merged settings/awp onto stacks, register a single beforeEach, call fn, pop. */
export function withDescribeDetails(
    testInstance: PlaywrightTestInstance,
    settingsStack: WorkspaceSettings[],
    awpStack: WindowProperties[],
    details: ITestDetails<TestConditionsValueConstraint> | undefined,
    fn: Callback,
) {
    const ws = details?.workspaceSettings;
    const awp = details?.additionalWindowProperties;
    if (!ws && !awp) {
        fn();
        return;
    }
    const mergedSettings = ws ? { ...peekOrEmpty(settingsStack), ...ws } : peekOrEmpty(settingsStack);
    const mergedAwp = awp ? { ...peekOrEmpty(awpStack), ...awp } : peekOrEmpty(awpStack);

    if (ws) settingsStack.push(mergedSettings);
    if (awp) awpStack.push(mergedAwp);

    injectWindowProperties(testInstance, mergedSettings, mergedAwp);
    try {
        fn();
    } finally {
        // Pop even if the body throws, so later describes don't inherit this level's entries.
        if (awp) awpStack.pop();
        if (ws) settingsStack.pop();
    }
}

/**
 * Register a single test's own settings/awp, merged on top of the enclosing describes'.
 * The beforeEach is registered next to the test, after the enclosing describes' injection hooks,
 * so it runs last and its values win.
 */
export function withTestDetails(
    testInstance: PlaywrightTestInstance,
    settingsStack: WorkspaceSettings[],
    awpStack: WindowProperties[],
    location: IPlaywrightLocation,
    title: string,
    details: ITestDetails<TestConditionsValueConstraint> | undefined,
): void {
    const ws = details?.workspaceSettings;
    const awp = details?.additionalWindowProperties;
    if (!ws && !awp) {
        return;
    }
    const mergedSettings = ws ? { ...peekOrEmpty(settingsStack), ...ws } : peekOrEmpty(settingsStack);
    const mergedAwp = awp ? { ...peekOrEmpty(awpStack), ...awp } : peekOrEmpty(awpStack);

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
        await addWindowPropertiesInitScript(page, mergedSettings, mergedAwp);
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
