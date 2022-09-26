// (C) 2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put, call, takeLatest, select, cancelled, SagaReturnType } from "redux-saga/effects";
import { getAttributeFilterContext } from "../common/sagas";

import { elementsSaga } from "../elements/elementsSaga";
import { selectLoadElementsOptions } from "../elements/elementsSelectors";
import { actions } from "../store/slice";
import { loadLimitingAttributeFiltersAttributes } from "./loadLimitingAttributeFiltersAttributes";

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
    const context: SagaReturnType<typeof getAttributeFilterContext> = yield call(getAttributeFilterContext);

    if (actions.loadInitialElementsPageCancelRequest.match(action)) {
        // Saga was triggered by cancel request - do nothing, just jump to finally statement
        return;
    }

    const {
        payload: { correlation },
    } = action;

    try {
        yield put(actions.loadInitialElementsPageStart({ correlation }));

        const loadOptions: ReturnType<typeof selectLoadElementsOptions> = yield select(
            selectLoadElementsOptions,
        );

        const loadOptionsWithExcludePrimaryLabel = {
            ...loadOptions,
            excludePrimaryLabel: true,
        };

        const result: SagaReturnType<typeof elementsSaga> = yield call(
            elementsSaga,
            loadOptionsWithExcludePrimaryLabel,
        );
        const limitingAttributeFiltersAttributes = yield call(
            loadLimitingAttributeFiltersAttributes,
            context,
            loadOptions.limitingAttributeFilters ?? [],
        );

        yield put(
            actions.setLimitingAttributeFiltersAttributes({ attributes: limitingAttributeFiltersAttributes }),
        );
        yield put(actions.loadInitialElementsPageSuccess({ ...result, correlation }));
    } catch (error) {
        yield put(
            actions.loadInitialElementsPageError({
                error,
                correlation,
            }),
        );
    } finally {
        if (yield cancelled()) {
            yield put(actions.loadInitialElementsPageCancel({ correlation }));
        }
    }
}
