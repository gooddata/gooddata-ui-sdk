// (C) 2019-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type FilterType } from "../../store/filter_bar/filter_bar_types.js";
import { type ICacheItem, type ICatalogEntry } from "../../typings/state_objects.js";

import { type IItemsState } from "./types.js";

export enum FilterBarUiActionTypeKeys {
    UI_UPDATE_FILTERS = "UI/UPDATE_FILTERS",
    UI_ADD_FILTER = "UI/ADD_FILTER",
    UI_ADD_RANKING_FILTER_FROM_METRIC = "UI/ADD_RANKING_FILTER_FROM_METRIC",
    UI_REMOVE_FILTER = "UI/REMOVE_FILTER",
    UI_SET_MULTILINE_FILTER_BAR = "UI/SET_MULTILINE_FILTER_BAR",
}

export const updateFilters = createAction(
    FilterBarUiActionTypeKeys.UI_UPDATE_FILTERS,
    (itemsState: IItemsState, rankingFilterState: boolean) => ({
        payload: { itemsState, rankingFilterState },
    }),
);

export type IUpdateFiltersAction = ReturnType<typeof updateFilters>;

export const addFilter = createAction(
    FilterBarUiActionTypeKeys.UI_ADD_FILTER,
    // ICatalogEntry, not ICacheItem: the drop path hands over the loose catalog currency.
    // `autoOpen` marks a gesture that added this ONE filter, whose picker then opens right away.
    (catalogItem: ICatalogEntry, bucketItemLocalIdentifier?: string, autoOpen?: boolean) => ({
        payload: { catalogItem, bucketItemLocalIdentifier, autoOpen },
    }),
);

export type IAddFilterAction = ReturnType<typeof addFilter>;

export const addRankingFilterFromMetric = createAction(
    FilterBarUiActionTypeKeys.UI_ADD_RANKING_FILTER_FROM_METRIC,
    (catalogItem: ICacheItem, bucketItemLocalIdentifier?: string) => ({
        payload: { catalogItem, bucketItemLocalIdentifier },
    }),
);

export type IAddRankingFilterFromMetricAction = ReturnType<typeof addRankingFilterFromMetric>;

export const removeFilter = createAction(
    FilterBarUiActionTypeKeys.UI_REMOVE_FILTER,
    (itemLocalIdentifier: string, itemType: FilterType) => ({
        payload: { itemLocalIdentifier, itemType },
    }),
);

export type IRemoveFilterAction = ReturnType<typeof removeFilter>;

export const setMultilineFilterBar = createAction(
    FilterBarUiActionTypeKeys.UI_SET_MULTILINE_FILTER_BAR,
    (isMultiLine: boolean) => ({ payload: { isMultiLine } }),
);

export type ISetMultilineFilterBarAction = ReturnType<typeof setMultilineFilterBar>;
