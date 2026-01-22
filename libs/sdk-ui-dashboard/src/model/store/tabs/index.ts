// (C) 2025-2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";

import { attributeFilterConfigsReducers } from "./attributeFilterConfigs/attributeFilterConfigsReducers.js";
import { dateFilterConfigReducers } from "./dateFilterConfig/dateFilterConfigReducers.js";
import { dateFilterConfigsReducers } from "./dateFilterConfigs/dateFilterConfigsReducers.js";
import {
    type IAddAttributeFilterDisplayFormPayload,
    type IAddAttributeFilterPayload,
    type IApplyWorkingSelectionPayload,
    type IChangeAttributeDisplayFormPayload,
    type IChangeAttributeLimitingItemsPayload,
    type IChangeAttributeSelectionModePayload,
    type IChangeAttributeTitlePayload,
    type IClearAttributeFiltersSelectionPayload,
    type IMoveAttributeFilterPayload,
    type IMoveDateFilterPayload,
    type IRemoveAttributeFilterPayload,
    type IRemoveDateFilterPayload,
    type ISetAttributeFilterDependentDateFiltersPayload,
    type ISetAttributeFilterParentsPayload,
    type IUpdateAttributeFilterSelectionPayload,
    type IUpsertDateFilterAllTimePayload,
    type IUpsertDateFilterNonAllTimePayload,
    type IUpsertDateFilterPayload,
    filterContextReducers,
} from "./filterContext/filterContextReducers.js";
import { layoutReducers } from "./layout/layoutReducers.js";
import { type TabsReducer, tabsReducers } from "./tabsReducers.js";
import {
    DEFAULT_TAB_ID,
    type FilterContextState,
    type IDateFilterConfigState,
    type ILayoutState,
    type ITabState,
    type ITabsState,
    tabsInitialState,
} from "./tabsState.js";

const allReducers = {
    ...tabsReducers,
    ...attributeFilterConfigsReducers,
    ...dateFilterConfigsReducers,
    ...dateFilterConfigReducers,
    ...filterContextReducers,
    ...layoutReducers,
} as const;

const tabsSlice = createSlice({
    name: "tabs",
    initialState: tabsInitialState,
    reducers: allReducers,
});

export const tabsSliceReducer = tabsSlice.reducer;

/**
 * @internal
 */
export const tabsActions = tabsSlice.actions;

export type {
    IAddAttributeFilterPayload,
    IRemoveAttributeFilterPayload,
    ISetAttributeFilterDependentDateFiltersPayload,
    ISetAttributeFilterParentsPayload,
    IMoveAttributeFilterPayload,
    IRemoveDateFilterPayload,
    IMoveDateFilterPayload,
    IUpdateAttributeFilterSelectionPayload,
    IClearAttributeFiltersSelectionPayload,
    IUpsertDateFilterPayload,
    IUpsertDateFilterAllTimePayload,
    IUpsertDateFilterNonAllTimePayload,
    IChangeAttributeDisplayFormPayload,
    IChangeAttributeTitlePayload,
    IChangeAttributeSelectionModePayload,
    IChangeAttributeLimitingItemsPayload,
    IApplyWorkingSelectionPayload,
    IAddAttributeFilterDisplayFormPayload,
};
export type { TabsReducer };
export {
    selectTabs,
    selectActiveTabLocalIdentifier,
    selectActiveOrDefaultTabLocalIdentifier,
    selectActiveTab,
    selectTabById,
    selectHasTabs,
    selectTabsState,
    selectFirstTabLocalIdentifier,
} from "./tabsSelectors.js";
export {
    type ITabsState,
    type ITabState,
    type FilterContextState,
    type IDateFilterConfigState,
    type ILayoutState,
    DEFAULT_TAB_ID,
};

export type {
    WorkingDashboardAttributeFilter,
    WorkingFilterContextItem,
    IWorkingFilterContextDefinition,
} from "./filterContext/filterContextState.js";

export { selectFilterGroupsConfig } from "./filterGroups/filterGroupsSelectors.js";
