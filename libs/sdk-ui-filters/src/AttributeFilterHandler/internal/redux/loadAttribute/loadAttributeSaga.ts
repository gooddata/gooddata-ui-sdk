// (C) 2022-2025 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, call, cancelled, put, select, takeLatest } from "redux-saga/effects";

import { type IAttributeMetadataObject, areObjRefsEqual } from "@gooddata/sdk-model";
import { type GoodDataSdkError, convertError } from "@gooddata/sdk-ui";

import { loadAttributeByDisplayForm } from "./loadAttributeByDisplayForm.js";
import { type PromiseFnReturnType, getAttributeFilterContext } from "../common/sagas.js";
import {
    selectAttributeFilterDisplayAsLabel,
    selectAttributeFilterDisplayForm,
} from "../filter/filterSelectors.js";
import { actions } from "../store/slice.js";

/**
 * @internal
 */
export function* loadAttributeWorker(): SagaIterator<void> {
    yield takeLatest(
        [actions.loadAttributeRequest.match, actions.loadAttributeCancelRequest.match],
        loadAttributeSaga,
    );
}

/*
 * @internal
 */
export function* loadAttributeSaga(
    action: ReturnType<typeof actions.loadAttributeRequest> | ReturnType<typeof actions.loadAttributeRequest>,
): SagaIterator<IAttributeMetadataObject | void> {
    if (actions.loadAttributeCancelRequest.match(action)) {
        // Saga was triggered by loadAttributeCancelRequest - do nothing, finally statement was already called, because takeLatest can run only one saga at a time === the previous one was canceled
        return;
    }

    const {
        payload: { correlation },
    } = action;

    try {
        const displayFormRef: ReturnType<typeof selectAttributeFilterDisplayForm> = yield select(
            selectAttributeFilterDisplayForm,
        );
        const context: SagaReturnType<typeof getAttributeFilterContext> =
            yield call(getAttributeFilterContext);

        yield put(actions.loadAttributeStart({ correlation }));

        const attribute: PromiseFnReturnType<typeof loadAttributeByDisplayForm> = yield call(
            loadAttributeByDisplayForm,
            context,
            displayFormRef,
        );

        const primaryLabel = attribute.displayForms.find((df) => df.isPrimary);
        // validate that both DFs are not the secondary ones
        const displayAsDisplayFormRef: ReturnType<typeof selectAttributeFilterDisplayAsLabel> = yield select(
            selectAttributeFilterDisplayAsLabel,
        );
        if (
            primaryLabel?.ref &&
            displayAsDisplayFormRef &&
            !areObjRefsEqual(displayFormRef, primaryLabel?.ref) &&
            !areObjRefsEqual(displayAsDisplayFormRef, primaryLabel?.ref)
        ) {
            console.error(
                "AttributeFilter: Filter's displayForm is not primary and provided displayAsLabel is not primary either -> filter will not work correctly. Please provide primary display form in filter definition.",
            );
        }
        // check if AF's DF is primary or not
        if (primaryLabel?.ref && !areObjRefsEqual(displayFormRef, primaryLabel?.ref)) {
            console.warn(
                "AttributeFilter: Filter's displayForm is not primary -> migrating filter to primary label",
            );
            yield put(
                actions.transformFilterToPrimaryLabel({
                    primaryLabelRef: primaryLabel?.ref,
                    secondaryLabelRef: displayFormRef,
                    correlation,
                }),
            );
        }

        yield put(actions.loadAttributeSuccess({ attribute, correlation }));

        return attribute;
    } catch (error) {
        const convertedError: GoodDataSdkError = convertError(error);
        yield put(actions.loadAttributeError({ error: convertedError, correlation }));
    } finally {
        if (yield cancelled()) {
            yield put(actions.loadAttributeCancel({ correlation }));
        }
    }
}
