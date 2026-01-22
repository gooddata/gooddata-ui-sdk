// (C) 2022-2026 GoodData Corporation

import { type AnyAction } from "@reduxjs/toolkit";
import { type SagaIterator } from "redux-saga";
import { fork, put, race, take } from "redux-saga/effects";

import { type Correlation } from "../../../types/common.js";
import { loadCustomElementsSaga } from "../loadCustomElements/loadCustomElementsSaga.js";
import { actions } from "../store/slice.js";

/**
 * @internal
 */
export function* initTotalCountSaga(correlation: Correlation): SagaIterator<void> {
    const initTotalCountCorrelation = `initTotalCount_${correlation}`;

    yield fork(
        loadCustomElementsSaga,
        actions.loadCustomElementsRequest({
            options: {
                limit: 1,
                includeTotalCountWithoutFilters: true,
                excludePrimaryLabel: false,
            },
            correlation: initTotalCountCorrelation,
        }),
    );

    const {
        success,
        error,
    }: {
        success?: ReturnType<typeof actions.loadCustomElementsSuccess>;
        error?: ReturnType<typeof actions.loadCustomElementsError>;
        cancel?: ReturnType<typeof actions.loadCustomElementsCancel>;
    } = yield race({
        success: take(
            (a: AnyAction) =>
                actions.loadCustomElementsSuccess.match(a) &&
                a.payload.correlation === initTotalCountCorrelation,
        ),
        error: take(
            (a: AnyAction) =>
                actions.loadCustomElementsError.match(a) &&
                a.payload.correlation === initTotalCountCorrelation,
        ),
        cancel: take(
            (a: AnyAction) =>
                actions.loadCustomElementsCancel.match(a) &&
                a.payload.correlation === initTotalCountCorrelation,
        ),
    });

    if (error) {
        throw error.payload.error;
    } else if (success) {
        yield put(
            actions.setElementsTotalCount({
                totalCount: success.payload.totalCount,
            }),
        );
    }
}
