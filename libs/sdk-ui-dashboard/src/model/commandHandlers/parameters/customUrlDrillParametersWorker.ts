// (C) 2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, select, takeLatest } from "redux-saga/effects";

import { isInsightWidget } from "@gooddata/sdk-model";

import { tabsActions } from "../../store/tabs/index.js";
import { selectAllAnalyticalWidgets } from "../../store/tabs/layout/layoutSelectors.js";
import { validateDrillToCustomUrlParams } from "../common/validateDrillToCustomUrlParams.js";

export function newCustomUrlDrillParametersWorker() {
    return function* customUrlDrillParametersWorker(): SagaIterator<void> {
        yield takeLatest(
            [tabsActions.addParameter.type, tabsActions.removeParameter.type],
            revalidateCustomUrlDrills,
        );
    };
}

function* revalidateCustomUrlDrills(): SagaIterator<void> {
    const widgets: ReturnType<typeof selectAllAnalyticalWidgets> = yield select(selectAllAnalyticalWidgets);
    yield call(validateDrillToCustomUrlParams, widgets.filter(isInsightWidget));
}
