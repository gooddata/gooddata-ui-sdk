// (C) 2022-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { call, cancelled, put, select, takeLatest } from "redux-saga/effects";

import { GoodDataSdkError, convertError } from "@gooddata/sdk-ui";

import { selectHasNextPage, selectLoadNextElementsPageOptions } from "./loadNextElementsPageSelectors.js";
import { elementsSaga } from "../elements/elementsSaga.js";
import { selectCacheId } from "../elements/elementsSelectors.js";
import { actions } from "../store/slice.js";

/**
 * @internal
 */
export function* loadNextElementsPageWorker(): SagaIterator<void> {
    yield takeLatest(
        [
            actions.loadNextElementsPageRequest.match,
            actions.loadNextElementsPageCancelRequest.match,
            actions.loadInitialElementsPageRequest.match,
        ],
        loadNextElementsPageSaga,
    );
}

/**
 * @internal
 */
export function* loadNextElementsPageSaga(
    action:
        | ReturnType<typeof actions.loadNextElementsPageRequest>
        | ReturnType<typeof actions.loadNextElementsPageCancelRequest>
        | ReturnType<typeof actions.loadInitialElementsPageRequest>,
): SagaIterator<void> {
    if (
        actions.loadNextElementsPageCancelRequest.match(action) ||
        actions.loadInitialElementsPageRequest.match(action)
    ) {
        // Saga was triggered by cancel request - do nothing, finally statement was already called, because takeLatest can run only one saga at a time === the previous one was canceled
        return;
    }

    const {
        payload: { correlation },
    } = action;

    const hasNextPage: ReturnType<typeof selectHasNextPage> = yield select(selectHasNextPage);

    if (!hasNextPage) {
        return;
    }

    try {
        yield put(actions.loadNextElementsPageStart({ correlation }));

        const loadOptions: ReturnType<typeof selectLoadNextElementsPageOptions> = yield select(
            selectLoadNextElementsPageOptions,
        );

        const cacheId: ReturnType<typeof selectCacheId> = yield select(selectCacheId);

        const loadOptionsWithExcludePrimaryLabel: Parameters<typeof elementsSaga>[0] = {
            ...loadOptions,
            excludePrimaryLabel: false,
        };

        const result = yield call(elementsSaga, loadOptionsWithExcludePrimaryLabel, cacheId);

        yield put(
            actions.loadNextElementsPageSuccess({
                ...result,
                correlation,
            }),
        );
    } catch (error) {
        const convertedError: GoodDataSdkError = convertError(error);
        yield put(
            actions.loadNextElementsPageError({
                error: convertedError,
                correlation,
            }),
        );
    } finally {
        if (yield cancelled()) {
            yield put(actions.loadNextElementsPageCancel({ correlation }));
        }
    }
}
