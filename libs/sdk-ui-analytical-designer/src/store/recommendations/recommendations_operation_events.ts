// (C) 2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type IRecommendationApplyResult } from "./recommendations_operation.js";

/**
 * THE SEMANTIC EVENT OF THE RECOMMENDATIONS FAMILY — ONE event for the five
 * `STORE_RECOMMENDATION_*` triggers, because it is one operation with five parameterizations
 *: the payload carries the recommendation KIND and what it produced, and the consuming
 * cases take their domain out of it regardless of the kind. Same contract as the buckets events:
 * values carried unconditionally, unchanged ones by reference; the type string stays out
 * of the frozen `ActionTypeKeys`; NOT undoable — time travel keys on the `UI_RECOMMENDATION_*`
 * triggers.
 */
export enum RecommendationsOperationActionTypeKeys {
    STORE_RECOMMENDATION_APPLIED = "STORE/RECOMMENDATIONS/RECOMMENDATION_APPLIED",
}

/**
 * A recommendation was applied. NOT committed at all when `comparison` names an attribute the
 * catalog does not know.
 */
export const recommendationApplied = createAction(
    RecommendationsOperationActionTypeKeys.STORE_RECOMMENDATION_APPLIED,
    (payload: IRecommendationApplyResult) => ({ payload }),
);
