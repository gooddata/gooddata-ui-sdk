// (C) 2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, select, SagaReturnType, takeEvery } from "redux-saga/effects";

import { selectAttributeFilterDisplayForm, selectHiddenElementsAsAttributeElements } from "../main/selectors";
import { selectAttribute } from "../attribute/selectors";
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

    const hiddenElements: ReturnType<typeof selectHiddenElementsAsAttributeElements> = yield select(
        selectHiddenElementsAsAttributeElements,
    );
    const attribute: ReturnType<typeof selectAttribute> = yield select(selectAttribute);

    const cancelableElementsLoad = cancelableEffect({
        effect: () =>
            loadAttributeElements(
                context,
                {
                    ...options,
                    displayFormRef,
                },
                {
                    hiddenElements,
                    attribute,
                },
            ),
        isCancelRequest: (a) =>
            actions.attributeElementsCancelRequest.match(a) && a.payload.correlationId === correlationId,
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
                limit: options.limit,
                offset: options.offset,
            }),
        );
    } else if (error) {
        yield put(actions.attributeElementsError({ error, correlationId }));
    } else if (canceled) {
        yield put(actions.attributeElementsCancel({ correlationId }));
    }
}
