// (C) 2007-2026 GoodData Corporation

import { cloneDeep, isEmpty } from "lodash-es";
import { type SagaReturnType, call, put, select, takeEvery } from "redux-saga/effects";

import { type IDrillableItemsCommandBody } from "@gooddata/sdk-embedding";
import { DrillablePredicatesUtils } from "@gooddata/sdk-ui-ext/internal";

import { conversionDone, type conversionInit } from "../actions/drillable_items_actions.js";
import { bearLegacyFunctions } from "../bearLegacyFunctions.js";
import { ActionTypeKeys } from "../constants/actions.js";
import { getProjectId } from "../selectors/bootstrap_selector.js";
import { logDrillableItemsReceived } from "../services/telemetry/tracking_events.js";
import { type IAppState } from "../store/types.js";

function isDrillByUri(command: IDrillableItemsCommandBody) {
    return !isEmpty(command.uris) || !isEmpty(command.composedFrom?.uris);
}

export function* convertDrillableItems(action: ReturnType<typeof conversionInit>) {
    const state: IAppState = yield select();
    const projectId: ReturnType<typeof getProjectId> = yield select(getProjectId);

    yield call(logDrillableItemsReceived, { state });

    const sanitizedPostMessageData: SagaReturnType<
        typeof bearLegacyFunctions.sanitizeDrillingActivationPostMessageData
    > = yield call(bearLegacyFunctions.sanitizeDrillingActivationPostMessageData, projectId, action.payload);

    const postMessageData = cloneDeep(sanitizedPostMessageData);
    if (isDrillByUri(sanitizedPostMessageData)) {
        console.error("Tiger does not support uris for drilling, please use identifiers instead.");
        if (postMessageData.composedFrom?.uris) {
            delete postMessageData.composedFrom.uris;
        }
        if (postMessageData.uris) {
            delete postMessageData.uris;
        }
    }

    const drillablePredicates: SagaReturnType<
        typeof DrillablePredicatesUtils.convertPostMessageToDrillablePredicates
    > = yield call(DrillablePredicatesUtils.convertPostMessageToDrillablePredicates, postMessageData);

    yield put(conversionDone(drillablePredicates));
}

export function* watchDrillableItems() {
    yield takeEvery(ActionTypeKeys.CONVERT_DRILLABLE_ITEMS, convertDrillableItems);
}
