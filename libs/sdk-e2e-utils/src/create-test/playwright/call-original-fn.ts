// (C) 2026 GoodData Corporation

import type { TestDetails } from "@playwright/test";

import type { Describe, DescribeFixme, DescribeOnly, DescribeSkip } from "./playwright-types.js";
import type { ITestDetails } from "./types.js";

/**
 * @internal
 */
export type Callback = () => void;

export type OriginalFn = Describe | DescribeFixme | DescribeOnly | DescribeSkip;

/** Call a Playwright describe function, passing details only when there are any. */
export function callOriginalFn(
    originalFn: OriginalFn,
    title: string,
    pwDetails: TestDetails | undefined,
    callback: Callback,
): void {
    if (pwDetails) {
        originalFn(title, pwDetails, callback);
    } else {
        originalFn(title, callback);
    }
}

/** Strip custom fields before passing details to Playwright. */
export function toPlaywrightDetails(details: ITestDetails | undefined): TestDetails | undefined {
    if (!details) return undefined;
    // oxlint-disable-next-line @typescript-eslint/no-unused-vars
    const { workspaceSettings: _ws, additionalWindowProperties: _awp, ...rest } = details;
    return Object.keys(rest).length > 0 ? rest : undefined;
}

export function parseArgs(
    detailsOrFn: ITestDetails | Callback,
    func?: Callback,
): { details: ITestDetails | undefined; fn: Callback } {
    const hasDetails = typeof detailsOrFn !== "function";
    return {
        details: hasDetails ? detailsOrFn : undefined,
        fn: hasDetails ? (func as Callback) : detailsOrFn,
    };
}
