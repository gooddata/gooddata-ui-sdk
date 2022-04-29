// (C) 2021-2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes";
import { ChangeRenderMode } from "../../commands/ui";
import { DashboardRenderModeChanged, renderModeChanged } from "../../events/ui";
import { uiActions } from "../../store/ui";
import { selectDashboardEditModeDevRollout } from "../../store/config/configSelectors";

export function* changeRenderModeHandler(
    ctx: DashboardContext,
    cmd: ChangeRenderMode,
): SagaIterator<DashboardRenderModeChanged> {
    const {
        payload: { renderMode },
        correlationId,
    } = cmd;

    const editModeEnabled = yield select(selectDashboardEditModeDevRollout);

    if (renderMode === "view" || editModeEnabled) {
        yield put(uiActions.setRenderMode(renderMode));
        return renderModeChanged(ctx, renderMode, correlationId);
    } else {
        return renderModeChanged(ctx, "view", correlationId);
    }
}
