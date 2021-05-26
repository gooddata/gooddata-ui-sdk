// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { LoadDashboard } from "../../commands/dashboard";
import { PromiseFnReturnType } from "../../types/sagas";
import { call } from "redux-saga/effects";
import { IWorkspacePermissions } from "@gooddata/sdk-backend-spi";

function loadPermissionsFromBackend(ctx: DashboardContext): Promise<IWorkspacePermissions> {
    const { backend, workspace } = ctx;

    return backend.workspace(workspace).permissions().getPermissionsForCurrentUser();
}

export function* loadPermissions(ctx: DashboardContext, cmd: LoadDashboard) {
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
