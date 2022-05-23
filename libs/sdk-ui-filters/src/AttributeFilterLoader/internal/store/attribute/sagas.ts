// (C) 2022 GoodData Corporation
// import { v4 as uuidv4 } from "uuid";
import { SagaIterator } from "redux-saga";
import { call, put, SagaReturnType, takeLatest } from "redux-saga/effects";

import { cancelableCall, getAttributeFilterContext } from "../common/sagas";
import { actions } from "../slice";
import { loadAttribute } from "./effects";

/**
 * @internal
 */
export function* attributeWorker(): SagaIterator<void> {
    yield takeLatest(actions.attributeRequest.type, attributeRequestSaga);
}

function* attributeRequestSaga({
    payload: { attributeRef, correlationId },
}: ReturnType<typeof actions.attributeRequest>): SagaIterator<void> {
    const context: SagaReturnType<typeof getAttributeFilterContext> = yield call(getAttributeFilterContext);

    yield call(() =>
        cancelableCall({
            promise: () => loadAttribute(context, attributeRef),
            onSuccess: function* (attribute) {
                yield put(actions.attributeSuccess({ attribute, correlationId }));
            },
            onError: function* (error) {
                yield put(actions.attributeError({ error, correlationId }));
            },
            onCancel: function* () {
                yield put(actions.attributeCancel({ correlationId }));
            },
        }),
    );
}
