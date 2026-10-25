// (C) 2007-2026 GoodData Corporation

import { put, select } from "redux-saga/effects";

import { datasetChanged } from "../actions/data_actions.js";
import { datasetParamChanged, getDataSet } from "../selectors/route_selector.js";

export function* updateSelectedDataset(preselect = false) {
    const isDatasetParamChanged: ReturnType<typeof datasetParamChanged> = yield select(datasetParamChanged);
    const dataset: ReturnType<typeof getDataSet> = yield select(getDataSet);

    if (isDatasetParamChanged) {
        yield put(datasetChanged(dataset, preselect));
        return true;
    }

    return false;
}
