// (C) 2021 GoodData Corporation

import { IDashboardDateFilterConfig, IDateFilterConfig } from "@gooddata/sdk-backend-spi";

/**
 * @alpha
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
}

export const dateFilterConfigInitialState: DateFilterConfigState = {
    dateFilterConfig: undefined,
    effectiveDateFilterConfig: undefined,
    isUsingDashboardOverrides: undefined,
};
