// (C) 2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { all, call, cancelled, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";

import { actions } from "../../slice";
import { initAttributeSaga } from "../sagas/initAttribute";
import { initSelectionSaga } from "../sagas/initSelection";
import { initAttributeElementsSaga } from "../sagas/initAttributeElements";
import { InitActionPayload } from "../reducers";

/**
 * @internal
 */
export function* initWorker(): SagaIterator<void> {
    yield takeLatest(actions.init.match, initSaga);
}

function* initSaga(action: PayloadAction<InitActionPayload>): SagaIterator<void> {
    try {
        if (action.payload.hiddenElements?.length > 0) {
            yield call(initAttributeSaga, action.payload.correlationId);
            // these need the attribute loaded for the hiddenElements to work
            yield all([
                call(initSelectionSaga, action.payload.correlationId),
                call(initAttributeElementsSaga, action.payload.correlationId),
            ]);
        } else {
            yield all([
                call(initAttributeSaga, action.payload.correlationId),
                call(initSelectionSaga, action.payload.correlationId),
                call(initAttributeElementsSaga, action.payload.correlationId),
            ]);
        }

        yield put(actions.initSuccess({ correlationId: action.payload.correlationId }));
    } catch (error) {
        yield put(actions.initError({ error, correlationId: action.payload.correlationId }));
    } finally {
        if (yield cancelled()) {
            yield put(actions.initCancel({ correlationId: action.payload.correlationId }));
        }
    }
}
