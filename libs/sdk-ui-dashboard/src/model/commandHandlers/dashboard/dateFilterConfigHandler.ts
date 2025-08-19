// (C) 2023-2025 GoodData Corporation
import { batchActions } from "redux-batched-actions";
import { SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";

import { SetDashboardDateFilterConfigMode } from "../../commands/index.js";
import { dateFilterConfigActions } from "../../store/dateFilterConfig/index.js";
import { DashboardContext } from "../../types/commonTypes.js";

export function* setDashboardDateFilterConfigModeHandler(
    _ctx: DashboardContext,
    cmd: SetDashboardDateFilterConfigMode,
): SagaIterator<void> {
    const { mode } = cmd.payload;

    yield put(batchActions([dateFilterConfigActions.setDateFilterConfigMode(mode)]));
}
