// (C) 2022-2026 GoodData Corporation

import { createSelector } from "reselect";

import { type IAppState } from "../types.js";

import { type IChartSortState } from "./chart_sort_state.js";

const getChartSortState = (state: IAppState): IChartSortState => state.data.chartSort;

export const getSortConfig = createSelector(getChartSortState, (chartSortState) => chartSortState.sortConfig);

export const getAppliedSort = createSelector(
    getChartSortState,
    (chartSortState) => chartSortState.appliedSort,
);
