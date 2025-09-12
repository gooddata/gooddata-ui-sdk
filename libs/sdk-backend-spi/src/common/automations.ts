// (C) 2024-2025 GoodData Corporation

/**
 * Type of automation supported across workspaces and organizations.
 *
 * @alpha
 */
export type AutomationType = "schedule" | "trigger" | "alert";

/**
 * Type of automation filter behavior
 * @alpha
 */
export type AutomationFilterType = "exact" | "include" | "exclude";

/**
 * Configuration options for loading automation metadata objects with query.
 *
 * @alpha
 */
export interface IGetAutomationsQueryOptions {
    /**
     * Specify if automationResult should be included in the response.
     *
     * @remarks
     * Defaults to false.
     */
    includeAutomationResult?: boolean;
}
