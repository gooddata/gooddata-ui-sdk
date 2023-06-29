// (C) 2022 GoodData Corporation
import { AnyAction } from "@reduxjs/toolkit";
import { SagaIterator } from "redux-saga";
import { fork, race, take } from "redux-saga/effects";

import { Correlation } from "../../../types/index.js";
import { loadInitialElementsPageSaga } from "../loadInitialElementsPage/loadInitialElementsPageSaga.js";
import { actions } from "../store/slice.js";

/**
 * @internal
 */
export function* initAttributeElementsPageSaga(correlation: Correlation): SagaIterator<void> {
    yield fork(loadInitialElementsPageSaga, actions.loadInitialElementsPageRequest({ correlation }));

    const {
        error,
    }: {
        success?: ReturnType<typeof actions.loadInitialElementsPageSuccess>;
        error?: ReturnType<typeof actions.loadInitialElementsPageError>;
        cancel?: ReturnType<typeof actions.loadInitialElementsPageCancel>;
    } = yield race({
        success: take(
            (a: AnyAction) =>
                actions.loadInitialElementsPageSuccess.match(a) && a.payload.correlation === correlation,
        ),
        error: take(
            (a: AnyAction) =>
                actions.loadInitialElementsPageError.match(a) && a.payload.correlation === correlation,
        ),
        cancel: take(
            (a: AnyAction) =>
                actions.loadInitialElementsPageCancel.match(a) && a.payload.correlation === correlation,
        ),
    });

    if (error) {
        throw error.payload.error;
    }
}
