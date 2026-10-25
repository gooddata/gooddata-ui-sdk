// (C) 2020-2026 GoodData Corporation

import { call, select, takeEvery } from "redux-saga/effects";

import { type IAppLoadingAction } from "../../actions/app_context_actions.js";
import { ActionTypeKeys } from "../../constants/actions.js";
import { getIsEmbedded } from "../../selectors/meta_selector.js";
import { listeningForDrillableItems } from "../outgoing/drillable_items_events.js";

export function* appReadinessChange(action: IAppLoadingAction) {
    const { isReady } = action.payload;

    const isEmbedded: ReturnType<typeof getIsEmbedded> = yield select(getIsEmbedded);

    if (isReady && isEmbedded) {
        yield call(listeningForDrillableItems);
    }
}

export function* watchEmbeddedReady() {
    yield takeEvery(ActionTypeKeys.APP_READINESS_CHANGE, appReadinessChange);
}
