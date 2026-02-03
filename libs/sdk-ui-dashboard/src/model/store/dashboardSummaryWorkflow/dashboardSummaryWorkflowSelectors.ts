// (C) 2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { selectDashboardId } from "../meta/metaSelectors.js";
import { type DashboardSelector, type DashboardState } from "../types.js";
import { type DashboardSummaryWorkflowInfo } from "./dashboardSummaryWorkflowState.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.dashboardSummaryWorkflow,
);

export const selectDashboardSummaryWorkflowInfoByDashboardId = (
    dashboardId: string,
): DashboardSelector<DashboardSummaryWorkflowInfo | undefined> =>
    createSelector(selectSelf, (state) => state.byDashboardId[dashboardId]);

export const selectCurrentDashboardSummaryWorkflowInfo: DashboardSelector<
    DashboardSummaryWorkflowInfo | undefined
> = createSelector(selectDashboardId, selectSelf, (dashboardId, state) => {
    if (!dashboardId) {
        return undefined;
    }
    return state.byDashboardId[dashboardId];
});

export const selectCurrentDashboardSummaryWorkflowStatus: DashboardSelector<
    DashboardSummaryWorkflowInfo["status"] | undefined
> = createSelector(selectCurrentDashboardSummaryWorkflowInfo, (info) => info?.status);
