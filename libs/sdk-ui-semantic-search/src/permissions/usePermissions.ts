// (C) 2022-2025 GoodData Corporation
import { IWorkspacePermissions } from "@gooddata/sdk-model";
import { useContext } from "react";

import { PermissionsContext } from "./PermissionsContext.js";

export function usePermissions(): { loading: boolean; permissions: Partial<IWorkspacePermissions> } {
    return useContext(PermissionsContext);
}
