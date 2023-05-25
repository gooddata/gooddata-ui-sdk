// (C) 2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { all, call, cancelled, put, select, takeLatest } from "redux-saga/effects";

import { actions } from "../store/slice.js";
import { selectHiddenElements } from "../filter/filterSelectors.js";
import { initAttributeSaga } from "./initAttributeSaga.js";
import { initSelectionSaga } from "./initSelectionSaga.js";
import { initAttributeElementsPageSaga } from "./initElementsPageSaga.js";
import { initTotalCountSaga } from "./initTotalCount.js";

/**
 * @internal
 */
export function* initWorker(): SagaIterator<void> {
    yield takeLatest(actions.init.match, initSaga);
}

function* initSaga(action: ReturnType<typeof actions.init>): SagaIterator<void> {
    const {
        payload: { correlation },
    } = action;

    try {
        yield put(actions.initStart({ correlation }));

        const hiddenElements: ReturnType<typeof selectHiddenElements> = yield select(selectHiddenElements);
        if (hiddenElements?.length > 0) {
            yield call(initAttributeSaga, correlation);
            // these need the attribute loaded for the hiddenElements to work
            yield all([
                call(initSelectionSaga, correlation),
                call(initAttributeElementsPageSaga, correlation),
                call(initTotalCountSaga, correlation),
            ]);
        } else {
            yield all([
                call(initAttributeSaga, correlation),
                call(initSelectionSaga, correlation),
                call(initAttributeElementsPageSaga, correlation),
                call(initTotalCountSaga, correlation),
            ]);
        }

        yield put(actions.initSuccess({ correlation: correlation }));
    } catch (error) {
        yield put(actions.initError({ error, correlation: correlation }));
    } finally {
        if (yield cancelled()) {
            yield all([put(actions.initCancel({ correlation: correlation }))]);
        }
    }
}
