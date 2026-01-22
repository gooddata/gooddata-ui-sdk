// (C) 2022-2026 GoodData Corporation

import { type AnyAction } from "@reduxjs/toolkit";
import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, call, cancelled, put, race, take, takeEvery } from "redux-saga/effects";

import { type GoodDataSdkError, convertError } from "@gooddata/sdk-ui";

import { type ILoadElementsResult } from "../../../types/elementsLoader.js";
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
export function* loadCustomElementsSaga({
    payload: { correlation, options },
}: ReturnType<typeof actions.loadCustomElementsRequest>): SagaIterator<ILoadElementsResult | void> {
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
            yield put(
                actions.loadCustomElementsSuccess({
                    ...result,
                    correlation,
                }),
            );
            return result;
        } else if (canceled || anotherRequest) {
            yield put(actions.loadCustomElementsCancel({ correlation }));
        }
    } catch (error) {
        const convertedError: GoodDataSdkError = convertError(error);
        yield put(
            actions.loadCustomElementsError({
                error: convertedError,
                correlation,
            }),
        );
    } finally {
        if (yield cancelled()) {
            yield put(actions.loadCustomElementsCancel({ correlation }));
        }
    }
}
