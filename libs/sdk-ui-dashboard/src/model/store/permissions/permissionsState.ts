// (C) 2021-2023 GoodData Corporation

import { IWorkspacePermissions } from "@gooddata/sdk-model";

/**
 * @public
 */
export interface PermissionsState {
    permissions?: IWorkspacePermissions;
}

export const permissionsInitialState: PermissionsState = { permissions: undefined };
