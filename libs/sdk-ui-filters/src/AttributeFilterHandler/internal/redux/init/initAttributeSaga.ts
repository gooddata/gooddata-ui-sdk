// (C) 2022-2026 GoodData Corporation

import { type AnyAction } from "@reduxjs/toolkit";
import { type SagaIterator } from "redux-saga";
import { fork, race, take } from "redux-saga/effects";

import { type Correlation } from "../../../types/common.js";
import { loadAttributeSaga } from "../loadAttribute/loadAttributeSaga.js";
import { actions } from "../store/slice.js";

/**
 * @internal
 */
export function* initAttributeSaga(correlation: Correlation): SagaIterator<void> {
    yield fork(loadAttributeSaga, actions.loadAttributeRequest({ correlation }));

    const {
        error,
    }: {
        success?: ReturnType<typeof actions.loadAttributeSuccess>;
        error?: ReturnType<typeof actions.loadAttributeError>;
        cancel?: ReturnType<typeof actions.loadAttributeCancel>;
    } = yield race({
        success: take(
            (a: AnyAction) => actions.loadAttributeSuccess.match(a) && a.payload.correlation === correlation,
        ),
        error: take(
            (a: AnyAction) => actions.loadAttributeError.match(a) && a.payload.correlation === correlation,
        ),
        cancel: take(
            (a: AnyAction) => actions.loadAttributeCancel.match(a) && a.payload.correlation === correlation,
        ),
    });

    if (error) {
        throw error.payload.error;
    }
}
