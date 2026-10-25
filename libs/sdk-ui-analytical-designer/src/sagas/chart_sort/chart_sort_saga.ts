// (C) 2022-2026 GoodData Corporation

import { put, takeEvery } from "redux-saga/effects";

import { storeAppliedChartSort, storeChartSortConfig } from "../../store/chart_sort/chart_sort_actions.js";

import {
    ChartSortUiActionTypeKeys,
    type IUpdateAppliedChartSortUiAction,
    type IUpdateChartSortConfigUiAction,
} from "./chart_sort_ui_actions.js";

function* chartSortConfigChanged(action: IUpdateChartSortConfigUiAction) {
    const newSortConfig = action.payload.sortConfig;

    yield put(storeChartSortConfig(newSortConfig));

    if (newSortConfig.appliedSort) {
        yield put(storeAppliedChartSort(newSortConfig.appliedSort));
    }
}

function* appliedChartSortChanged(action: IUpdateAppliedChartSortUiAction) {
    yield put(storeAppliedChartSort(action.payload.appliedSort));
}

export function* watchChartSort() {
    yield takeEvery(ChartSortUiActionTypeKeys.UI_UPDATE_CHART_SORT_CONFIG, chartSortConfigChanged);
    yield takeEvery(ChartSortUiActionTypeKeys.UI_UPDATE_APPLIED_CHART_SORT, appliedChartSortChanged);
}
