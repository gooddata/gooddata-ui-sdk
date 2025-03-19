// (C) 2022-2024 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put, call, takeLatest, select, cancelled, SagaReturnType } from "redux-saga/effects";

import { getAttributeFilterContext } from "../common/sagas.js";
import { selectElementsForm } from "../common/selectors.js";
import { elementsSaga } from "../elements/elementsSaga.js";
import { actions } from "../store/slice.js";
import { selectCacheId } from "../elements/elementsSelectors.js";
import { shouldExcludePrimaryLabel } from "../utils.js";

import { selectHasNextPage, selectLoadNextElementsPageOptions } from "./loadNextElementsPageSelectors.js";

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
    const context: SagaReturnType<typeof getAttributeFilterContext> = yield call(getAttributeFilterContext);

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

        const elementsForm: ReturnType<typeof selectElementsForm> = yield select(selectElementsForm);

        const loadOptionsWithExcludePrimaryLabel: Parameters<typeof elementsSaga>[0] = {
            ...loadOptions,
            excludePrimaryLabel: shouldExcludePrimaryLabel(context, elementsForm),
        };

        const result = yield call(elementsSaga, loadOptionsWithExcludePrimaryLabel, cacheId);

        yield put(
            actions.loadNextElementsPageSuccess({
                ...result,
                correlation,
                enableDuplicatedLabelValuesInAttributeFilter:
                    context.enableDuplicatedLabelValuesInAttributeFilter,
            }),
        );
    } catch (error) {
        yield put(
            actions.loadNextElementsPageError({
                error,
                correlation,
            }),
        );
    } finally {
        if (yield cancelled()) {
            yield put(actions.loadNextElementsPageCancel({ correlation }));
        }
    }
}
