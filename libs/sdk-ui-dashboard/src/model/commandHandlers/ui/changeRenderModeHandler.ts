// (C) 2021-2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes";
import { ChangeRenderMode } from "../../commands/ui";
import { DashboardRenderModeChanged, renderModeChanged } from "../../events/ui";
import { uiActions } from "../../store/ui";
import { selectDashboardEditModeDevRollout } from "../../store/config/configSelectors";
import { resetDashboardHandler } from "../dashboard/resetDashboardHandler";
import { resetDashboard as resetDashboardCommand } from "../../commands";

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
        yield put(uiActions.setRenderMode(renderMode));

        if (renderModeChangeOptions.resetDashboard) {
            yield call(resetDashboardHandler, ctx, resetDashboardCommand(correlationId));
        }

        return renderModeChanged(ctx, renderMode, correlationId);
    } else {
        return renderModeChanged(ctx, "view", correlationId);
    }
}
