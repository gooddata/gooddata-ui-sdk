// (C) 2022-2025 GoodData Corporation
import { useContext } from "react";

import { IWorkspacePermissions } from "@gooddata/sdk-model";

import { PermissionsContext } from "./PermissionsContext.js";

export function usePermissions(): { loading: boolean; permissions: Partial<IWorkspacePermissions> } {
    return useContext(PermissionsContext);
}
