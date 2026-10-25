// (C) 2022-2026 GoodData Corporation

import { call, select, takeEvery } from "redux-saga/effects";

import { logOpenDescriptionTooltip } from "../../services/telemetry/tracking_events.js";
import { type IAppState } from "../../store/types.js";

import {
    DescriptionTooltipUiActionTypeKeys,
    type IDescriptionTooltipOpenedAction,
} from "./description_tooltip_ui_actions.js";

export function* handleDescriptionTooltipOpened(action: IDescriptionTooltipOpenedAction) {
    const state: IAppState = yield select();
    yield call(logOpenDescriptionTooltip, { state, description: action.payload.description });
}

export function* watchDescriptionTooltip() {
    yield takeEvery(
        DescriptionTooltipUiActionTypeKeys.UI_DESCRIPTION_TOOLTIP_OPENED,
        handleDescriptionTooltipOpened,
    );
}
