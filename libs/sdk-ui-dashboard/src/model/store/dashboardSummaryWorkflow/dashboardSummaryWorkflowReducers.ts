// (C) 2026 GoodData Corporation

import { type PayloadAction } from "@reduxjs/toolkit";

import {
    type DashboardSummaryWorkflowInfo,
    type DashboardSummaryWorkflowState,
} from "./dashboardSummaryWorkflowState.js";

type StartRequestedPayload = {
    dashboardId: string;
};

type StartedPayload = {
    dashboardId: string;
    runId: string;
    status: NonNullable<DashboardSummaryWorkflowInfo["status"]>;
};

type StatusUpdatedPayload = {
    dashboardId: string;
    status: NonNullable<DashboardSummaryWorkflowInfo["status"]>;
};

type ResetPayload = {
    dashboardId: string;
};

function now() {
    return Date.now();
}

const startRequested = (
    state: DashboardSummaryWorkflowState,
    action: PayloadAction<StartRequestedPayload>,
) => {
    const { dashboardId } = action.payload;
    const current: DashboardSummaryWorkflowInfo = state.byDashboardId[dashboardId] ?? {};
    state.byDashboardId[dashboardId] = {
        ...current,
        runId: undefined,
        status: "RUNNING",
        startedAt: now(),
        updatedAt: now(),
    };
};

const started = (state: DashboardSummaryWorkflowState, action: PayloadAction<StartedPayload>) => {
    const { dashboardId, runId, status } = action.payload;
    const current: DashboardSummaryWorkflowInfo = state.byDashboardId[dashboardId] ?? {};
    state.byDashboardId[dashboardId] = {
        ...current,
        runId,
        status,
        startedAt: current.startedAt ?? now(),
        updatedAt: now(),
    };
};

const statusUpdated = (state: DashboardSummaryWorkflowState, action: PayloadAction<StatusUpdatedPayload>) => {
    const { dashboardId, status } = action.payload;
    const current: DashboardSummaryWorkflowInfo = state.byDashboardId[dashboardId] ?? {};
    state.byDashboardId[dashboardId] = {
        ...current,
        status,
        updatedAt: now(),
    };
};

const reset = (state: DashboardSummaryWorkflowState, action: PayloadAction<ResetPayload>) => {
    const { dashboardId } = action.payload;
    delete state.byDashboardId[dashboardId];
};

export const dashboardSummaryWorkflowReducers = {
    startRequested,
    started,
    statusUpdated,
    reset,
};
