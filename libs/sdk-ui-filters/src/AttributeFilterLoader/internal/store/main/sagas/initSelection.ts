// (C) 2022 GoodData Corporation
import { v4 as uuidv4 } from "uuid";
import { SagaIterator } from "redux-saga";
import { put, select, take, race } from "redux-saga/effects";
import { AnyAction } from "@reduxjs/toolkit";

import { selectAttributeFilterElements } from "../selectors";
import { selectIsCommitedSelectionInverted } from "../../selection/selectors";
import { actions } from "../../slice";

/**
 * @internal
 */
export function* initSelectionSaga(): SagaIterator<void> {
    const correlationId = `init_selection_${uuidv4()}`;
    const isInverted: ReturnType<typeof selectIsCommitedSelectionInverted> = yield select(
        selectIsCommitedSelectionInverted,
    );
    const elements: ReturnType<typeof selectAttributeFilterElements> = yield select(
        selectAttributeFilterElements,
    );

    yield put(actions.attributeElementsRequest({ correlationId, elements }));

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
                actions.attributeElementsSuccess.match(a) && a.payload.correlationId === correlationId,
        ),
        error: take(
            (a: AnyAction) =>
                actions.attributeElementsError.match(a) && a.payload.correlationId === correlationId,
        ),
        canceled: take(
            (a: AnyAction) =>
                actions.attributeElementsCancel.match(a) && a.payload.correlationId === correlationId,
        ),
    });

    if (success) {
        yield put(
            actions.changeSelection({
                selection: success.payload.attributeElements.map((element) => element.uri),
                isInverted,
            }),
        );
    } else if (error || canceled) {
        // Handle cleanup?
    }
}
