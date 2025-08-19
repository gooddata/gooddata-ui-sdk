// (C) 2022-2025 GoodData Corporation
import { AnyAction } from "@reduxjs/toolkit";
import { SagaIterator } from "redux-saga";
import { SagaReturnType, call, fork, put, race, select, take } from "redux-saga/effects";

import { Correlation } from "../../../types/index.js";
import { getAttributeFilterContext } from "../common/sagas.js";
import { selectElementsForm } from "../common/selectors.js";
import { loadCustomElementsSaga } from "../loadCustomElements/loadCustomElementsSaga.js";
import { actions } from "../store/slice.js";
import { shouldExcludePrimaryLabel } from "../utils.js";

/**
 * @internal
 */
export function* initTotalCountSaga(correlation: Correlation): SagaIterator<void> {
    const initTotalCountCorrelation = `initTotalCount_${correlation}`;
    const context: SagaReturnType<typeof getAttributeFilterContext> = yield call(getAttributeFilterContext);
    const elementsForm: ReturnType<typeof selectElementsForm> = yield select(selectElementsForm);

    yield fork(
        loadCustomElementsSaga,
        actions.loadCustomElementsRequest({
            options: {
                limit: 1,
                includeTotalCountWithoutFilters: true,
                excludePrimaryLabel: shouldExcludePrimaryLabel(context, elementsForm),
            },
            correlation: initTotalCountCorrelation,
        }),
    );

    const {
        success,
        error,
    }: {
        success?: ReturnType<typeof actions.loadCustomElementsSuccess>;
        error?: ReturnType<typeof actions.loadCustomElementsError>;
        cancel?: ReturnType<typeof actions.loadCustomElementsCancel>;
    } = yield race({
        success: take(
            (a: AnyAction) =>
                actions.loadCustomElementsSuccess.match(a) &&
                a.payload.correlation === initTotalCountCorrelation,
        ),
        error: take(
            (a: AnyAction) =>
                actions.loadCustomElementsError.match(a) &&
                a.payload.correlation === initTotalCountCorrelation,
        ),
        cancel: take(
            (a: AnyAction) =>
                actions.loadCustomElementsCancel.match(a) &&
                a.payload.correlation === initTotalCountCorrelation,
        ),
    });

    if (error) {
        throw error.payload.error;
    } else if (success) {
        yield put(
            actions.setElementsTotalCount({
                totalCount: success.payload.totalCount,
            }),
        );
    }
}
