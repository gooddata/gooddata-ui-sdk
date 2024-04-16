// (C) 2022-2024 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put, call, select, takeLatest, SagaReturnType, cancelled } from "redux-saga/effects";
import { IAttributeMetadataObject } from "@gooddata/sdk-model";

import { actions } from "../store/slice.js";
import { getAttributeFilterContext, PromiseFnReturnType } from "../common/sagas.js";
import { selectAttributeFilterDisplayForm } from "../filter/filterSelectors.js";
import { loadAttributeByDisplayForm } from "./loadAttributeByDisplayForm.js";

/**
 * @internal
 */
export function* loadAttributeWorker(): SagaIterator<void> {
    yield takeLatest(
        [actions.loadAttributeRequest.match, actions.loadAttributeCancelRequest.match],
        loadAttributeSaga,
    );
}

/*
 * @internal
 */
export function* loadAttributeSaga(
    action: ReturnType<typeof actions.loadAttributeRequest> | ReturnType<typeof actions.loadAttributeRequest>,
): SagaIterator<IAttributeMetadataObject | void> {
    if (actions.loadAttributeCancelRequest.match(action)) {
        // Saga was triggered by loadAttributeCancelRequest - do nothing, finally statement was already called, because takeLatest can run only one saga at a time === the previous one was canceled
        return;
    }

    const {
        payload: { correlation },
    } = action;

    try {
        const displayFormRef: ReturnType<typeof selectAttributeFilterDisplayForm> = yield select(
            selectAttributeFilterDisplayForm,
        );
        const context: SagaReturnType<typeof getAttributeFilterContext> = yield call(
            getAttributeFilterContext,
        );

        yield put(actions.loadAttributeStart({ correlation }));

        const attribute: PromiseFnReturnType<typeof loadAttributeByDisplayForm> = yield call(
            loadAttributeByDisplayForm,
            context,
            displayFormRef,
        );

        yield put(actions.loadAttributeSuccess({ attribute, correlation }));

        return attribute;
    } catch (error) {
        yield put(actions.loadAttributeError({ error, correlation }));
    } finally {
        if (yield cancelled()) {
            yield put(actions.loadAttributeCancel({ correlation }));
        }
    }
}
