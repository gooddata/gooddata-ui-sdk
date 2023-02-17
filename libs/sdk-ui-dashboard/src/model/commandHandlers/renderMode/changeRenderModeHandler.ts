// (C) 2021-2023 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, select, SagaReturnType } from "redux-saga/effects";
import { batchActions } from "redux-batched-actions";
import { DashboardContext } from "../../types/commonTypes";
import { ChangeRenderMode, resetDashboard as resetDashboardCommand } from "../../commands";
import { DashboardRenderModeChanged } from "../../events";
import { renderModeChanged } from "../../events/renderMode";
import { renderModeActions } from "../../store/renderMode";
import { selectDashboardEditModeDevRollout } from "../../store/config/configSelectors";
import { resetDashboardRuntime } from "../dashboard/resetDashboardHandler";
import { validateDrills } from "../common/validateDrills";
import { selectAllAnalyticalWidgets } from "../../store/layout/layoutSelectors";
import { validateDrillToCustomUrlParams } from "../common/validateDrillToCustomUrlParams";
import { isInsightWidget } from "@gooddata/sdk-model";
import { loadInaccessibleDashboards } from "../dashboard/initializeDashboardHandler/loadInaccessibleDashboards";

export function* changeRenderModeHandler(
    ctx: DashboardContext,
    cmd: ChangeRenderMode,
): SagaIterator<DashboardRenderModeChanged> {
    const {
        payload: { renderMode, renderModeChangeOptions },
        correlationId,
    } = cmd;

    const editModeEnabled = yield select(selectDashboardEditModeDevRollout);

    if (renderMode === "view" || editModeEnabled) {
        //we need reset dashboard and widgets first, change edit mode force visualizations to re-execute.
        //To avoid sending DashboardWidgetExecutionSucceeded or DashboardWidgetExecutionFailed events
        //for discarded widgets must be sanitization done before mode changed.
        if (renderModeChangeOptions.resetDashboard) {
            const data: SagaReturnType<typeof resetDashboardRuntime> = yield call(
                resetDashboardRuntime,
                ctx,
                resetDashboardCommand(correlationId),
            );
            yield put(batchActions([data.batch, renderModeActions.setRenderMode(renderMode), data.reset]));
        } else {
            yield put(batchActions([renderModeActions.setRenderMode(renderMode)]));
        }

        if (renderMode === "edit") {
            const widgets: ReturnType<typeof selectAllAnalyticalWidgets> = yield select(
                selectAllAnalyticalWidgets,
            );
            yield call(loadInaccessibleDashboards, ctx, widgets);
            yield call(validateDrills, ctx, cmd, widgets);
            yield call(validateDrillToCustomUrlParams, widgets.filter(isInsightWidget));
        }

        return renderModeChanged(ctx, renderMode, correlationId);
    } else {
        return renderModeChanged(ctx, "view", correlationId);
    }
}
