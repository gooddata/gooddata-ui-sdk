// (C) 2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { all, call, cancelled, put, takeLatest } from "redux-saga/effects";

import { actions } from "../../slice";
import { initAttributeSaga } from "../sagas/initAttribute";
import { initSelectionSaga } from "../sagas/initSelection";
import { initAttributeElementsSaga } from "../sagas/initAttributeElements";

/**
 * @internal
 */
export function* initWorker(): SagaIterator<void> {
    yield takeLatest(actions.init.match, initSaga);
}

function* initSaga(): SagaIterator<void> {
    try {
        yield all([call(initAttributeSaga), call(initSelectionSaga), call(initAttributeElementsSaga)]);
        yield put(actions.initSuccess());
    } catch (error) {
        yield put(actions.initError({ error }));
    } finally {
        if (yield cancelled()) {
            yield put(actions.initCancel());
        }
    }
}
