// (C) 2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, select, SagaReturnType, takeLatest } from "redux-saga/effects";

import { selectAttributeFilterDisplayForm } from "../main/selectors";
import { cancelableEffect, getAttributeFilterContext } from "../common/sagas";
import { actions } from "../slice";

import { loadAttributeByDisplayForm } from "./effects";

/**
 * @internal
 */
export function* attributeWorker(): SagaIterator<void> {
    yield takeLatest(actions.attributeRequest.type, attributeRequestSaga);
}

function* attributeRequestSaga({
    payload: { correlationId },
}: ReturnType<typeof actions.attributeRequest>): SagaIterator<void> {
    const context: SagaReturnType<typeof getAttributeFilterContext> = yield call(getAttributeFilterContext);
    const displayFormRef: ReturnType<typeof selectAttributeFilterDisplayForm> = yield select(
        selectAttributeFilterDisplayForm,
    );

    const cancelableAttributeLoad = cancelableEffect({
        effect: () => loadAttributeByDisplayForm(context, displayFormRef),
        isCancelRequest: actions.attributeCancelRequest.match,
    });

    const { success, error, canceled }: SagaReturnType<typeof cancelableAttributeLoad> = yield call(
        cancelableAttributeLoad,
    );

    if (success) {
        yield put(actions.attributeSuccess({ attribute: success, correlationId }));
    } else if (error) {
        yield put(actions.attributeError({ error, correlationId }));
    } else if (canceled) {
        yield put(actions.attributeCancel({ correlationId }));
    }
}
