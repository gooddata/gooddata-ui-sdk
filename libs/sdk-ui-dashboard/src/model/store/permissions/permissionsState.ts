// (C) 2021 GoodData Corporation

import { IWorkspacePermissions } from "@gooddata/sdk-backend-spi";

/**
 * @alpha
 */
export interface PermissionsState {
    permissions?: IWorkspacePermissions;
}

export const permissionsInitialState: PermissionsState = { permissions: undefined };
