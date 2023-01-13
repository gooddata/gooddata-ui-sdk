// (C) 2022-2023 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put, call, takeLatest, select, cancelled, SagaReturnType } from "redux-saga/effects";
import { CancelableOptions } from "@gooddata/sdk-backend-spi";
// eslint-disable-next-line import/no-unassigned-import
import "abortcontroller-polyfill/dist/abortcontroller-polyfill-only";

import { getAttributeFilterContext } from "../common/sagas";
import { selectElementsForm } from "../common/selectors";

import { elementsSaga } from "../elements/elementsSaga";
import { selectLoadElementsOptions } from "../elements/elementsSelectors";
import { actions } from "../store/slice";
import { loadLimitingAttributeFiltersAttributes } from "./loadLimitingAttributeFiltersAttributes";
import { ILoadElementsOptions } from "../../../types";

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
    const abortController = new AbortController();

    const {
        payload: { correlation },
    } = action;

    try {
        if (actions.loadInitialElementsPageCancelRequest.match(action)) {
            // Saga was triggered by cancel request - do nothing, just jump to finally statement
            return;
        }

        yield put(actions.loadInitialElementsPageStart({ correlation }));

        const loadOptions: ReturnType<typeof selectLoadElementsOptions> = yield select(
            selectLoadElementsOptions,
        );

        const elementsForm: ReturnType<typeof selectElementsForm> = yield select(selectElementsForm);

        const loadOptionsWithExcludePrimaryLabel: ILoadElementsOptions & CancelableOptions = {
            ...loadOptions,
            signal: abortController.signal,
            excludePrimaryLabel:
                !context.backend.capabilities.supportsElementUris && elementsForm === "values",
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
            abortController.abort();
            yield put(actions.loadInitialElementsPageCancel({ correlation }));
        }
    }
}
