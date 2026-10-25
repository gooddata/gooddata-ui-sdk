// (C) 2019-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type ObjRef } from "@gooddata/sdk-model";

import { ActionTypeKeys } from "../../constants/actions.js";
import { type Granularity } from "../../models/granularity.js";

export const applyComparisonWithPeriod = createAction(
    ActionTypeKeys.UI_RECOMMENDATION_COMPARISON_WITH_PERIOD,
    (granularity: Granularity) => ({ payload: { granularity } }),
);

export const applyContributionInPercents = createAction(
    ActionTypeKeys.UI_RECOMMENDATION_CONTRIBUTION_IN_PERCENT,
    () => ({ payload: undefined }),
);

export const applyMetricWithPeriod = createAction(
    ActionTypeKeys.UI_RECOMMENDATION_METRIC_WITH_PERIOD,
    () => ({ payload: undefined }),
);

export const applyTrending = createAction(
    ActionTypeKeys.UI_RECOMMENDATION_TRENDING,
    (granularity: Granularity) => ({ payload: { granularity } }),
);

export const applyComparison = createAction(
    ActionTypeKeys.UI_RECOMMENDATION_COMPARISON,
    (attributeRef: ObjRef) => ({ payload: { attributeRef } }),
);

export const applyFiltering = createAction(ActionTypeKeys.UI_RECOMMENDATION_FILTERING, () => ({
    payload: undefined,
}));

export const dismissRecommendations = createAction(
    ActionTypeKeys.UI_DISMISS_RECOMMENDATIONS,
    (visClass: string) => ({ payload: { visClass } }),
);

export const storeApplyComparisonWithPeriod = createAction(
    ActionTypeKeys.STORE_RECOMMENDATION_COMPARISON_WITH_PERIOD,
    (granularity: Granularity) => ({ payload: { granularity } }),
);

export const storeApplyContributionInPercents = createAction(
    ActionTypeKeys.STORE_RECOMMENDATION_CONTRIBUTION_IN_PERCENT,
    () => ({ payload: undefined }),
);

export const storeApplyMetricWithPeriod = createAction(
    ActionTypeKeys.STORE_RECOMMENDATION_METRIC_WITH_PERIOD,
    () => ({ payload: undefined }),
);

export const storeApplyTrending = createAction(
    ActionTypeKeys.STORE_RECOMMENDATION_TRENDING,
    (granularity: Granularity) => ({ payload: { granularity } }),
);

export const storeApplyComparison = createAction(
    ActionTypeKeys.STORE_RECOMMENDATION_COMPARISON,
    (attributeRef: ObjRef) => ({ payload: { attributeRef } }),
);

export const storeDismissRecommendations = createAction(
    ActionTypeKeys.STORE_DISMISS_RECOMMENDATIONS,
    (visClass: string) => ({ payload: { visClass } }),
);
