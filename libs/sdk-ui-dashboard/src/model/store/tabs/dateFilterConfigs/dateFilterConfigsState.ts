// (C) 2023-2026 GoodData Corporation

import { type IDashboardDateFilterConfigItem } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export interface IDateFilterConfigsState {
    /**
     * Dashboard-level overrides of the workspace-level date filter with dimension configs.
     */
    dateFilterConfigs?: IDashboardDateFilterConfigItem[];
}

export const dateFilterConfigsInitialState: IDateFilterConfigsState = {
    dateFilterConfigs: [],
};
