// (C) 2022-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { all, fork } from "redux-saga/effects";

import { initTotalCountWorker } from "../elements/initTotalCountSaga.js";
import { initWorker } from "../init/initSaga.js";
import { loadAttributeWorker } from "../loadAttribute/loadAttributeSaga.js";
import { loadCustomElementsWorker } from "../loadCustomElements/loadCustomElementsSaga.js";
import { loadInitialElementsPageWorker } from "../loadInitialElementsPage/loadInitialElementsPageSaga.js";
import { loadIrrelevantElementsWorker } from "../loadIrrelevantElements/loadIrrelevantElementsSaga.js";
import { loadNextElementsPageWorker } from "../loadNextElementsPage/loadNextElementsPageSaga.js";

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
