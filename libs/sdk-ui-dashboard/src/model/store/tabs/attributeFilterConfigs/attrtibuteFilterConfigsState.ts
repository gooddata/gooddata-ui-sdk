// (C) 2023-2026 GoodData Corporation

import { type IDashboardAttributeFilterConfig } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export interface IAttributeFilterConfigsState {
    /**
     * Dashboard-level overrides of the workspace-level attribute filter configs.
     */
    attributeFilterConfigs?: IDashboardAttributeFilterConfig[];
}

export const attributeFilterConfigsInitialState: IAttributeFilterConfigsState = {
    attributeFilterConfigs: [],
};
