// (C) 2021-2022 GoodData Corporation

import { IWorkspacePermissions } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export interface PermissionsState {
    permissions?: IWorkspacePermissions;
}

export const permissionsInitialState: PermissionsState = { permissions: undefined };
