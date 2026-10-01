// (C) 2026 GoodData Corporation

import type { TestDetails } from "@playwright/test";

/**
 * @internal
 */
export type WorkspaceSettings = Record<string, unknown>;

/**
 * @internal
 */
export type WindowProperties = Record<string, unknown>;

/**
 * @internal
 */
export interface ITestDetails extends TestDetails {
    workspaceSettings?: WorkspaceSettings;
    additionalWindowProperties?: WindowProperties;
}
