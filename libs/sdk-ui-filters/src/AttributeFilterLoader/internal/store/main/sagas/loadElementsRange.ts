// (C) 2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put, take, race } from "redux-saga/effects";
import { AnyAction } from "@reduxjs/toolkit";

import { actions } from "../../slice";

/**
 * @internal
 */
export function* loadElementsRangeSaga({
    payload: { correlationId, ...options },
}: ReturnType<typeof actions.loadElementsRangeRequest>): SagaIterator<void> {
    yield put(actions.attributeElementsRequest({ correlationId, ...options }));

    const {
        success,
        error,
        canceled,
    }: {
        success: ReturnType<typeof actions.attributeElementsSuccess>;
        error: ReturnType<typeof actions.attributeElementsError>;
        canceled: ReturnType<typeof actions.attributeElementsCancel>;
    } = yield race({
        success: take(
            (a: AnyAction) =>
                actions.loadElementsRangeRequest.match(a) && a.payload.correlationId === correlationId,
        ),
        error: take(
            (a: AnyAction) =>
                actions.attributeElementsError.match(a) && a.payload.correlationId === correlationId,
        ),
        canceled: take(
            (a: AnyAction) =>
                (actions.attributeElementsCancel.match(a) && a.payload.correlationId === correlationId) ||
                actions.loadElementsRangeCancelRequest.match(a),
        ),
    });

    if (success) {
        yield put(actions.loadElementsRangeSuccess(success.payload));
    } else if (error) {
        actions.loadElementsRangeError(error.payload);
    } else if (canceled) {
        actions.loadElementsRangeCancel(canceled.payload);
    }
}
