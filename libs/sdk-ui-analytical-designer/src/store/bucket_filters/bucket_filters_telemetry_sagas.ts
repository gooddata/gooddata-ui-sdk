// (C) 2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, select, takeEvery } from "redux-saga/effects";

import {
    logAddTextFilterToInsight,
    logAttributeFilterApplied,
    logTextAttributeFilterApplied,
} from "../../services/telemetry/tracking_events.js";
import { type IAppState } from "../types.js";

import {
    type IUpdateAttributeFilterActionPayload,
    commandAddOrUpdateFilterItems,
    storeSetBucketItemUpdateMetricFilter,
    storeUpdateAttributeFilter,
} from "./bucket_filters_actions.js";

/**
 * The bucket-filters telemetry. It lives in watchers rather than in the reducer because reducers
 * must stay side-effect free. Watchers run AFTER the reducers have processed the action, so
 * `select()` here sees the post-update state.
 */

function* logForAttributeFilterUpdate(payload: IUpdateAttributeFilterActionPayload): SagaIterator {
    const state: IAppState = yield select();
    if (payload.textModeFilter) {
        yield call(logTextAttributeFilterApplied, { state });
    } else if (payload.selectedElements && payload.selectedElements.length !== 0) {
        yield call(logAttributeFilterApplied, { state, time: null, isInverted: payload.isInverted });
    }
}

export function* handleUpdateAttributeFilter(
    action: ReturnType<typeof storeUpdateAttributeFilter>,
): SagaIterator {
    yield call(logForAttributeFilterUpdate, action.payload);
}

export function* handleAddOrUpdateFilterItems(
    action: ReturnType<typeof commandAddOrUpdateFilterItems>,
): SagaIterator {
    const { attributeFilters, arbitraryFilters, matchFilters } = action.payload;
    const state: IAppState = yield select();

    for (const attributeFilter of attributeFilters ?? []) {
        // only updates of existing filters flow through updateAttributeFilterInState;
        // newly added filters produce no filter-applied event
        if (attributeFilter.filterLocalIdentifier) {
            yield call(logForAttributeFilterUpdate, attributeFilter);
        }
    }

    for (const filter of [...(arbitraryFilters ?? []), ...(matchFilters ?? [])]) {
        if (filter.filterLocalIdentifier) {
            // updating an existing filter to a text-mode filter → "applied" event
            yield call(logTextAttributeFilterApplied, { state });
        } else {
            // adding a new text-mode filter → "added to insight" event
            yield call(logAddTextFilterToInsight, { state });
        }
    }
}

export function* handleSetBucketItemUpdateMetricFilter(
    action: ReturnType<typeof storeSetBucketItemUpdateMetricFilter>,
): SagaIterator {
    const { item, changes, isModified } = action.payload;

    const isAttrFilter = item?.attribute === item?.filters?.[0]?.attribute;
    if (!isModified || !isAttrFilter) {
        return;
    }

    const state: IAppState = yield select();
    if (changes.textModeFilter) {
        yield call(logTextAttributeFilterApplied, { state });
    } else if (changes.selectedElements && (changes.selectedElements?.length ?? 0) !== 0) {
        yield call(logAttributeFilterApplied, { state, time: null, isInverted: changes.isInverted });
    }
}

export function* watchBucketFiltersTelemetry(): SagaIterator {
    yield takeEvery(storeUpdateAttributeFilter.match, handleUpdateAttributeFilter);
    yield takeEvery(commandAddOrUpdateFilterItems.match, handleAddOrUpdateFilterItems);
    yield takeEvery(storeSetBucketItemUpdateMetricFilter.match, handleSetBucketItemUpdateMetricFilter);
}
