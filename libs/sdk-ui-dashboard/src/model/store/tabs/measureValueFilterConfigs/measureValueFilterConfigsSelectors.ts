// (C) 2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import {
    type DashboardAttributeFilterConfigMode,
    DashboardAttributeFilterConfigModeValues,
    type IDashboardMeasureValueFilterConfig,
} from "@gooddata/sdk-model";

import { selectIsInEditMode } from "../../renderMode/renderModeSelectors.js";
import { type DashboardSelector } from "../../types.js";
import { selectActiveTabLocalIdentifier, selectTabs } from "../tabsSelectors.js";
import { DEFAULT_TAB_ID } from "../tabsState.js";

const selectTabsArray = createSelector(selectTabs, (tabs) => [...(tabs ?? [])]);

/**
 * Returns measure value filter config overrides keyed by tab identifier.
 *
 * @internal
 */
export const selectMeasureValueFilterConfigsOverridesByTab: DashboardSelector<
    Record<string, IDashboardMeasureValueFilterConfig[]>
> = createSelector(selectTabsArray, (tabs) => {
    if (!tabs.length) {
        return {};
    }

    return tabs.reduce<Record<string, IDashboardMeasureValueFilterConfig[]>>((acc, tab) => {
        const identifier = tab.localIdentifier ?? DEFAULT_TAB_ID;
        acc[identifier] = tab.measureValueFilterConfigs?.measureValueFilterConfigs ?? [];
        return acc;
    }, {});
});

/**
 * Returns measure value filter configs for the active tab (or first available tab if no active set).
 *
 * @alpha
 */
export const selectMeasureValueFilterConfigsOverrides: DashboardSelector<
    IDashboardMeasureValueFilterConfig[]
> = createSelector(
    selectMeasureValueFilterConfigsOverridesByTab,
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
 * Map of measure value filter modes (active tab) keyed by filter local identifier.
 *
 * @alpha
 */
export const selectMeasureValueFilterConfigsModeMap: DashboardSelector<
    Map<string, DashboardAttributeFilterConfigMode>
> = createSelector(selectMeasureValueFilterConfigsOverrides, (configs) => {
    return configs.reduce((map, config) => {
        map.set(config.localIdentifier, config.mode ?? DashboardAttributeFilterConfigModeValues.ACTIVE);
        return map;
    }, new Map());
});

/**
 * Map of effective measure value filter modes — always ACTIVE in edit mode; otherwise the configured mode.
 *
 * @alpha
 */
export const selectEffectiveMeasureValueFiltersModeMap: DashboardSelector<
    Map<string, DashboardAttributeFilterConfigMode>
> = createSelector(selectIsInEditMode, selectMeasureValueFilterConfigsOverrides, (isInEditMode, configs) => {
    return configs.reduce((map, config) => {
        const mode =
            isInEditMode || !config.mode ? DashboardAttributeFilterConfigModeValues.ACTIVE : config.mode;
        map.set(config.localIdentifier, mode);
        return map;
    }, new Map());
});

/**
 * Map of measure value filter modes keyed by tab identifier (each value is a per-filter mode map).
 *
 * @internal
 */
export const selectMeasureValueFilterConfigsModeMapByTab: DashboardSelector<
    Record<string, Map<string, DashboardAttributeFilterConfigMode>>
> = createSelector(selectMeasureValueFilterConfigsOverridesByTab, (overridesByTab) => {
    const result: Record<string, Map<string, DashboardAttributeFilterConfigMode>> = {};

    for (const [tabId, configs] of Object.entries(overridesByTab)) {
        result[tabId] = configs.reduce((map, config) => {
            map.set(config.localIdentifier, config.mode ?? DashboardAttributeFilterConfigModeValues.ACTIVE);
            return map;
        }, new Map<string, DashboardAttributeFilterConfigMode>());
    }

    return result;
});
