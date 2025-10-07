// (C) 2021-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";

import { IWorkspacePermissions } from "@gooddata/sdk-model";

import { InitializeDashboard } from "../../../commands/dashboard.js";
import { DashboardContext } from "../../../types/commonTypes.js";
import { PromiseFnReturnType } from "../../../types/sagas.js";

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
