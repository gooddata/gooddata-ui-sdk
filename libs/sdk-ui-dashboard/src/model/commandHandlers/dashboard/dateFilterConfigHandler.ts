// (C) 2023-2026 GoodData Corporation

import { batchActions } from "redux-batched-actions";
import { type SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";

import { type ISetDashboardDateFilterConfigMode } from "../../commands/dashboard.js";
import { tabsActions } from "../../store/tabs/index.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* setDashboardDateFilterConfigModeHandler(
    _ctx: DashboardContext,
    cmd: ISetDashboardDateFilterConfigMode,
): SagaIterator<void> {
    const { mode } = cmd.payload;

    yield put(batchActions([tabsActions.setDateFilterConfigMode(mode)]));
}
