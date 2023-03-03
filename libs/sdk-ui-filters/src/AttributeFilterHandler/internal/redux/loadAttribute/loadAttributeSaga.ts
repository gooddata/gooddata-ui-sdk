// (C) 2022-2023 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put, call, select, takeLatest, SagaReturnType, cancelled } from "redux-saga/effects";
import { IAttributeMetadataObject } from "@gooddata/sdk-model";

import { actions } from "../store/slice";
import { getAttributeFilterContext, PromiseFnReturnType } from "../common/sagas";
import { selectAttributeFilterDisplayForm } from "../filter/filterSelectors";
import { loadAttributeByDisplayForm } from "./loadAttributeByDisplayForm";
import { loadAttributeDataSetMeta } from "./loadAttributeDataSetMeta";

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
): SagaIterator<IAttributeMetadataObject> {
    if (actions.loadAttributeCancelRequest.match(action)) {
        // Saga was triggered by cancel request - do nothing, just jump to finally statement
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

        const attributeDataSet: PromiseFnReturnType<typeof loadAttributeDataSetMeta> = yield call(
            loadAttributeDataSetMeta,
            context,
            attribute.ref,
        );

        yield put(actions.loadAttributeSuccess({ attribute, dataSet: attributeDataSet, correlation }));

        return attribute;
    } catch (error) {
        yield put(actions.loadAttributeError({ error, correlation }));
    } finally {
        if (yield cancelled()) {
            yield put(actions.loadAttributeCancel({ correlation }));
        }
    }
}
