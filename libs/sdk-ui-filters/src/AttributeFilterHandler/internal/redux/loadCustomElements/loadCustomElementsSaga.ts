// (C) 2022 GoodData Corporation
import { AnyAction } from "@reduxjs/toolkit";
import { SagaIterator } from "redux-saga";
import { race, put, call, take, takeEvery, cancelled, SagaReturnType } from "redux-saga/effects";

import { ILoadElementsResult } from "../../../types/index.js";
import { elementsSaga } from "../elements/elementsSaga.js";
import { actions } from "../store/slice.js";

/**
 * @internal
 */
export function* loadCustomElementsWorker(): SagaIterator<void> {
    yield takeEvery([actions.loadCustomElementsRequest.match], loadCustomElementsSaga);
}

/**
 * @internal
 */
export function* loadCustomElementsSaga(
    action: ReturnType<typeof actions.loadCustomElementsRequest>,
): SagaIterator<ILoadElementsResult | void> {
    const {
        payload: { correlation, options },
    } = action;

    try {
        yield put(actions.loadCustomElementsStart({ correlation }));

        const {
            result,
            canceled,
            anotherRequest,
        }: {
            result?: SagaReturnType<typeof elementsSaga>;
            canceled?: ReturnType<typeof actions.loadCustomElementsCancelRequest>;
            anotherRequest?: ReturnType<typeof actions.loadCustomElementsRequest>;
        } = yield race({
            result: call(elementsSaga, options),
            anotherRequest: take(
                (a: AnyAction) =>
                    actions.loadCustomElementsRequest.match(a) &&
                    (correlation ? a.payload.correlation === correlation : true),
            ),
            canceled: take(
                (a: AnyAction) =>
                    actions.loadCustomElementsCancelRequest.match(a) &&
                    (correlation ? a.payload.correlation === correlation : true),
            ),
        });

        if (result) {
            yield put(actions.loadCustomElementsSuccess({ ...result, correlation }));
            return result;
        } else if (canceled || anotherRequest) {
            yield put(actions.loadCustomElementsCancel({ correlation }));
        }
    } catch (error) {
        yield put(
            actions.loadCustomElementsError({
                error,
                correlation,
            }),
        );
    } finally {
        if (yield cancelled()) {
            yield put(actions.loadCustomElementsCancel({ correlation }));
        }
    }
}
