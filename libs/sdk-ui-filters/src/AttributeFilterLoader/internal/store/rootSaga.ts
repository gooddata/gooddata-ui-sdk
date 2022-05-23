// (C) 2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { all, fork } from "redux-saga/effects";

import { displayFormWorker, attributeElementsWorker, attributeWorker, mainWorker } from "./sagas";

export function* rootSaga(): SagaIterator<void> {
    // eslint-disable-next-line no-console
    console.log("Root saga started...");

    try {
        yield all(
            [displayFormWorker, attributeElementsWorker, attributeWorker, mainWorker].map((worker) =>
                fork(worker),
            ),
        );
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Root saga failed", e);
    }
}
