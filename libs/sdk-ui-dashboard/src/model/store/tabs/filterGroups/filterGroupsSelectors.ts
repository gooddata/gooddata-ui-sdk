// (C) 2021-2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import type { IDashboardFilterGroupsConfig } from "@gooddata/sdk-model";

import { type DashboardSelector } from "../../types.js";
import { selectActiveTab } from "../tabsSelectors.js";

/**
 * Returns the filter group config of currently active tab.
 *
 * @alpha
 */
export const selectFilterGroupsConfig: DashboardSelector<IDashboardFilterGroupsConfig | undefined> =
    createSelector(selectActiveTab, (tab) => {
        if (!tab) {
            return undefined;
        }
        return tab.filterGroupsConfig;
    });
