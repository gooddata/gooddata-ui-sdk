// (C) 2026 GoodData Corporation

import type { TestDetails } from "@playwright/test";

import type { ITestDetails, TestConditionsValueConstraint } from "./types.js";

/** Strip custom fields before passing details to Playwright. */
export function toPlaywrightDetails(details: ITestDetails<TestConditionsValueConstraint>): TestDetails {
    // oxlint-disable-next-line @typescript-eslint/no-unused-vars
    const { workspaceSettings: _ws, additionalWindowProperties: _awp, conditions: _c, ...rest } = details;
    return Object.keys(rest).length > 0 ? rest : {};
}
