// (C) 2023-2025 GoodData Corporation
import { type AnyAction } from "@reduxjs/toolkit";
import { type SagaIterator } from "redux-saga";
import { fork, race, take } from "redux-saga/effects";

import { type Correlation } from "../../../types/index.js";
import { loadIrrelevantElementsSaga } from "../loadIrrelevantElements/loadIrrelevantElementsSaga.js";
import { actions } from "../store/slice.js";

/**
 * @internal
 */
export function* initIrrelevantSelectionSaga(correlation: Correlation): SagaIterator<void> {
    yield fork(loadIrrelevantElementsSaga, actions.loadIrrelevantElementsRequest({ correlation }));

    const {
        error,
    }: {
        success?: ReturnType<typeof actions.loadIrrelevantElementsSuccess>;
        error?: ReturnType<typeof actions.loadIrrelevantElementsError>;
        cancel?: ReturnType<typeof actions.loadIrrelevantElementsCancel>;
    } = yield race({
        success: take(
            (a: AnyAction) =>
                actions.loadIrrelevantElementsSuccess.match(a) && a.payload.correlation === correlation,
        ),
        error: take(
            (a: AnyAction) =>
                actions.loadIrrelevantElementsError.match(a) && a.payload.correlation === correlation,
        ),
        cancel: take(
            (a: AnyAction) =>
                actions.loadIrrelevantElementsCancel.match(a) && a.payload.correlation === correlation,
        ),
    });

    if (error) {
        throw error.payload.error;
    }
}
