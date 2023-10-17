// (C) 2023 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";

import { DashboardSelector, DashboardState } from "../types.js";
import { IDashboardAttributeFilterConfig } from "@gooddata/sdk-model";

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
