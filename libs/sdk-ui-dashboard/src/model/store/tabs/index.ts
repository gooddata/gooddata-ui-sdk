// (C) 2025 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";

import { attributeFilterConfigsReducers } from "./attributeFilterConfigs/attributeFilterConfigsReducers.js";
import { dateFilterConfigReducers } from "./dateFilterConfig/dateFilterConfigReducers.js";
import { dateFilterConfigsReducers } from "./dateFilterConfigs/dateFilterConfigsReducers.js";
import { filterContextReducers } from "./filterContext/filterContextReducers.js";
import { layoutReducers } from "./layout/layoutReducers.js";
import { tabsReducers } from "./tabsReducers.js";
import { tabsInitialState } from "./tabsState.js";

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
} from "./filterContext/filterContextReducers.js";
export type { TabsReducer } from "./tabsReducers.js";
export {
    selectTabs,
    selectActiveTabId,
    selectActiveTab,
    selectTabById,
    selectHasTabs,
    selectTabsState,
} from "./tabsSelectors.js";
export type {
    TabsState,
    TabState,
    FilterContextState,
    DateFilterConfigState,
    LayoutState,
} from "./tabsState.js";

export type {
    WorkingDashboardAttributeFilter,
    WorkingFilterContextItem,
    IWorkingFilterContextDefinition,
} from "./filterContext/filterContextState.js";
export { DEFAULT_TAB_ID } from "./tabsState.js";
