// (C) 2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { DashboardState } from "../dashboardStore";
import invariant from "ts-invariant";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.config,
);

/**
 * Returns dashboard's filter context. It is expected that the selector is called only after the filter
 * context state is correctly initialized. Invocations before initialization lead to invariant errors.
 *
 * @internal
 */
export const selectConfig = createSelector(selectSelf, (configState) => {
    invariant(configState.config, "attempting to access uninitialized filter context state");

    return configState.config!;
});

/**
 * Returns workspace-level configuration for the of the date filter options and presets.
 *
 * Note: this configuration SHOULD be further augmented by the dashboard-level overrides to obtain
 * the effective date filter configuration.
 */
export const selectDateFilterConfig = createSelector(selectConfig, (state) => {
    return state.dateFilterConfig;
});

/**
 * Returns settings that are in effect for the current dashboard.
 *
 * @internal
 */
export const selectSettings = createSelector(selectConfig, (state) => {
    return state.settings;
});

/**
 * Returns locale to use for internationalization of the dashboard.
 *
 * @internal
 */
export const selectLocale = createSelector(selectConfig, (state) => {
    return state.locale;
});

/**
 * Returns number separators to use when rendering numeric values on charts or KPIs.
 *
 * @internal
 */
export const selectSeparators = createSelector(selectConfig, (state) => {
    return state.separators;
});

/**
 * Returns the color palette for dashboard charts.
 *
 * @internal
 */
export const selectColorPalette = createSelector(selectConfig, (state) => {
    return state.colorPalette;
});
