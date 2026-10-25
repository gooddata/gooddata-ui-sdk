// (C) 2022-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type ISortItem } from "@gooddata/sdk-model";
import { type ISortConfig } from "@gooddata/sdk-ui-ext/internal";

export type ChartSortStoreActionType = IStoreChartSortConfigStoreAction | IStoreAppliedChartSortStoreAction;

export enum ChartSortStoreActionTypeKeys {
    STORE_UPDATE_CHART_SORT_CONFIG = "STORE/UPDATE_CHART_SORT_CONFIG",
    STORE_UPDATE_APPLIED_CHART_SORT = "STORE/UPDATE_APPLIED_CHART_SORT",
}

export const storeChartSortConfig = createAction(
    ChartSortStoreActionTypeKeys.STORE_UPDATE_CHART_SORT_CONFIG,
    (sortConfig: ISortConfig) => ({ payload: { sortConfig } }),
);

export type IStoreChartSortConfigStoreAction = ReturnType<typeof storeChartSortConfig>;

export const storeAppliedChartSort = createAction(
    ChartSortStoreActionTypeKeys.STORE_UPDATE_APPLIED_CHART_SORT,
    (appliedSort: ISortItem[]) => ({ payload: { appliedSort } }),
);

export type IStoreAppliedChartSortStoreAction = ReturnType<typeof storeAppliedChartSort>;
