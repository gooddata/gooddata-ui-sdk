// (C) 2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { select, fork, take, race } from "redux-saga/effects";
import { isAttributeElementsByRef } from "@gooddata/sdk-model";
import { AnyAction } from "@reduxjs/toolkit";

import { Correlation } from "../../../types";
import { loadCustomElementsSaga } from "../loadCustomElements/loadCustomElementsSaga";
import { selectAttributeFilterElements } from "../filter/filterSelectors";
import { actions } from "../store/slice";

/**
 * @internal
 */
export function* initSelectionSaga(correlation: Correlation): SagaIterator<void> {
    const elements: ReturnType<typeof selectAttributeFilterElements> = yield select(
        selectAttributeFilterElements,
    );
    const elementKeys = isAttributeElementsByRef(elements) ? elements.uris : elements.values;

    if (elementKeys.length === 0) {
        return;
    }

    yield fork(
        loadCustomElementsSaga,
        actions.loadCustomElementsRequest({
            options: {
                elements,
                offset: 0,
                limit: 550,
                search: undefined,
            },
            correlation,
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
                actions.loadCustomElementsSuccess.match(a) && a.payload.correlation === correlation,
        ),
        error: take(
            (a: AnyAction) =>
                actions.loadCustomElementsError.match(a) && a.payload.correlation === correlation,
        ),
        cancel: take(
            (a: AnyAction) =>
                actions.loadCustomElementsCancel.match(a) && a.payload.correlation === correlation,
        ),
    });

    if (error) {
        throw error.payload.error;
    }
}
