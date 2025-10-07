// (C) 2022-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, cancelled, put, takeLatest } from "redux-saga/effects";

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
        yield put(actions.initTotalCountError({ error, correlation: correlation }));
    } finally {
        if (yield cancelled()) {
            yield put(actions.initTotalCountCancel({ correlation: correlation }));
        }
    }
}
