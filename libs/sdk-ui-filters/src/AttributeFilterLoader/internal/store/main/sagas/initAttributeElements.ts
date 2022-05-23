// (C) 2022 GoodData Corporation
import { v4 as uuidv4 } from "uuid";
import { SagaIterator } from "redux-saga";
import { put, select, take, race } from "redux-saga/effects";
import { AnyAction } from "@reduxjs/toolkit";

import { selectAttributeFilterDisplayForm } from "../../attributeFilter/selectors";
import { actions } from "../../slice";

export function* initAttributeElements(): SagaIterator<void> {
    const correlationId = `init_paging_${uuidv4()}`;
    const displayFormRef: ReturnType<typeof selectAttributeFilterDisplayForm> = yield select(
        selectAttributeFilterDisplayForm,
    );

    yield put(actions.attributeElementsRequest({ displayFormRef, correlationId, offset: 0, limit: 550 }));

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
        yield put(
            actions.setAttributeElements({
                attributeElements: success.payload.attributeElements,
                totalCount: success.payload.totalCount,
            }),
        );
    } else if (error || cancel) {
        // Handle cleanup?
    }
}
