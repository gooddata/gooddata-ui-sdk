// (C) 2026 GoodData Corporation

import type { TestDetails } from "@playwright/test";

import type { ITestDetails } from "./types.js";

/** Strip custom fields before passing details to Playwright. */
export function toPlaywrightDetails(details: ITestDetails): TestDetails {
    // oxlint-disable-next-line @typescript-eslint/no-unused-vars
    const { workspaceSettings: _ws, additionalWindowProperties: _awp, ...rest } = details;
    return Object.keys(rest).length > 0 ? rest : {};
}
