// (C) 2022-2026 GoodData Corporation

import { useContext } from "react";

import { type IUserWorkspaceSettings, type IWorkspacePermissions } from "@gooddata/sdk-model";

import { PermissionsContext } from "./PermissionsContext.js";

export function usePermissions(): {
    loading: boolean;
    permissions: Partial<IWorkspacePermissions>;
    settings: Partial<IUserWorkspaceSettings>;
} {
    return useContext(PermissionsContext);
}
