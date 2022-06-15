// (C) 2022 GoodData Corporation
// import { AnyAction } from "@reduxjs/toolkit";
import { SagaIterator } from "redux-saga";
import { put, call, take, race, takeLatest, SagaReturnType, select, cancelled } from "redux-saga/effects";

import { asyncRequestSaga } from "../../common/asyncRequestSaga";
import { actions } from "../../slice";
import {
    selectLimitingAttributeFilters,
    selectLimitingDateFilters,
    selectLimitingMeasureFilters,
    selectSearch,
} from "../selectors";

/**
 * @internal
 */
export function* loadElementsRangeWorker(): SagaIterator<void> {
    yield takeLatest(actions.loadElementsRangeRequest.match, loadElementsRangeSaga);
}

/**
 * @internal
 */
function* loadElementsRangeSaga({
    payload: { options, correlationId },
}: ReturnType<typeof actions.loadElementsRangeRequest>): SagaIterator<void> {
    let cancel = false;
    try {
        const search: ReturnType<typeof selectSearch> = yield select(selectSearch);
        const limitingAttributeFilters: ReturnType<typeof selectLimitingAttributeFilters> = yield select(
            selectLimitingAttributeFilters,
        );
        const limitingMeasures: ReturnType<typeof selectLimitingMeasureFilters> = yield select(
            selectLimitingMeasureFilters,
        );
        const limitingDateFilters: ReturnType<typeof selectLimitingDateFilters> = yield select(
            selectLimitingDateFilters,
        );

        const loadElementsRange = () =>
            asyncRequestSaga(
                actions.attributeElementsRequest({
                    correlationId,
                    search,
                    limitingAttributeFilters,
                    limitingDateFilters,
                    limitingMeasures,
                    ...options,
                }),
                actions.attributeElementsSuccess.match,
                actions.attributeElementsError.match,
                actions.attributeElementsCancelRequest({ correlationId }),
            );

        const {
            loadElementsRangeResult,
            cancelRequest,
        }: {
            loadElementsRangeResult?: SagaReturnType<typeof loadElementsRange>;
            cancelRequest?: ReturnType<typeof actions.loadElementsRangeCancelRequest>;
        } = yield race({
            loadElementsRangeResult: call(loadElementsRange),
            cancelRequest: take(actions.loadElementsRangeCancelRequest.match),
        });

        if (cancelRequest) {
            cancel = true;
        }

        const { success, error } = loadElementsRangeResult;

        if (success) {
            yield put(
                actions.setAttributeElements({
                    attributeElements: success.payload.attributeElements,
                }),
            );

            yield put(
                actions.setAttributeElementsTotalCountWithCurrentSettings({
                    totalCount: success.payload.totalCount,
                }),
            );

            yield put(actions.loadElementsRangeSuccess(success.payload));
        } else if (error) {
            yield put(actions.loadElementsRangeError(error.payload));
        }
    } finally {
        if (yield cancelled()) {
            cancel = true;
        }
    }

    if (cancel) {
        yield put(actions.loadElementsRangeCancel({ correlationId }));
    }
}
