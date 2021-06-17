// (C) 2021 GoodData Corporation
import { insightsAdapter } from "./insightsEntityAdapter";
import { DashboardState } from "../types";
import { createSelector } from "@reduxjs/toolkit";
import { insightRef, serializeObjRef } from "@gooddata/sdk-model";
import { ObjRef } from "@gooddata/sdk-model";
import memoize from "lodash/memoize";

const entitySelectors = insightsAdapter.getSelectors((state: DashboardState) => state.insights);

/**
 * Selects all insights used on the dashboard.
 *
 * @internal
 */
export const selectInsights = entitySelectors.selectAll;

/**
 * Selects refs of all insights used on the dashboard.
 *
 * @internal
 */
export const selectInsightRefs = createSelector(selectInsights, (insights) => {
    return insights.map(insightRef);
});

/**
 * Selects all insights used on the dashboard in an ID to IInsight dictionary.
 *
 * @internal
 */
export const selectInsightsById = entitySelectors.selectEntities;

/**
 * Selects insight by its ref.
 *
 * @internal
 */
export const selectInsightByRef = memoize((ref: ObjRef) => {
    return createSelector(
        (state: DashboardState) => state,
        (state) => {
            return entitySelectors.selectById(state, serializeObjRef(ref));
        },
    );
}, serializeObjRef);
