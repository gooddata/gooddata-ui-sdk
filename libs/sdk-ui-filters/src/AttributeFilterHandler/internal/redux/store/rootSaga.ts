// (C) 2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { all, fork } from "redux-saga/effects";

import {
    initWorker,
    loadAttributeWorker,
    loadInitialElementsPageWorker,
    loadNextElementsPageWorker,
    loadCustomElementsWorker,
} from "./sagas.js";

export function* rootSaga(): SagaIterator<void> {
    try {
        yield all(
            [
                loadAttributeWorker,
                loadInitialElementsPageWorker,
                loadNextElementsPageWorker,
                loadCustomElementsWorker,
                initWorker,
            ].map((worker) => fork(worker)),
        );
    } catch (e) {
        console.error("Root saga failed", e);
    }
}
