// (C) 2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, select, SagaReturnType, takeEvery } from "redux-saga/effects";

import { selectAttributeFilterDisplayForm } from "../main/selectors";
import { cancelableEffect, getAttributeFilterContext } from "../common/sagas";
import { actions } from "../slice";
import { loadAttributeElements } from "./effects";

/**
 * @internal
 */
export function* attributeElementsWorker(): SagaIterator<void> {
    yield takeEvery(actions.attributeElementsRequest.match, attributeElementsRequestSaga);
}

function* attributeElementsRequestSaga({
    payload: { correlationId, ...options },
}: ReturnType<typeof actions.attributeElementsRequest>): SagaIterator<void> {
    const context: SagaReturnType<typeof getAttributeFilterContext> = yield call(getAttributeFilterContext);
    const displayFormRef: ReturnType<typeof selectAttributeFilterDisplayForm> = yield select(
        selectAttributeFilterDisplayForm,
    );

    const cancelableElementsLoad = cancelableEffect({
        effect: () =>
            loadAttributeElements(context, {
                ...options,
                displayFormRef,
            }),
        isCancelRequest: actions.attributeElementsCancelRequest.match,
    });

    const { success, error, canceled }: SagaReturnType<typeof cancelableElementsLoad> = yield call(
        cancelableElementsLoad,
    );

    if (success) {
        yield put(
            actions.attributeElementsSuccess({
                correlationId,
                attributeElements: success.items,
                totalCount: success.totalCount,
            }),
        );
    } else if (error) {
        yield put(actions.attributeElementsError({ error, correlationId }));
    } else if (canceled) {
        yield put(actions.attributeElementsCancel({ correlationId }));
    }
}
