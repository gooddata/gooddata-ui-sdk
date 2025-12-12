// (C) 2021-2025 GoodData Corporation
import { type SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";

import { type IWorkspacePermissions } from "@gooddata/sdk-model";

import { type InitializeDashboard } from "../../../commands/dashboard.js";
import { type DashboardContext } from "../../../types/commonTypes.js";
import { type PromiseFnReturnType } from "../../../types/sagas.js";

function loadPermissionsFromBackend({
    backend,
    workspace,
}: DashboardContext): Promise<IWorkspacePermissions> {
    return backend.workspace(workspace).permissions().getPermissionsForCurrentUser();
}

export function* resolvePermissions(
    ctx: DashboardContext,
    cmd: InitializeDashboard,
): SagaIterator<IWorkspacePermissions> {
    const { permissions } = cmd.payload;

    if (permissions) {
        return permissions;
    }

    const result: PromiseFnReturnType<typeof loadPermissionsFromBackend> = yield call(
        loadPermissionsFromBackend,
        ctx,
    );

    return result;
}
