// (C) 2022-2024 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put, call, takeLatest, select, cancelled, SagaReturnType } from "redux-saga/effects";

import { getAttributeFilterContext } from "../common/sagas.js";
import { selectElementsForm } from "../common/selectors.js";
import { shouldExcludePrimaryLabel } from "../utils.js";
import { elementsSaga } from "../elements/elementsSaga.js";
import { selectLoadElementsOptions, selectCacheId } from "../elements/elementsSelectors.js";
import { actions } from "../store/slice.js";

import { loadLimitingAttributeFiltersAttributes } from "./loadLimitingAttributeFiltersAttributes.js";

/**
 * @internal
 */
export function* loadInitialElementsPageWorker(): SagaIterator<void> {
    yield takeLatest(
        [actions.loadInitialElementsPageRequest.match, actions.loadInitialElementsPageCancelRequest.match],
        loadInitialElementsPageSaga,
    );
}

/**
 * @internal
 */
export function* loadInitialElementsPageSaga(
    action:
        | ReturnType<typeof actions.loadInitialElementsPageRequest>
        | ReturnType<typeof actions.loadInitialElementsPageCancelRequest>,
): SagaIterator<void> {
    if (actions.loadInitialElementsPageCancelRequest.match(action)) {
        // Saga was triggered by cancel request - do nothing - do nothing, finally statement was already called, because takeLatest can run only one saga at a time === the previous one was canceled
        return;
    }

    const context: SagaReturnType<typeof getAttributeFilterContext> = yield call(getAttributeFilterContext);
    const abortController = new AbortController();

    const {
        payload: { correlation },
    } = action;

    try {
        yield put(actions.loadInitialElementsPageStart({ correlation }));

        const loadOptions: ReturnType<typeof selectLoadElementsOptions> = yield select(
            selectLoadElementsOptions,
        );

        const cacheId: ReturnType<typeof selectCacheId> = yield select(selectCacheId);

        const elementsForm: ReturnType<typeof selectElementsForm> = yield select(selectElementsForm);

        const loadOptionsWithExcludePrimaryLabel: Parameters<typeof elementsSaga>[0] = {
            ...loadOptions,
            signal: abortController.signal,
            excludePrimaryLabel: shouldExcludePrimaryLabel(context, elementsForm),
        };

        const result: SagaReturnType<typeof elementsSaga> = yield call(
            elementsSaga,
            loadOptionsWithExcludePrimaryLabel,
            cacheId,
        );
        const limitingAttributeFiltersAttributes = yield call(
            loadLimitingAttributeFiltersAttributes,
            context,
            loadOptions.limitingAttributeFilters ?? [],
        );

        yield put(
            actions.setLimitingAttributeFiltersAttributes({ attributes: limitingAttributeFiltersAttributes }),
        );
        yield put(actions.setCacheId({ cacheId: result.cacheId }));
        yield put(
            actions.loadInitialElementsPageSuccess({
                ...result,
                correlation,
                enableDuplicatedLabelValuesInAttributeFilter:
                    context.enableDuplicatedLabelValuesInAttributeFilter,
            }),
        );
    } catch (error) {
        yield put(
            actions.loadInitialElementsPageError({
                error,
                correlation,
            }),
        );
    } finally {
        if (yield cancelled()) {
            abortController.abort();
            yield put(actions.loadInitialElementsPageCancel({ correlation }));
        }
    }
}
