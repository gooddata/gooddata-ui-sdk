// (C) 2022 GoodData Corporation
// import { v4 as uuidv4 } from "uuid";
import { SagaIterator } from "redux-saga";
import { call, put, SagaReturnType, takeLatest } from "redux-saga/effects";

import { cancelableCall, getAttributeFilterContext } from "../common/sagas";
import { actions } from "../slice";
import { loadDisplayForm } from "./effects";

/**
 * @internal
 */
export function* displayFormWorker(): SagaIterator<void> {
    yield takeLatest(actions.displayFormRequest.type, displayFormRequestSaga);
}

function* displayFormRequestSaga({
    payload: { correlationId, displayFormRef },
}: ReturnType<typeof actions.displayFormRequest>): SagaIterator<void> {
    const context: SagaReturnType<typeof getAttributeFilterContext> = yield call(getAttributeFilterContext);

    yield call(() =>
        cancelableCall({
            promise: () => loadDisplayForm(context, displayFormRef),
            onSuccess: function* (displayForm) {
                yield put(actions.displayFormSuccess({ displayForm, correlationId }));
            },
            onError: function* (error) {
                yield put(actions.displayFormError({ error, correlationId }));
            },
            onCancel: function* () {
                yield put(actions.displayFormCancel({ correlationId }));
            },
        }),
    );
}
