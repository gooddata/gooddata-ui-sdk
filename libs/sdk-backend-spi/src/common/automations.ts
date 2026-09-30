// (C) 2024-2026 GoodData Corporation

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

    /**
     * Specify if referenced objects should be checked for access, so restricted ones appear in `unavailable`.
     *
     * @remarks
     * Currently covers visualizations. Defaults to false.
     */
    includeUnavailableReferences?: boolean;
}
