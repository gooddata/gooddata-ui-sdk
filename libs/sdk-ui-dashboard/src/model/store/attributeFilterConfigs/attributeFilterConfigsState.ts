// (C) 2023 GoodData Corporation
import { IDashboardAttributeFilterConfig } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export interface AttributeFilterConfigsState {
    /**
     * Dashboard-level overrides of the workspace-level attribute filter configs.
     */
    attributeFilterConfigs?: IDashboardAttributeFilterConfig[];
}

export const attributeFilterConfigsInitialState: AttributeFilterConfigsState = {
    attributeFilterConfigs: [],
};
