// (C) 2023-2025 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";

import { DashboardSelector, DashboardState } from "../types.js";
import {
    DashboardDateFilterConfigMode,
    DashboardDateFilterConfigModeValues,
    IDashboardDateFilterConfigItem,
    serializeObjRef,
} from "@gooddata/sdk-model";
import { selectIsInEditMode } from "../renderMode/renderModeSelectors.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.dateFilterConfigs,
);

/**
 * Returns date filter configs that is specified on the loaded dashboard.
 *
 * The dashboard-level date filter configuration MAY contain overrides and additional configuration to apply
 * on top of the workspace-level date filter config. If the dashboard-level overrides are not specified, then
 * the workspace-level config should be taken as-is.
 *
 * @alpha
 */
export const selectDateFilterConfigsOverrides: DashboardSelector<IDashboardDateFilterConfigItem[]> =
    createSelector(selectSelf, (dateFilterConfigsState) => {
        return dateFilterConfigsState?.dateFilterConfigs ?? [];
    });

/**
 * Get a map of date filter modes directly from dashboard date filter configurations.
 *
 * @alpha
 */
export const selectDateFilterConfigsModeMap: DashboardSelector<Map<string, DashboardDateFilterConfigMode>> =
    createSelector(selectDateFilterConfigsOverrides, (dateFilterConfigs) => {
        return dateFilterConfigs.reduce((map, config) => {
            map.set(serializeObjRef(config.dateDataSet), config.config.mode);
            return map;
        }, new Map());
    });

/**
 * Get a map of date filter modes based on the current screen mode (edit or view).
 *
 * @remarks
 * The mode will always be active in edit mode; otherwise, the mode is taken from the dashboard date filter.
 *
 * @alpha
 */
export const selectEffectiveDateFiltersModeMap: DashboardSelector<
    Map<string, DashboardDateFilterConfigMode>
> = createSelector(
    selectIsInEditMode,
    selectDateFilterConfigsOverrides,
    (isInEditMode, dateFilterConfigs) => {
        return dateFilterConfigs.reduce((map, config) => {
            const mode =
                isInEditMode || !config.config.mode
                    ? DashboardDateFilterConfigModeValues.ACTIVE
                    : config.config.mode;
            map.set(serializeObjRef(config.dateDataSet), mode);
            return map;
        }, new Map());
    },
);
