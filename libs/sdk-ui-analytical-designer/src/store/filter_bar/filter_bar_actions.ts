// (C) 2019-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type IAttributeFilterConfigs } from "@gooddata/sdk-model";

import { type IFilter } from "./filter_bar_types.js";

export type FilterBarActionType =
    | IAddFiltersToStateAction
    | IRemoveFiltersFromStateAction
    | IFiltersWereChangedAction
    | ISetMultilineFilterBarAction
    | IStoreMigratedAdditionalFiltersAction
    | IStoreToggleFilterDropdown
    | IUpdateAttributeFilterConfigsInStateAction;

export enum FilterBarActionTypeKeys {
    STORE_ADD_FILTERS_TO_STATE = "STORE/ADD_FILTERS_TO_STATE",
    STORE_REMOVE_FILTERS_FROM_STATE = "STORE/REMOVE_FILTERS_FROM_STATE",
    STORE_SET_MULTILINE_FILTER_BAR = "STORE/SET_MULTILINE_FILTER_BAR",
    SAGA_FILTERS_WERE_CHANGED = "SAGA/FILTERS_WERE_CHANGED",
    STORE_MIGRATED_ADDITIONAL_FILTERS = "STORE/MIGRATED_ADDITIONAL_FILTERS",
    STORE_ADDITIONAL_DATE_ATTRIBUTE_FILTERS_RESET = "STORE/ADDITIONAL_DATE_ATTRIBUTE_FILTERS_RESET",
    STORE_TOGGLE_FILTER_DROPDOWN = "STORE/TOGGLE_FILTER_DROPDOWN",
    STORE_OPEN_FILTER_DROPDOWN = "STORE/OPEN_FILTER_DROPDOWN",
    STORE_CLOSE_FILTER_DROPDOWN = "STORE/CLOSE_FILTER_DROPDOWN",
    STORE_UPDATE_ATTRIBUTE_FILTER_CONFIGS_IN_STATE = "STORE/UPDATE_ATTRIBUTE_FILTER_CONFIGS_IN_STATE",
    STORE_FILTER_BAR_AUTO_OPEN = "STORE/FILTER_BAR_AUTO_OPEN",
}

export const addFiltersToState = createAction(
    FilterBarActionTypeKeys.STORE_ADD_FILTERS_TO_STATE,
    (items: ReadonlyArray<IFilter>, isFromFilterBarDropdown: boolean) => ({
        payload: { items, isFromFilterBarDropdown },
    }),
);

export type IAddFiltersToStateAction = ReturnType<typeof addFiltersToState>;

export const removeFiltersFromState = createAction(
    FilterBarActionTypeKeys.STORE_REMOVE_FILTERS_FROM_STATE,
    (localIdentifiers: ReadonlyArray<string>, isFromFilterBarDropdown: boolean) => ({
        payload: { localIdentifiers, isFromFilterBarDropdown },
    }),
);

export type IRemoveFiltersFromStateAction = ReturnType<typeof removeFiltersFromState>;

export const filtersWereChanged = createAction(
    FilterBarActionTypeKeys.SAGA_FILTERS_WERE_CHANGED,
    (addedFilters: ReadonlyArray<IFilter>, removedFilters: ReadonlyArray<IFilter>) => ({
        payload: { addedFilters, removedFilters },
    }),
);

export type IFiltersWereChangedAction = ReturnType<typeof filtersWereChanged>;

export const setMultilineFilterBar = createAction(
    FilterBarActionTypeKeys.STORE_SET_MULTILINE_FILTER_BAR,
    (isMultiLine: boolean) => ({ payload: { isMultiLine } }),
);

export type ISetMultilineFilterBarAction = ReturnType<typeof setMultilineFilterBar>;

export const setMigratedAdditionalFilters = createAction(
    FilterBarActionTypeKeys.STORE_MIGRATED_ADDITIONAL_FILTERS,
    (filterLocalIdentifiers: string[]) => ({ payload: { filterLocalIdentifiers } }),
);

export type IStoreMigratedAdditionalFiltersAction = ReturnType<typeof setMigratedAdditionalFilters>;

export const toggleFilterDropdown = createAction(FilterBarActionTypeKeys.STORE_TOGGLE_FILTER_DROPDOWN);

export const openFilterDropdown = createAction(FilterBarActionTypeKeys.STORE_OPEN_FILTER_DROPDOWN);

export const closeFilterDropdown = createAction(FilterBarActionTypeKeys.STORE_CLOSE_FILTER_DROPDOWN);

/** The three dropdown gestures share one reducer case group; one creator per type string. */
export type IStoreToggleFilterDropdown =
    | ReturnType<typeof toggleFilterDropdown>
    | ReturnType<typeof openFilterDropdown>
    | ReturnType<typeof closeFilterDropdown>;

export const updateAttributeFilterConfigsInState = createAction(
    FilterBarActionTypeKeys.STORE_UPDATE_ATTRIBUTE_FILTER_CONFIGS_IN_STATE,
    (attributeFilterConfigs: IAttributeFilterConfigs) => ({ payload: { attributeFilterConfigs } }),
);

export type IUpdateAttributeFilterConfigsInStateAction = ReturnType<
    typeof updateAttributeFilterConfigsInState
>;

/**
 * Hands the filter the user just added over to the filter bar, which opens its picker and clears the
 * hand-over (null) as soon as the filter's item has taken it. Every filter kind goes through it, the
 * ranking filter included. Written to the non-undoable `filterBarAutoOpen` root leaf
 * (store/filter_bar_auto_open), not to the filter bar state.
 */
export const storeFilterBarAutoOpen = createAction(
    FilterBarActionTypeKeys.STORE_FILTER_BAR_AUTO_OPEN,
    (filterLocalIdentifier: string | null) => ({ payload: { filterLocalIdentifier } }),
);
