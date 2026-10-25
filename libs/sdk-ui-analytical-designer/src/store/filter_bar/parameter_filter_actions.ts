// (C) 2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type IParameterMetadataObject } from "@gooddata/sdk-model";

import { type IParameterFilter } from "./parameter_filter_types.js";

export enum ParameterFilterActionTypeKeys {
    UI_ADD_PARAMETER_FILTERS = "UI/ADD_PARAMETER_FILTERS",
    UI_UPDATE_PARAMETER_FILTER = "UI/UPDATE_PARAMETER_FILTER",
    STORE_UPDATE_PARAMETER_FILTER = "STORE/UPDATE_PARAMETER_FILTER",
    STORE_ADD_PARAMETER_FILTERS = "STORE/ADD_PARAMETER_FILTERS",
    STORE_REMOVE_PARAMETER_FILTERS = "STORE/REMOVE_PARAMETER_FILTERS",
}

export const addParameterFilters = createAction(
    ParameterFilterActionTypeKeys.UI_ADD_PARAMETER_FILTERS,
    (items: ReadonlyArray<IParameterMetadataObject>) => ({ payload: { items } }),
);

export type IAddParameterFiltersUiAction = ReturnType<typeof addParameterFilters>;

export const updateParameterFilter = createAction(
    ParameterFilterActionTypeKeys.UI_UPDATE_PARAMETER_FILTER,
    (filter: IParameterFilter) => ({ payload: { filter } }),
);

export type IUpdateParameterFilterAction = ReturnType<typeof updateParameterFilter>;

export const storeUpdateParameterFilter = createAction(
    ParameterFilterActionTypeKeys.STORE_UPDATE_PARAMETER_FILTER,
    (filter: IParameterFilter) => ({ payload: { filter } }),
);

export type IStoreUpdateParameterFilterAction = ReturnType<typeof storeUpdateParameterFilter>;

export const addParameterFiltersToState = createAction(
    ParameterFilterActionTypeKeys.STORE_ADD_PARAMETER_FILTERS,
    (items: ReadonlyArray<IParameterFilter>) => ({ payload: { items } }),
);

export type IAddParameterFiltersAction = ReturnType<typeof addParameterFiltersToState>;

export const removeParameterFiltersFromState = createAction(
    ParameterFilterActionTypeKeys.STORE_REMOVE_PARAMETER_FILTERS,
    (localIdentifiers: ReadonlyArray<string>) => ({ payload: { localIdentifiers } }),
);

export type IRemoveParameterFiltersAction = ReturnType<typeof removeParameterFiltersFromState>;

export type ParameterFilterActionType =
    | IAddParameterFiltersUiAction
    | IUpdateParameterFilterAction
    | IStoreUpdateParameterFilterAction
    | IAddParameterFiltersAction
    | IRemoveParameterFiltersAction;
