// (C) 2022-2026 GoodData Corporation

import { call, select, takeEvery } from "redux-saga/effects";

import { canManageProject } from "../../selectors/permissions_selector.js";
import {
    logPoweredByGDClickedAdmin,
    logPoweredByGDClickedNonAdmin,
} from "../../services/telemetry/tracking_events.js";
import { type IAppState } from "../../store/types.js";

import { PoweredByGDCUiActionTypeKeys } from "./powered_by_gdc_ui_actions.js";

export function* handlePoweredByGDCClicked() {
    const state: IAppState = yield select();
    const canManageProjects = canManageProject(state);

    if (canManageProjects) {
        yield call(logPoweredByGDClickedAdmin, { state });
    } else {
        yield call(logPoweredByGDClickedNonAdmin, { state });
    }
}

export function* watchPoweredByGDC() {
    yield takeEvery(PoweredByGDCUiActionTypeKeys.UI_POWERED_BY_GDC_CLICKED, handlePoweredByGDCClicked);
}
