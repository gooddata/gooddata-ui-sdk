// (C) 2021 GoodData Corporation
import { insightsAdapter } from "./insightsEntityAdapter";
import { DashboardState } from "../types";
import { createSelector } from "@reduxjs/toolkit";
import { insightRef, ObjRef, serializeObjRef } from "@gooddata/sdk-model";
import memoize from "lodash/memoize";
import { newInsightMap } from "../../../_staging/metadata/objRefMap";
import { selectBackendCapabilities } from "../backendCapabilities/backendCapabilitiesSelectors";

const entitySelectors = insightsAdapter.getSelectors((state: DashboardState) => state.insights);

/**
 * Selects all insights used on the dashboard.
 *
 * @alpha
 */
export const selectInsights = entitySelectors.selectAll;

/**
 * Selects refs of all insights used on the dashboard.
 *
 * @alpha
 */
export const selectInsightRefs = createSelector(selectInsights, (insights) => {
    return insights.map(insightRef);
});

/**
 * Selects all insights and returns them in a mapping of obj ref to the insight object.
 *
 * @alpha
 */
export const selectInsightsMap = createSelector(
    selectInsights,
    selectBackendCapabilities,
    (insights, capabilities) => {
        return newInsightMap(insights, capabilities.hasTypeScopedIdentifiers);
    },
);

/**
 * Selects insight used on a dashboard by its ref.
 *
 * @alpha
 */
export const selectInsightByRef = memoize((ref: ObjRef) => {
    return createSelector(selectInsightsMap, (insights) => {
        return insights.get(ref);
    });
}, serializeObjRef);
