// (C) 2022-2025 GoodData Corporation
import { type SagaIterator } from "redux-saga";
import { all, fork } from "redux-saga/effects";

import {
    initTotalCountWorker,
    initWorker,
    loadAttributeWorker,
    loadCustomElementsWorker,
    loadInitialElementsPageWorker,
    loadIrrelevantElementsWorker,
    loadNextElementsPageWorker,
} from "./sagas.js";

export function* rootSaga(): SagaIterator<void> {
    try {
        yield all(
            [
                loadAttributeWorker,
                loadInitialElementsPageWorker,
                loadNextElementsPageWorker,
                loadCustomElementsWorker,
                loadIrrelevantElementsWorker,
                initWorker,
                initTotalCountWorker,
            ].map((worker) => fork(worker)),
        );
    } catch (e) {
        console.error("Root saga failed", e);
    }
}
