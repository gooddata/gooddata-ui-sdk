// (C) 2021-2026 GoodData Corporation

import { type IWorkspacePermissions } from "@gooddata/sdk-model";

/**
 * @public
 */
export type PermissionsState = {
    permissions?: IWorkspacePermissions;
};

export const permissionsInitialState: PermissionsState = { permissions: undefined };
