// (C) 2023-2025 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";

import { DashboardSelector, DashboardState } from "../types.js";
import {
    DashboardAttributeFilterConfigMode,
    DashboardAttributeFilterConfigModeValues,
    IDashboardAttributeFilterConfig,
    ObjRef,
} from "@gooddata/sdk-model";
import { selectIsInEditMode } from "../renderMode/renderModeSelectors.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.attributeFilterConfigs,
);

/**
 * Returns attribute filter configs that is specified on the loaded dashboard.
 *
 * The dashboard-level attribute filter configuration MAY contain overrides and additional configuration to apply
 * on top of the workspace-level attribute filter config. If the dashboard-level overrides are not specified, then
 * the workspace-level config should be taken as-is.
 *
 * @alpha
 */
export const selectAttributeFilterConfigsOverrides: DashboardSelector<IDashboardAttributeFilterConfig[]> =
    createSelector(selectSelf, (attributeFilterConfigsState) => {
        return attributeFilterConfigsState?.attributeFilterConfigs ?? [];
    });

/**
 * Get a map of attribute filter modes directly from dashboard attribute filter configurations.
 *
 * @alpha
 */
export const selectAttributeFilterConfigsModeMap: DashboardSelector<
    Map<string, DashboardAttributeFilterConfigMode>
> = createSelector(selectAttributeFilterConfigsOverrides, (attributeFilterConfigs) => {
    return attributeFilterConfigs.reduce((map, config) => {
        map.set(config.localIdentifier, config.mode ?? DashboardAttributeFilterConfigModeValues.ACTIVE);
        return map;
    }, new Map());
});

/**
 * Get a map of attribute filter modes based on the current screen mode (edit or view).
 *
 * @remarks
 * The mode will always be active in edit mode; otherwise, the mode is taken from the dashboard attribute filter.
 *
 * @alpha
 */
export const selectEffectiveAttributeFiltersModeMap: DashboardSelector<
    Map<string, DashboardAttributeFilterConfigMode>
> = createSelector(
    selectIsInEditMode,
    selectAttributeFilterConfigsOverrides,
    (isInEditMode, attributeFilterConfigs) => {
        return attributeFilterConfigs.reduce((map, config) => {
            const mode =
                isInEditMode || !config.mode ? DashboardAttributeFilterConfigModeValues.ACTIVE : config.mode;
            map.set(config.localIdentifier, mode);
            return map;
        }, new Map());
    },
);

/**
 * Get a map of attribute filter displayAsLabels
 *
 * @alpha
 */
export const selectAttributeFilterConfigsDisplayAsLabelMap: DashboardSelector<Map<string, ObjRef>> =
    createSelector(selectAttributeFilterConfigsOverrides, (attributeFilterConfigs) => {
        return attributeFilterConfigs.reduce((map, config) => {
            map.set(config.localIdentifier, config.displayAsLabel);
            return map;
        }, new Map());
    });
