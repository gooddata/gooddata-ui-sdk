// (C) 2022-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { SagaReturnType, all, call, cancelled, put, select, takeLatest } from "redux-saga/effects";

import { actions } from "../store/slice.js";
import { selectHiddenElements } from "../filter/filterSelectors.js";
import { initAttributeSaga } from "./initAttributeSaga.js";
import { initSelectionSaga } from "./initSelectionSaga.js";
import { initAttributeElementsPageSaga } from "./initElementsPageSaga.js";
import { initTotalCountSaga } from "./initTotalCount.js";
import {
    selectLimitingAttributeFilters,
    selectLimitingDateFilters,
    selectLimitingValidationItems,
} from "../elements/elementsSelectors.js";
import { isLimitingAttributeFiltersEmpty } from "../../../utils.js";
import { initIrrelevantSelectionSaga } from "./initIrrelevantSelectionSaga.js";
import { getAttributeFilterContext } from "../common/sagas.js";
import { selectIsWorkingSelectionEmpty } from "../selection/selectionSelectors.js";

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

        const context: SagaReturnType<typeof getAttributeFilterContext> =
            yield call(getAttributeFilterContext);
        const hiddenElements: ReturnType<typeof selectHiddenElements> = yield select(selectHiddenElements);
        const limitingFilters: ReturnType<typeof selectLimitingAttributeFilters> = yield select(
            selectLimitingAttributeFilters,
        );
        const limitingValidationItems: ReturnType<typeof selectLimitingValidationItems> = yield select(
            selectLimitingValidationItems,
        );
        const limitingDateFilters: ReturnType<typeof selectLimitingDateFilters> =
            yield select(selectLimitingDateFilters);
        const isWorkingSelectionEmpty: ReturnType<typeof selectIsWorkingSelectionEmpty> = yield select(
            selectIsWorkingSelectionEmpty,
        );
        const supportsShowingFilteredElements = context.backend.capabilities.supportsShowingFilteredElements;

        const loadTotal =
            !isLimitingAttributeFiltersEmpty(limitingFilters) ||
            limitingValidationItems.length > 0 ||
            limitingDateFilters.length > 0;

        const sagas = [initSelectionSaga, initAttributeElementsPageSaga];
        if (hiddenElements?.length > 0) {
            // the rest need the attribute already loaded for the hiddenElements to work
            yield call(initAttributeSaga, correlation);
        } else {
            sagas.unshift(initAttributeSaga);
        }

        if (loadTotal) {
            // total count without applying parent filter needs to be fetched separately.
            // It is because the fact that when elements fetched filtered by parent selection, the includeTotalCountWithoutFilters: true option does not work, despite its name
            sagas.push(initTotalCountSaga);
        }

        if (loadTotal && !isWorkingSelectionEmpty && supportsShowingFilteredElements) {
            // In this case we also load the irrelevant selection
            sagas.push(initIrrelevantSelectionSaga);
        }

        yield all(sagas.map((saga) => call(saga, correlation)));

        yield put(actions.initSuccess({ correlation: correlation }));
    } catch (error) {
        yield put(actions.initError({ error, correlation: correlation }));
    } finally {
        if (yield cancelled()) {
            yield all([put(actions.initCancel({ correlation: correlation }))]);
        }
    }
}
