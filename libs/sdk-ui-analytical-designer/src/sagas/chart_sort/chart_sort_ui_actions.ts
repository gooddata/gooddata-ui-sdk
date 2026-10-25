// (C) 2022-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type ISortItem } from "@gooddata/sdk-model";
import { type ISortConfig } from "@gooddata/sdk-ui-ext/internal";

export enum ChartSortUiActionTypeKeys {
    UI_UPDATE_CHART_SORT_CONFIG = "UI/UPDATE_CHART_SORT_CONFIG",
    UI_UPDATE_APPLIED_CHART_SORT = "UI/UPDATE_APPLIED_CHART_SORT",
}

export const updateChartSortConfig = createAction(
    ChartSortUiActionTypeKeys.UI_UPDATE_CHART_SORT_CONFIG,
    (sortConfig: ISortConfig) => ({ payload: { sortConfig } }),
);

export type IUpdateChartSortConfigUiAction = ReturnType<typeof updateChartSortConfig>;

export const updateAppliedChartSort = createAction(
    ChartSortUiActionTypeKeys.UI_UPDATE_APPLIED_CHART_SORT,
    (appliedSort: ISortItem[]) => ({ payload: { appliedSort } }),
);

export type IUpdateAppliedChartSortUiAction = ReturnType<typeof updateAppliedChartSort>;
