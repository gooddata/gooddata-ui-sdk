// (C) 2022-2025 GoodData Corporation
import { type SagaIterator } from "redux-saga";
import { call, cancelled, put, takeLatest } from "redux-saga/effects";

import { type GoodDataSdkError, convertError } from "@gooddata/sdk-ui";

import { initTotalCountSaga as initLoadTotalCountSaga } from "../init/initTotalCount.js";
import { actions } from "../store/slice.js";

/**
 * @internal
 */
export function* initTotalCountWorker(): SagaIterator<void> {
    yield takeLatest(actions.initTotalCount.match, initTotalCountSaga);
}

function* initTotalCountSaga({
    payload: { correlation },
}: ReturnType<typeof actions.initTotalCount>): SagaIterator<void> {
    try {
        yield put(actions.initTotalCountStart({ correlation }));

        yield call(initLoadTotalCountSaga, correlation);

        yield put(actions.initTotalCountSuccess({ correlation: correlation }));
    } catch (error) {
        const convertedError: GoodDataSdkError = convertError(error);
        yield put(actions.initTotalCountError({ error: convertedError, correlation: correlation }));
    } finally {
        if (yield cancelled()) {
            yield put(actions.initTotalCountCancel({ correlation: correlation }));
        }
    }
}
