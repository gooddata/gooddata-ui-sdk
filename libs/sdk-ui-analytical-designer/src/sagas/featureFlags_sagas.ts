// (C) 2019-2026 GoodData Corporation

import { type SagaReturnType, call, put, takeEvery } from "redux-saga/effects";

import {
    featureFlagsError,
    featureFlagsRequest,
    setFeatureFlagsItems,
} from "../actions/featureFlags_actions.js";
import { getUserProjectConfigs as apiGetUserProjectConfigs, getUserConfigs } from "../utils/api.js";
import { logError } from "../utils/logging/error_logging.js";

export function* getUserProjectFeatureFlags({
    payload: { workspaceId },
}: ReturnType<typeof featureFlagsRequest>) {
    try {
        const configs:
            | SagaReturnType<typeof apiGetUserProjectConfigs>
            | SagaReturnType<typeof getUserConfigs> = yield workspaceId
            ? call(apiGetUserProjectConfigs, workspaceId)
            : call(getUserConfigs);

        yield put(setFeatureFlagsItems(configs));
    } catch (err) {
        logError("Error while reading platform settings", err);

        yield put(featureFlagsError(workspaceId, err));
    }
}

export function* watchFeatureFlags() {
    yield takeEvery(featureFlagsRequest.match, getUserProjectFeatureFlags);
}
