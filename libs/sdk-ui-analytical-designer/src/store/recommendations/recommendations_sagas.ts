// (C) 2019-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select, takeEvery } from "redux-saga/effects";

import { openFilterDropdown } from "../filter_bar/filter_bar_actions.js";

import {
    applyComparison,
    applyComparisonWithPeriod,
    applyContributionInPercents,
    applyFiltering,
    applyMetricWithPeriod,
    applyTrending,
    dismissRecommendations,
    storeApplyComparison,
    storeApplyComparisonWithPeriod,
    storeApplyContributionInPercents,
    storeApplyMetricWithPeriod,
    storeApplyTrending,
    storeDismissRecommendations,
} from "./recommendations_actions.js";
import { getDismissedRecommendations } from "./recommendations_selector.js";

function* handleApplyComparisonWithPeriod(
    action: ReturnType<typeof applyComparisonWithPeriod>,
): SagaIterator {
    const { granularity } = action.payload;
    yield put(storeApplyComparisonWithPeriod(granularity));
}

function* handleApplyContributionInPercent(): SagaIterator {
    yield put(storeApplyContributionInPercents());
}

function* handleApplyMetricWithPeriod(): SagaIterator {
    yield put(storeApplyMetricWithPeriod());
}

function* handleApplyTrending(action: ReturnType<typeof applyTrending>): SagaIterator {
    const { granularity } = action.payload;
    yield put(storeApplyTrending(granularity));
}

function* handleApplyComparison(action: ReturnType<typeof applyComparison>): SagaIterator {
    const { attributeRef } = action.payload;
    yield put(storeApplyComparison(attributeRef));
}

function* handleApplyFiltering(): SagaIterator {
    yield put(openFilterDropdown());
}

export function* handleDismissRecommendations(
    action: ReturnType<typeof dismissRecommendations>,
): SagaIterator {
    const { visClass } = action.payload;
    yield put(storeDismissRecommendations(visClass));
    // Persistence side effect: it lives here rather than in the reducer, which must stay
    // side-effect free. The put above has already been reduced, so the selector sees the updated
    // list.
    const dismissed: ReturnType<typeof getDismissedRecommendations> =
        yield select(getDismissedRecommendations);
    try {
        yield call([localStorage, "setItem"], "dismissedRecommendations", JSON.stringify(dismissed));
    } catch (error) {
        // best-effort persistence (storage may be blocked or full): the dismissal is already
        // applied in redux state, so a persistence failure must not kill the watcher
        console.warn("Failed to persist dismissed recommendations", error);
    }
}

export function* watchRecommendations(): SagaIterator {
    yield takeEvery(applyComparisonWithPeriod.match, handleApplyComparisonWithPeriod);
    yield takeEvery(applyContributionInPercents.match, handleApplyContributionInPercent);
    yield takeEvery(applyMetricWithPeriod.match, handleApplyMetricWithPeriod);
    yield takeEvery(applyTrending.match, handleApplyTrending);
    yield takeEvery(applyComparison.match, handleApplyComparison);
    yield takeEvery(applyFiltering.match, handleApplyFiltering);
    yield takeEvery(dismissRecommendations.match, handleDismissRecommendations);
}
