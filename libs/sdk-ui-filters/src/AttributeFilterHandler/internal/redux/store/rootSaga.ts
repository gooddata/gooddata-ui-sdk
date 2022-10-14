// (C) 2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { all, fork } from "redux-saga/effects";

import {
    initWorker,
    loadAttributeWorker,
    loadInitialElementsPageWorker,
    loadNextElementsPageWorker,
    loadCustomElementsWorker,
} from "./sagas";

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
        // eslint-disable-next-line no-console
        console.error("Root saga failed", e);
    }
}
