// (C) 2023 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";
import { batchActions } from "redux-batched-actions";

import { DashboardContext } from "../../types/commonTypes.js";
import { SetDashboardDateFilterConfigMode } from "../../commands/index.js";
import { dateFilterConfigActions } from "../../store/dateFilterConfig/index.js";

export function* setDashboardDateFilterConfigModeHandler(
    _ctx: DashboardContext,
    cmd: SetDashboardDateFilterConfigMode,
): SagaIterator<void> {
    const { mode } = cmd.payload;

    yield put(batchActions([dateFilterConfigActions.setDateFilterConfigMode(mode)]));
}
