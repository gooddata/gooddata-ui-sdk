// (C) 2026 GoodData Corporation

import { type DashboardSummaryWorkflowStatus } from "@gooddata/sdk-backend-spi";

/**
 * @internal
 */
export type DashboardSummaryWorkflowInfo = {
    /**
     * Run identifier returned by the AI workflow start endpoint.
     */
    runId?: string;
    /**
     * Latest known workflow status (e.g. RUNNING, SUCCESS, ...).
     */
    status?: DashboardSummaryWorkflowStatus | "AWAITING_REFRESH";
    /**
     * Timestamp (ms) when workflow was started.
     */
    startedAt?: number;
    /**
     * Timestamp (ms) when status was last updated.
     */
    updatedAt?: number;
};

/**
 * @internal
 */
export type DashboardSummaryWorkflowState = {
    byDashboardId: Record<string, DashboardSummaryWorkflowInfo>;
};

export const dashboardSummaryWorkflowInitialState: DashboardSummaryWorkflowState = {
    byDashboardId: {},
};
