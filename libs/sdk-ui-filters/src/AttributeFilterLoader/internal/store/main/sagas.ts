// (C) 2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { all, fork, call, takeLatest } from "redux-saga/effects";

import { actions } from "../slice";
import { initAttributeSaga } from "./sagas/initAttribute";
import { initSelectionSaga } from "./sagas/initSelection";
import { initAttributeElementsSaga } from "./sagas/initAttributeElements";
import { loadElementsRangeSaga } from "./sagas/loadElementsRange";

/**
 * @internal
 */
export function* mainWorker(): SagaIterator<void> {
    yield takeLatest(actions.init.match, initSaga);
}

/**
 * @internal
 */
export function* loadElementsRangeWorker(): SagaIterator<void> {
    yield takeLatest(actions.loadElementsRangeRequest.match, loadElementsRangeSaga);
}

function* initSaga(): SagaIterator<void> {
    yield fork(loadElementsRangeWorker);
    yield all([call(initAttributeSaga), call(initSelectionSaga), call(initAttributeElementsSaga)]);
}
