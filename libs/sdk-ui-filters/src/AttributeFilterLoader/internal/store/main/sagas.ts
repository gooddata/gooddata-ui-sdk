// (C) 2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { all, call, takeLatest } from "redux-saga/effects";

import { actions } from "../slice";
import { initDisplayForm } from "./sagas/initDisplayForm";
import { initSelection } from "./sagas/initSelection";
import { initAttributeElements } from "./sagas/initAttributeElements";

/**
 * @internal
 */
export function* mainWorker(): SagaIterator<void> {
    yield takeLatest(actions.init.match, initSaga);
}

function* initSaga(): SagaIterator<void> {
    yield all([call(initDisplayForm), call(initSelection), call(initAttributeElements)]);
}
