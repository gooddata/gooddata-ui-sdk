// (C) 2021-2023 GoodData Corporation

import { IDateFilterConfig, IDashboardDateFilterConfig } from "@gooddata/sdk-model";
import { DateFilterValidationResult } from "../../../types.js";

/**
 * @beta
 */
export interface DateFilterConfigState {
    /**
     * Dashboard-level overrides of the workspace-level date filter config.
     */
    dateFilterConfig?: IDashboardDateFilterConfig;

    /**
     * The effective date filter config to use for the dashboard. This is obtained by merging the
     * workspace-level config with the dashboard-level overrides. If the merged result is valid, then it
     * is used for effective config. If the merged result is invalid, then the workspace-level config is used as
     * fallback.
     */
    effectiveDateFilterConfig?: IDateFilterConfig;

    /**
     * Indicates whether the effectiveDateFilterConfig is actually reflecting the dashboard-level config
     * overrides or it is just fallback to the workspace-level config.
     *
     * This is only true if the dashboard-level overrides are present AND their merge with workspace-level config
     * resulted in valid config.
     */
    isUsingDashboardOverrides?: boolean;

    /**
     * Warnings result of the date filter validation if any.
     *
     * @remarks
     * When loading a date filter configuration, it can have some issues that we surface (e.g. having zero visible items).
     * These are not blocking though, if any issue is encountered, the config falls back to something sane.
     * The reason for storing this here is mainly for us to be able to show a warning when some issues are detected.
     */
    dateFilterConfigValidationWarnings?: DateFilterValidationResult[];
}

export const dateFilterConfigInitialState: DateFilterConfigState = {
    dateFilterConfig: undefined,
    effectiveDateFilterConfig: undefined,
    isUsingDashboardOverrides: undefined,
    dateFilterConfigValidationWarnings: undefined,
};
