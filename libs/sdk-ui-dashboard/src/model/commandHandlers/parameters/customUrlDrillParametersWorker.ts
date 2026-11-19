// (C) 2026 GoodData Corporation

import { type Action } from "@reduxjs/toolkit";
import { type SagaIterator } from "redux-saga";
import { call, select, takeLatest } from "redux-saga/effects";

import { isInsightWidget } from "@gooddata/sdk-model";

import { unbatched } from "../../store/_infra/unbatched.js";
import { insightsActions } from "../../store/insights/index.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectAllAnalyticalWidgets } from "../../store/tabs/layout/layoutSelectors.js";
import { validateDrillToCustomUrlParams } from "../common/validateDrillToCustomUrlParams.js";

export function newCustomUrlDrillParametersWorker() {
    return function* customUrlDrillParametersWorker(): SagaIterator<void> {
        yield takeLatest(requiresCustomUrlDrillValidation, revalidateCustomUrlDrills);
    };
}

function requiresCustomUrlDrillValidation(action: Action): boolean {
    return unbatched(action).some(isValidationTrigger);
}

function isValidationTrigger(action: Action): boolean {
    return (
        tabsActions.addParameter.match(action) ||
        tabsActions.removeParameter.match(action) ||
        tabsActions.undoLayout.match(action) ||
        insightsActions.upsertInsight.match(action)
    );
}

function* revalidateCustomUrlDrills(): SagaIterator<void> {
    const widgets: ReturnType<typeof selectAllAnalyticalWidgets> = yield select(selectAllAnalyticalWidgets);
    yield call(validateDrillToCustomUrlParams, widgets.filter(isInsightWidget));
}
