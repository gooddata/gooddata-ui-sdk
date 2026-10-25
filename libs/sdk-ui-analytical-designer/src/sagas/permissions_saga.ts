// (C) 2020-2026 GoodData Corporation

import { type SagaReturnType, call, put, takeEvery } from "redux-saga/effects";

import {
    workspacePermissionsError,
    workspacePermissionsRequest,
    workspacePermissionsSuccess,
} from "../actions/permissions_actions.js";
import { backend } from "../backend.js";
import { logError } from "../utils/logging/error_logging.js";

export function* workspacePermissions({
    payload: { workspaceId },
}: ReturnType<typeof workspacePermissionsRequest>) {
    const loadWorkspacePermissions = backend.workspace(workspaceId).permissions();

    try {
        const workspacePermissions: SagaReturnType<
            typeof loadWorkspacePermissions.getPermissionsForCurrentUser
        > = yield call([loadWorkspacePermissions, loadWorkspacePermissions.getPermissionsForCurrentUser]);

        yield put(workspacePermissionsSuccess(workspaceId, workspacePermissions));
    } catch (err) {
        logError("Error while obtaining user's permissions", err);

        yield put(workspacePermissionsError(workspaceId, err));
    }
}

export function* watchPermissions() {
    yield takeEvery(workspacePermissionsRequest.match, workspacePermissions);
}
