// (C) 2022 GoodData Corporation
import { v4 as uuidv4 } from "uuid";
import { SagaIterator } from "redux-saga";
import { put, select, take, race } from "redux-saga/effects";

import {
    selectAttributeFilterDisplayForm,
    selectAttributeFilterElements,
} from "../../attributeFilter/selectors";
import { actions } from "../../slice";
import { AnyAction } from "@reduxjs/toolkit";

/**
 * @internal
 */
export function* initSelection(): SagaIterator<void> {
    const correlationId = `init_selection_${uuidv4()}`;
    const displayFormRef: ReturnType<typeof selectAttributeFilterDisplayForm> = yield select(
        selectAttributeFilterDisplayForm,
    );
    const elements: ReturnType<typeof selectAttributeFilterElements> = yield select(
        selectAttributeFilterElements,
    );

    yield put(actions.attributeElementsRequest({ displayFormRef, correlationId, elements }));

    const {
        success,
        error,
        cancel,
    }: {
        success: ReturnType<typeof actions.attributeElementsSuccess>;
        error: ReturnType<typeof actions.attributeElementsError>;
        cancel: ReturnType<typeof actions.attributeElementsCancel>;
    } = yield race({
        succes: take(
            (a: AnyAction) =>
                actions.attributeElementsSuccess.match(a) && a.payload.correlationId === correlationId,
        ),
        error: take(
            (a: AnyAction) =>
                actions.attributeElementsError.match(a) && a.payload.correlationId === correlationId,
        ),
        cancel: take(
            (a: AnyAction) =>
                actions.attributeElementsCancel.match(a) && a.payload.correlationId === correlationId,
        ),
    });

    if (success) {
        yield put(actions.setSelection({ selection: success.payload.attributeElements }));
    } else if (error || cancel) {
        // Handle cleanup?
    }
}
