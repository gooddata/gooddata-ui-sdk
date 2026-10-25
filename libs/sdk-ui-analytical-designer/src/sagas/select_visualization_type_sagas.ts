// (C) 2020-2026 GoodData Corporation

import { put, takeEvery } from "redux-saga/effects";

import { ActionTypeKeys } from "../constants/actions.js";
import { storeAppliedChartSort, storeChartSortConfig } from "../store/chart_sort/chart_sort_actions.js";

export function* onVisualizationTypeSelected() {
    yield put(
        storeChartSortConfig({
            supported: false,
            disabled: true,
            defaultSort: [],
            availableSorts: [],
        }),
    );
    yield put(storeAppliedChartSort([]));
}

export function* watchSelectVisualizationType() {
    yield takeEvery(ActionTypeKeys.BUCKETS_SELECT_VISUALIZATION_TYPE, onVisualizationTypeSelected);
}
