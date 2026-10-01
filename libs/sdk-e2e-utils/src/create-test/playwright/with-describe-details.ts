// (C) 2026 GoodData Corporation

import type { Callback } from "./call-original-fn.js";
import type { Test } from "./playwright-types.js";
import type { ITestDetails, WindowProperties, WorkspaceSettings } from "./types.js";

function peekOrEmpty(stack: WorkspaceSettings[] | WindowProperties[]): WorkspaceSettings | WindowProperties {
    return stack.length > 0 ? stack[stack.length - 1] : {};
}

/** Push merged settings/awp onto stacks, register a single beforeEach, call fn, pop. */
export function withDescribeDetails(
    testInstance: Test,
    settingsStack: WorkspaceSettings[],
    awpStack: WindowProperties[],
    details: ITestDetails | undefined,
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
    fn();

    if (awp) awpStack.pop();
    if (ws) settingsStack.pop();
}

/** Inject workspace settings and additional window properties via a single addInitScript. */
function injectWindowProperties(testInst: Test, settings: WorkspaceSettings, awp: WindowProperties): void {
    testInst.beforeEach(async ({ page }) => {
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
    });
}
