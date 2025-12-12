// (C) 2023-2025 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import {
    type DashboardDateFilterConfigMode,
    DashboardDateFilterConfigModeValues,
    type IDashboardDateFilterConfigItem,
    serializeObjRef,
} from "@gooddata/sdk-model";

import { selectIsInEditMode } from "../../renderMode/renderModeSelectors.js";
import { type DashboardSelector } from "../../types.js";
import { DEFAULT_TAB_ID, selectActiveTabLocalIdentifier, selectTabs } from "../index.js";

const selectTabsArray = createSelector(selectTabs, (tabs) => [...(tabs ?? [])]);

/**
 * Returns date filter configs keyed by tab identifier.
 *
 * @internal
 */
export const selectDateFilterConfigsOverridesByTab: DashboardSelector<
    Record<string, IDashboardDateFilterConfigItem[]>
> = createSelector(selectTabsArray, (tabs) => {
    if (!tabs.length) {
        return {};
    }

    return tabs.reduce<Record<string, IDashboardDateFilterConfigItem[]>>((acc, tab) => {
        const identifier = tab.localIdentifier ?? DEFAULT_TAB_ID;
        acc[identifier] = tab.dateFilterConfigs?.dateFilterConfigs ?? [];
        return acc;
    }, {});
});

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
    createSelector(
        selectDateFilterConfigsOverridesByTab,
        selectActiveTabLocalIdentifier,
        (overridesByTab, activeTabId) => {
            if (!overridesByTab || Object.keys(overridesByTab).length === 0) {
                return [];
            }

            const resolvedActiveTabId = activeTabId ?? Object.keys(overridesByTab)[0];

            return overridesByTab[resolvedActiveTabId] ?? [];
        },
    );

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

/**
 * Get a map of date filter modes keyed by tab identifier.
 *
 * @remarks
 * Returns a record where each key is a tab identifier and the value is a Map of date filter modes
 * for that tab. Useful when you need to access filter modes for all tabs at once.
 *
 * @internal
 */
export const selectDateFilterConfigsModeMapByTab: DashboardSelector<
    Record<string, Map<string, DashboardDateFilterConfigMode>>
> = createSelector(selectDateFilterConfigsOverridesByTab, (overridesByTab) => {
    const result: Record<string, Map<string, DashboardDateFilterConfigMode>> = {};

    for (const [tabId, configs] of Object.entries(overridesByTab)) {
        result[tabId] = configs.reduce((map, config) => {
            map.set(serializeObjRef(config.dateDataSet), config.config.mode);
            return map;
        }, new Map<string, DashboardDateFilterConfigMode>());
    }

    return result;
});
