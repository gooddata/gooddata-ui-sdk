// (C) 2021-2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { DashboardContext } from "../../../types/commonTypes.js";
import { InitializeDashboard } from "../../../commands/dashboard.js";
import { PromiseFnReturnType } from "../../../types/sagas.js";
import { call } from "redux-saga/effects";
import { IWorkspacePermissions } from "@gooddata/sdk-model";

function loadPermissionsFromBackend(ctx: DashboardContext): Promise<IWorkspacePermissions> {
    const { backend, workspace } = ctx;

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
