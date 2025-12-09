// (C) 2023-2025 GoodData Corporation

import { difference } from "lodash-es";
import { SagaIterator } from "redux-saga";
import { SagaReturnType, call, cancelled, put, select, takeLatest } from "redux-saga/effects";

import { CancelableOptions } from "@gooddata/sdk-backend-spi";
import { GoodDataSdkError, convertError } from "@gooddata/sdk-ui";

import { ILoadElementsOptions } from "../../../types/index.js";
import { selectElementsForm, selectWithoutApply } from "../common/selectors.js";
import { elementsSaga } from "../elements/elementsSaga.js";
import { selectLoadElementsOptions } from "../elements/elementsSelectors.js";
import { selectCommittedSelection, selectWorkingSelection } from "../store/selectors.js";
import { actions } from "../store/slice.js";

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
            excludePrimaryLabel: false,
            search: "", // search is not relevant here
            elements,
        };

        const relevantElementsResult: SagaReturnType<typeof elementsSaga> = yield call(
            elementsSaga,
            loadOptionsWithElements,
        );

        const relevantElementTitles = relevantElementsResult.elements
            .map((elem) => elem.uri)
            .filter((uri): uri is string => uri !== null);
        const irrelevantSelectionTitles = difference(allSelectedElementTitles, relevantElementTitles);

        yield put(
            actions.loadIrrelevantElementsSuccess({
                elementTitles: irrelevantSelectionTitles,
                correlation: correlation ?? "",
            }),
        );
    } catch (error) {
        const convertedError: GoodDataSdkError = convertError(error);
        yield put(
            actions.loadIrrelevantElementsError({
                error: convertedError,
                correlation: correlation ?? "",
            }),
        );
    } finally {
        if (yield cancelled()) {
            abortController.abort();
            yield put(actions.loadIrrelevantElementsCancel({ correlation }));
        }
    }
}
