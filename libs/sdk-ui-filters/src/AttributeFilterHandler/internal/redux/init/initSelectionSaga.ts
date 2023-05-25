// (C) 2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { select, fork, take, race, SagaReturnType, call } from "redux-saga/effects";
import { isAttributeElementsByRef } from "@gooddata/sdk-model";
import { AnyAction } from "@reduxjs/toolkit";

import { Correlation } from "../../../types/index.js";
import { loadCustomElementsSaga } from "../loadCustomElements/loadCustomElementsSaga.js";
import { selectAttributeFilterElements } from "../filter/filterSelectors.js";
import { actions } from "../store/slice.js";
import { getAttributeFilterContext } from "../common/sagas.js";
import { selectElementsForm } from "../common/selectors.js";

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

    const initSelectionCorrelation = `initSelection_${correlation}`;

    yield fork(
        loadCustomElementsSaga,
        actions.loadCustomElementsRequest({
            options: {
                elements,
                offset: 0,
                limit: 550,
                search: undefined,
                excludePrimaryLabel:
                    !context.backend.capabilities.supportsElementUris && elementsForm === "values",
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
