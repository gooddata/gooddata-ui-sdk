// (C) 2026 GoodData Corporation

import { type IDashboardMeasureValueFilterConfig } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export interface IMeasureValueFilterConfigsState {
    /**
     * Dashboard-level overrides of the measure value filter configs (e.g. visibility/lock mode).
     */
    measureValueFilterConfigs?: IDashboardMeasureValueFilterConfig[];
}

export const measureValueFilterConfigsInitialState: IMeasureValueFilterConfigsState = {
    measureValueFilterConfigs: [],
};
