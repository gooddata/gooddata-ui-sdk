// (C) 2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select, takeEvery } from "redux-saga/effects";

import { areObjRefsEqual } from "@gooddata/sdk-model";

import { VIEW } from "../../constants/bucket.js";
import { BAR } from "../../constants/visualization_types.js";
import { getLocalVisualizationClass } from "../../services/visualization_class_service.js";
import {
    buildAddBucketItemDeps,
    buildBucketItemEditDeps,
    buildRemoveBucketItemsDeps,
    readAddBucketItemInput,
} from "../buckets/buckets_operation_inputs.js";
import { getAvailableAttributes } from "../catalog/catalog_selector.js";
import { getFirstAvailableDateDataset } from "../date_datasets/date_datasets_selectors.js";
import { type IAppState } from "../types.js";
import { getVisualizationClassState } from "../visualization_classes/visualization_classes_selectors.js";

import {
    storeApplyComparison,
    storeApplyComparisonWithPeriod,
    storeApplyContributionInPercents,
    storeApplyMetricWithPeriod,
    storeApplyTrending,
} from "./recommendations_actions.js";
import {
    type IRecommendationApplyDeps,
    type IRecommendationApplyInput,
    type RecommendationApplyParams,
    applyRecommendation,
} from "./recommendations_operation.js";
import { recommendationApplied } from "./recommendations_operation_events.js";

/**
 * THE RECOMMENDATION OPERATION SAGA — the orchestration that replaced
 * `recommendations_apply_reducer.ts`, in the `buckets_operations_saga.ts` shape: select the typed
 * input, select the deps, call the pure operation, put ONE semantic event. Five triggers, one
 * handler — the parameterization is the only difference.
 */

const readRecommendationApplyInput = (state: IAppState): IRecommendationApplyInput => ({
    ...readAddBucketItemInput(state),
    visualizationClass: getVisualizationClassState(state),
});

const buildRecommendationApplyDeps = (state: IAppState): IRecommendationApplyDeps => ({
    ...buildRemoveBucketItemsDeps(state),
    addToView: buildAddBucketItemDeps(state, VIEW),
    edit: buildBucketItemEditDeps(state),
    firstAvailableDateDataset: getFirstAvailableDateDataset(state),
    barVisualizationClass: getLocalVisualizationClass(state, BAR),
});

function* handleRecommendation(params: RecommendationApplyParams): SagaIterator {
    const input: ReturnType<typeof readRecommendationApplyInput> = yield select(readRecommendationApplyInput);
    const deps: ReturnType<typeof buildRecommendationApplyDeps> = yield select(buildRecommendationApplyDeps);

    const result: ReturnType<typeof applyRecommendation> = yield call(
        applyRecommendation,
        input,
        params,
        deps,
    );

    yield put(recommendationApplied(result));
}

function* handleApplyComparisonWithPeriod({
    payload,
}: ReturnType<typeof storeApplyComparisonWithPeriod>): SagaIterator {
    yield call(handleRecommendation, {
        recommendation: "comparisonWithPeriod",
        granularity: payload.granularity,
    });
}

function* handleApplyContributionInPercents(): SagaIterator {
    yield call(handleRecommendation, { recommendation: "contributionInPercents" });
}

function* handleApplyMetricWithPeriod(): SagaIterator {
    yield call(handleRecommendation, { recommendation: "metricWithPeriod" });
}

function* handleApplyTrending({ payload }: ReturnType<typeof storeApplyTrending>): SagaIterator {
    yield call(handleRecommendation, { recommendation: "trending", granularity: payload.granularity });
}

/**
 * The catalog lookup is a boundary read, and it is also the bail-out: an attribute the catalog does
 * not know commits nothing at all.
 */
function* handleApplyComparison({ payload }: ReturnType<typeof storeApplyComparison>): SagaIterator {
    const availableAttributes: ReturnType<typeof getAvailableAttributes> =
        yield select(getAvailableAttributes);
    const catalogItem = availableAttributes.find((item) =>
        areObjRefsEqual(item.attribute.ref, payload.attributeRef),
    );

    if (!catalogItem) {
        return;
    }

    yield call(handleRecommendation, { recommendation: "comparison", catalogItem });
}

export function* watchRecommendationOperations(): SagaIterator {
    yield takeEvery(storeApplyComparisonWithPeriod.type, handleApplyComparisonWithPeriod);
    yield takeEvery(storeApplyContributionInPercents.type, handleApplyContributionInPercents);
    yield takeEvery(storeApplyMetricWithPeriod.type, handleApplyMetricWithPeriod);
    yield takeEvery(storeApplyTrending.type, handleApplyTrending);
    yield takeEvery(storeApplyComparison.type, handleApplyComparison);
}
