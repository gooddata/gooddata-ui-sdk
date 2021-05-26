// (C) 2021 GoodData Corporation

import { IWorkspacePermissions } from "@gooddata/sdk-backend-spi";

/**
 * @internal
 */
export interface PermissionsState {
    permissions?: IWorkspacePermissions;
}

export const permissionsInitialState: PermissionsState = { permissions: undefined };
