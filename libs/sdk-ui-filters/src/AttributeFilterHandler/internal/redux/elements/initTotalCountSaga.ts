// (C) 2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put, call, takeLatest, cancelled } from "redux-saga/effects";

import { actions } from "../store/slice.js";
import { initTotalCountSaga as initLoadTotalCountSaga } from "../init/initTotalCount.js";

/**
 * @internal
 */
export function* initTotalCountWorker(): SagaIterator<void> {
    yield takeLatest(actions.initTotalCount.match, initTotalCountSaga);
}

function* initTotalCountSaga(action: ReturnType<typeof actions.initTotalCount>): SagaIterator<void> {
    const {
        payload: { correlation },
    } = action;

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
