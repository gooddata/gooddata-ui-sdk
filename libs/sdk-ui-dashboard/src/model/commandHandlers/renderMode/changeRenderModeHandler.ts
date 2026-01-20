// (C) 2021-2026 GoodData Corporation

import { batchActions } from "redux-batched-actions";
import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, call, put, select } from "redux-saga/effects";

import { isInsightWidget } from "@gooddata/sdk-model";

import { type IChangeRenderMode, resetDashboard as resetDashboardCommand } from "../../commands/index.js";
import { type IDashboardRenderModeChanged } from "../../events/index.js";
import { renderModeChanged } from "../../events/renderMode.js";
import { renderModeActions } from "../../store/renderMode/index.js";
import { clearShowWidgetAsTable } from "../../store/showWidgetAsTable/index.js";
import { selectAllAnalyticalWidgets } from "../../store/tabs/layout/layoutSelectors.js";
import { uiActions } from "../../store/ui/index.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { validateDrills } from "../common/validateDrills.js";
import { validateDrillToCustomUrlParams } from "../common/validateDrillToCustomUrlParams.js";
import { loadInaccessibleDashboards } from "../dashboard/initializeDashboardHandler/loadInaccessibleDashboards.js";
import { resetDashboardRuntime } from "../dashboard/resetDashboardHandler.js";

export function* changeRenderModeHandler(
    ctx: DashboardContext,
    cmd: IChangeRenderMode,
): SagaIterator<IDashboardRenderModeChanged> {
    const {
        payload: { renderMode, renderModeChangeOptions },
        correlationId,
    } = cmd;

    // Reset dashboard and widgets first, as changing the edit mode forces visualizations to re-execute.
    // To avoid sending DashboardWidgetExecutionSucceeded or DashboardWidgetExecutionFailed events
    // for discarded widgets, sanitization must be done before the mode is changed.
    if (renderModeChangeOptions.resetDashboard) {
        const data: SagaReturnType<typeof resetDashboardRuntime> = yield call(
            resetDashboardRuntime,
            ctx,
            resetDashboardCommand(correlationId),
        );
        yield put(
            batchActions([
                data.batch,
                uiActions.resetInvalidDrillWidgetRefs(),
                // Clear all widgets set to show as table
                clearShowWidgetAsTable(),
                uiActions.resetAllInvalidCustomUrlDrillParameterWidgetsWarnings(),
                renderModeActions.setRenderMode(renderMode),
            ]),
        );
        yield put(data.reset);
    } else {
        yield put(
            batchActions([
                uiActions.resetInvalidDrillWidgetRefs(),
                clearShowWidgetAsTable(),
                uiActions.resetAllInvalidCustomUrlDrillParameterWidgetsWarnings(),
                renderModeActions.setRenderMode(renderMode),
            ]),
        );
    }

    if (renderMode === "edit") {
        const widgets: ReturnType<typeof selectAllAnalyticalWidgets> =
            yield select(selectAllAnalyticalWidgets);
        yield call(loadInaccessibleDashboards, ctx, widgets);
        yield call(validateDrills, ctx, cmd, widgets);
        yield call(validateDrillToCustomUrlParams, widgets.filter(isInsightWidget));
    }

    return renderModeChanged(ctx, renderMode, correlationId);
}
