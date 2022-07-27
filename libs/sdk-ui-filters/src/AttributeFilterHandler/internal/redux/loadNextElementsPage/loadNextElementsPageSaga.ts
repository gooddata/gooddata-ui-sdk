// (C) 2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put, call, takeLatest, select, cancelled } from "redux-saga/effects";

import { elementsSaga } from "../elements/elementsSaga";
import { actions } from "../store/slice";
import { selectLoadNextElementsPageOptions } from "./loadNextElementsPageSelectors";

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
        // Saga was triggered by cancel request - do nothing, just jump to finally statement
        return;
    }

    const {
        payload: { correlation },
    } = action;

    try {
        yield put(actions.loadNextElementsPageStart({ correlation }));

        const loadOptions: ReturnType<typeof selectLoadNextElementsPageOptions> = yield select(
            selectLoadNextElementsPageOptions,
        );

        const result = yield call(elementsSaga, loadOptions);

        yield put(actions.loadNextElementsPageSuccess({ ...result, correlation }));
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
