// (C) 2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, delay, put, select, takeEvery } from "redux-saga/effects";

import { type IWorkspaceDashboardsService } from "@gooddata/sdk-backend-spi";
import { type IDashboardLayout } from "@gooddata/sdk-model";

import { hasMacroInLayout, isDashboardSummaryWorkflowStatus } from "./dashboardSummaryWorkflowUtils.js";
import { type DashboardSaved } from "../../events/dashboard.js";
import { newDashboardEventPredicate } from "../../events/index.js";
import { accessibleDashboardsActions } from "../../store/accessibleDashboards/index.js";
import { DASHBOARD_SUMMARY_MACRO } from "../../store/dashboardSummaryWorkflow/constants.js";
import { selectDashboardSummaryWorkflowInfoByDashboardId } from "../../store/dashboardSummaryWorkflow/dashboardSummaryWorkflowSelectors.js";
import { dashboardSummaryWorkflowActions } from "../../store/dashboardSummaryWorkflow/index.js";
import { listedDashboardsActions } from "../../store/listedDashboards/index.js";
import { selectBasicLayout } from "../../store/tabs/layout/layoutSelectors.js";
import { selectTabs } from "../../store/tabs/tabsSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function newDashboardSummaryWorkflowWorker() {
    return function* dashboardSummaryWorkflowWorker(ctx: DashboardContext): SagaIterator<void> {
        // Wait for init so selectors are usable
        yield takeEvery(
            newDashboardEventPredicate("GDC.DASH/EVT.SAVED"),
            function* onDashboardSaved(event: DashboardSaved): SagaIterator<void> {
                yield call(handleDashboardSaved, ctx, event);
            },
        );
    };
}

function* handleDashboardSaved(ctx: DashboardContext, event: DashboardSaved): SagaIterator<void> {
    const dashboardId: string = event.payload.dashboard.identifier;

    const hasSummaryMacro: boolean = yield call(selectHasSummaryMacro);
    if (!hasSummaryMacro) {
        yield put(dashboardSummaryWorkflowActions.reset({ dashboardId }));
        return;
    }

    const dashboardsService = ctx.backend.workspace(ctx.workspace).dashboards();

    const startWorkflow = dashboardsService.startDashboardSummaryWorkflow?.bind(dashboardsService);

    if (!startWorkflow) {
        // Backend does not support this tiger-specific extension - keep behavior deterministic.
        yield put(dashboardSummaryWorkflowActions.statusUpdated({ dashboardId, status: "FAILED" }));
        return;
    }

    yield put(dashboardSummaryWorkflowActions.startRequested({ dashboardId }));

    let started: Awaited<ReturnType<typeof startWorkflow>>;
    try {
        started = yield call(startWorkflow, dashboardId);
    } catch {
        // Best-effort: do not break dashboard UX
        yield put(dashboardSummaryWorkflowActions.reset({ dashboardId }));
        return;
    }

    if (!started?.runId || !started?.status) {
        yield put(dashboardSummaryWorkflowActions.reset({ dashboardId }));
        return;
    }

    yield put(
        dashboardSummaryWorkflowActions.started({
            dashboardId,
            runId: started.runId,
            status: started.status,
        }),
    );

    if (started.status === "RUNNING") {
        yield call(pollUntilNotRunning, dashboardsService, dashboardId, started.runId);
    }

    // After completion (SUCCESS or otherwise), reload listed dashboards so the latest summary is available.
    yield call(refreshDashboardsList, ctx);

    const workflowInfo = yield select(selectDashboardSummaryWorkflowInfoByDashboardId(dashboardId));

    if (workflowInfo?.status === "AWAITING_REFRESH") {
        yield put(
            dashboardSummaryWorkflowActions.statusUpdated({
                dashboardId,
                status: "COMPLETED",
            }),
        );
    }
}

function* pollUntilNotRunning(
    dashboardsService: IWorkspaceDashboardsService,
    dashboardId: string,
    runId: string,
): SagaIterator<void> {
    const timeoutMs = 5 * 60 * 1000; // 5 minutes
    const delayMs = 3000;
    const startedAt = Date.now();

    const getStatus = dashboardsService.getDashboardSummaryWorkflowStatus?.bind(dashboardsService);
    if (!getStatus) {
        // Cannot poll, clear state so UI does not stay in "generating shortly" forever.
        yield put(dashboardSummaryWorkflowActions.reset({ dashboardId }));
        return;
    }

    while (Date.now() - startedAt < timeoutMs) {
        let statusResult: Awaited<ReturnType<typeof getStatus>>;
        try {
            statusResult = yield call(getStatus, runId);
        } catch {
            // Polling stopped unexpectedly, clear state so UI falls back to "reload please".
            yield put(dashboardSummaryWorkflowActions.reset({ dashboardId }));
            return;
        }

        const status = statusResult?.status;
        if (!isDashboardSummaryWorkflowStatus(status)) {
            // Unexpected response - do not keep RUNNING in state indefinitely.
            yield put(dashboardSummaryWorkflowActions.reset({ dashboardId }));
            return;
        }

        yield put(
            dashboardSummaryWorkflowActions.statusUpdated({
                dashboardId,
                status: status === "COMPLETED" ? "AWAITING_REFRESH" : status,
            }),
        );

        if (status !== "RUNNING") {
            return;
        }

        yield delay(delayMs);
    }

    // Timeout reached while backend still reports RUNNING (or we couldn't observe completion).
    // Clear workflow state so UI falls back to the non-misleading "reload to see the result" message.
    yield put(dashboardSummaryWorkflowActions.reset({ dashboardId }));
}

function* refreshDashboardsList(ctx: DashboardContext): SagaIterator<void> {
    const loader = ctx.backend.workspace(ctx.workspace).dashboards();
    const dashboards = yield call([loader, loader.getDashboards]);

    yield put(listedDashboardsActions.setListedDashboards(dashboards));
    yield put(accessibleDashboardsActions.setAccessibleDashboards(dashboards));
}

function* selectHasSummaryMacro(): SagaIterator<boolean> {
    const rootLayout: ReturnType<typeof selectBasicLayout> = yield select(selectBasicLayout);
    const tabs: ReturnType<typeof selectTabs> = yield select(selectTabs);

    const isSummaryInRoot = hasMacroInLayout(rootLayout, DASHBOARD_SUMMARY_MACRO);

    if (isSummaryInRoot) {
        return true;
    }

    return (tabs ?? []).some((tab) => {
        return hasMacroInLayout(
            tab.layout?.layout as IDashboardLayout<unknown> | undefined,
            DASHBOARD_SUMMARY_MACRO,
        );
    });
}
