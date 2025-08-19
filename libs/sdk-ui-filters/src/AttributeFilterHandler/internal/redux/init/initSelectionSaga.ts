// (C) 2022-2025 GoodData Corporation
import { AnyAction } from "@reduxjs/toolkit";
import { SagaIterator } from "redux-saga";
import { SagaReturnType, call, fork, race, select, take } from "redux-saga/effects";

import { isAttributeElementsByRef } from "@gooddata/sdk-model";

import { Correlation } from "../../../types/index.js";
import { getAttributeFilterContext } from "../common/sagas.js";
import { selectElementsForm } from "../common/selectors.js";
import { INIT_SELECTION_PREFIX } from "../constants.js";
import { selectAttributeFilterElements } from "../filter/filterSelectors.js";
import { loadCustomElementsSaga } from "../loadCustomElements/loadCustomElementsSaga.js";
import { actions } from "../store/slice.js";
import { shouldExcludePrimaryLabel } from "../utils.js";

/**
 * @internal
 */
export function* initSelectionSaga(correlation: Correlation): SagaIterator<void> {
    const elements: ReturnType<typeof selectAttributeFilterElements> = yield select(
        selectAttributeFilterElements,
    );
    const context: SagaReturnType<typeof getAttributeFilterContext> = yield call(getAttributeFilterContext);
    const elementsForm: ReturnType<typeof selectElementsForm> = yield select(selectElementsForm);

    const elementKeys = isAttributeElementsByRef(elements) ? elements.uris : elements.values;

    if (elementKeys.length === 0) {
        return;
    }

    const initSelectionCorrelation = `${INIT_SELECTION_PREFIX}${correlation}`;

    yield fork(
        loadCustomElementsSaga,
        actions.loadCustomElementsRequest({
            options: {
                elements,
                offset: 0,
                limit: Math.max(550, elementKeys.length),
                search: undefined,
                excludePrimaryLabel: shouldExcludePrimaryLabel(context, elementsForm),
            },
            correlation: initSelectionCorrelation,
        }),
    );

    const {
        error,
    }: {
        success?: ReturnType<typeof actions.loadCustomElementsSuccess>;
        error?: ReturnType<typeof actions.loadCustomElementsError>;
        cancel?: ReturnType<typeof actions.loadCustomElementsCancel>;
    } = yield race({
        success: take(
            (a: AnyAction) =>
                actions.loadCustomElementsSuccess.match(a) &&
                a.payload.correlation === initSelectionCorrelation,
        ),
        error: take(
            (a: AnyAction) =>
                actions.loadCustomElementsError.match(a) &&
                a.payload.correlation === initSelectionCorrelation,
        ),
        cancel: take(
            (a: AnyAction) =>
                actions.loadCustomElementsCancel.match(a) &&
                a.payload.correlation === initSelectionCorrelation,
        ),
    });

    if (error) {
        throw error.payload.error;
    }
}
