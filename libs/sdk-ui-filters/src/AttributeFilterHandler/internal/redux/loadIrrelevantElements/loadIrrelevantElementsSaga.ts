// (C) 2023-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { put, call, takeLatest, select, cancelled, SagaReturnType } from "redux-saga/effects";
import { CancelableOptions } from "@gooddata/sdk-backend-spi";
import difference from "lodash/difference.js";

import { getAttributeFilterContext } from "../common/sagas.js";
import { selectElementsForm, selectWithoutApply } from "../common/selectors.js";
import { elementsSaga } from "../elements/elementsSaga.js";
import { selectLoadElementsOptions } from "../elements/elementsSelectors.js";
import { actions } from "../store/slice.js";
import { ILoadElementsOptions } from "../../../types/index.js";
import { selectCommittedSelection, selectWorkingSelection } from "../store/selectors.js";
import { shouldExcludePrimaryLabel } from "../utils.js";

/**
 * @internal
 */
export function* loadIrrelevantElementsWorker(): SagaIterator<void> {
    yield takeLatest(
        [actions.loadIrrelevantElementsRequest.match, actions.loadIrrelevantElementsCancelRequest.match],
        loadIrrelevantElementsSaga,
    );
}

/**
 * @internal
 */
export function* loadIrrelevantElementsSaga(
    action:
        | ReturnType<typeof actions.loadIrrelevantElementsRequest>
        | ReturnType<typeof actions.loadIrrelevantElementsCancelRequest>,
): SagaIterator<void> {
    if (actions.loadIrrelevantElementsCancelRequest.match(action)) {
        // Saga was triggered by cancel request - do nothing, finally statement was already called, because takeLatest can run only one saga at a time === the previous one was canceled
        return;
    }

    const context: SagaReturnType<typeof getAttributeFilterContext> = yield call(getAttributeFilterContext);
    const abortController = new AbortController();

    const {
        payload: { correlation },
    } = action;

    try {
        yield put(actions.loadIrrelevantElementsStart({ correlation }));

        const elementsForm: ReturnType<typeof selectElementsForm> = yield select(selectElementsForm);
        const loadOptions: ReturnType<typeof selectLoadElementsOptions> =
            yield select(selectLoadElementsOptions);

        const withoutApply = yield select(selectWithoutApply);

        const allSelectedElementTitles: SagaReturnType<typeof selectCommittedSelection> = yield select(
            withoutApply ? selectWorkingSelection : selectCommittedSelection,
        );
        const elements =
            elementsForm === "values"
                ? { values: allSelectedElementTitles }
                : { uris: allSelectedElementTitles };

        const loadOptionsWithElements: ILoadElementsOptions & CancelableOptions = {
            ...loadOptions,
            signal: abortController.signal,
            excludePrimaryLabel: shouldExcludePrimaryLabel(context, elementsForm),
            search: "", // search is not relevant here
            elements,
        };

        const relevantElementsResult: SagaReturnType<typeof elementsSaga> = yield call(
            elementsSaga,
            loadOptionsWithElements,
        );

        const relevantElementTitles = relevantElementsResult.elements.map((elem) =>
            context.enableDuplicatedLabelValuesInAttributeFilter ? elem.uri : elem.title,
        );
        const irrelevantSelectionTitles = difference(allSelectedElementTitles, relevantElementTitles);

        yield put(
            actions.loadIrrelevantElementsSuccess({ elementTitles: irrelevantSelectionTitles, correlation }),
        );
    } catch (error) {
        yield put(
            actions.loadIrrelevantElementsError({
                error,
                correlation,
            }),
        );
    } finally {
        if (yield cancelled()) {
            abortController.abort();
            yield put(actions.loadIrrelevantElementsCancel({ correlation }));
        }
    }
}
