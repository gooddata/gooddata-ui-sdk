// (C) 2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put, fork, race, take, SagaReturnType } from "redux-saga/effects";
import { AnyAction } from "@reduxjs/toolkit";

import { Correlation } from "../../../types";
import { loadCustomElementsSaga } from "../loadCustomElements/loadCustomElementsSaga";
import { actions } from "../store/slice";

/**
 * @internal
 */
export function* initTotalCountSaga(correlation: Correlation): SagaIterator<void> {
    const result: SagaReturnType<typeof loadCustomElementsSaga> = yield fork(
        loadCustomElementsSaga,
        actions.loadCustomElementsRequest({
            options: {
                limit: 1,
                includeTotalCountWithoutFilters: true,
            },
            correlation,
        }),
    );

    const {
        error,
    }: {
        success?: ReturnType<typeof actions.loadCustomElementsSuccess>;
        error?: ReturnType<typeof actions.loadCustomElementsError>;
        cancel?: ReturnType<typeof actions.loadCustomElementsCancel>;
    } = yield race({
        success: take(
            (a: AnyAction) =>
                actions.loadCustomElementsSuccess.match(a) && a.payload.correlation === correlation,
        ),
        error: take(
            (a: AnyAction) =>
                actions.loadCustomElementsError.match(a) && a.payload.correlation === correlation,
        ),
        cancel: take(
            (a: AnyAction) =>
                actions.loadCustomElementsCancel.match(a) && a.payload.correlation === correlation,
        ),
    });

    if (error) {
        throw error.payload.error;
    }

    yield put(
        actions.setElementsTotalCount({
            totalCount: result.totalCount,
        }),
    );
}
