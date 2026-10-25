// (C) 2020-2026 GoodData Corporation

import { call, select, takeEvery } from "redux-saga/effects";

import { DrillActionTypeKeys, type IDrillPerformedAction } from "../actions/drill_actions.js";
import { getIsEmbedded } from "../selectors/meta_selector.js";
import { type IAppState } from "../store/types.js";

import { drillPerformed as drillPerformedEvent } from "./../postMessageApi/outgoing/drill_events.js";

export function* drillPerformed(action: IDrillPerformedAction) {
    const { drillEvent } = action.payload;

    const appState: IAppState = yield select();
    const isEmbedded: ReturnType<typeof getIsEmbedded> = yield call(getIsEmbedded, appState);

    if (isEmbedded) {
        yield call(drillPerformedEvent, drillEvent);
    }
}

export function* drillWatcher() {
    yield takeEvery(DrillActionTypeKeys.UI_DRILL_PERFORMED, drillPerformed);
}
