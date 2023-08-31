// (C) 2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, select, takeLatest } from "redux-saga/effects";

import { actions } from "../store/slice.js";
// import { selectHiddenElements } from "../filter/filterSelectors.js";
// import { initAttributeSaga } from "./initAttributeSaga.js";
// import { initSelectionSaga } from "./initSelectionSaga.js";
// import { initAttributeElementsPageSaga } from "./initElementsPageSaga.js";
import { initTotalCountSaga as initLoadTotalCountSaga } from "./initTotalCount.js";
import { selectLimitingAttributeFilters } from "../elements/elementsSelectors.js";
import { isLimitingAttributeFiltersEmpty } from "../../../utils.js";

/**
 * @internal
 */
export function* initTotalCountWorker(): SagaIterator<void> {
    yield takeLatest(actions.initTotalCount.match, initTotalCountSaga);
}

function* initTotalCountSaga(action: ReturnType<typeof actions.initTotalCount>): SagaIterator<void> {
    const {
        payload: { correlation },
    } = action;

    try {
        // yield put(actions.initStart({ correlation }));
        const limitingFilters: ReturnType<typeof selectLimitingAttributeFilters> = yield select(
            selectLimitingAttributeFilters,
        );

        const loadTotal = !isLimitingAttributeFiltersEmpty(limitingFilters);

        if (loadTotal) {
            yield call(initLoadTotalCountSaga, correlation);
        }

        // yield put(actions.initSuccess({ correlation: correlation }));
    } catch (error) {
        //yield put(actions.initError({ error, correlation: correlation }));
    } finally {
        // if (yield cancelled()) {
        //     yield put(actions.initCancel({ correlation: correlation }));
        // }
    }
}
