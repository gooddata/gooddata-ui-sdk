// (C) 2023 GoodData Corporation
import { IDashboardDateFilterConfigItem } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export interface DateFilterConfigsState {
    /**
     * Dashboard-level overrides of the workspace-level date filter with dimension configs.
     */
    dateFilterConfigs?: IDashboardDateFilterConfigItem[];
}

export const dateFilterConfigsInitialState: DateFilterConfigsState = {
    dateFilterConfigs: [],
};
