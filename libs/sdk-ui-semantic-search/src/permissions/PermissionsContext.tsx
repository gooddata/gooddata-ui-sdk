// (C) 2022-2025 GoodData Corporation
import React, { createContext, useMemo } from "react";

import { AnalyticalBackendError, IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IWorkspacePermissions } from "@gooddata/sdk-model";

import { useWorkspacePermissions } from "./useWorkspacePermissions.js";
import { emptyWorkspacePermissions } from "./utils.js";

export const PermissionsContext = createContext<{
    loading: boolean;
    permissions: Partial<IWorkspacePermissions>;
    error?: AnalyticalBackendError;
}>({
    loading: true,
    permissions: emptyWorkspacePermissions(),
    error: undefined,
});

export function PermissionsProvider({
    children,
    workspace,
    backend,
}: React.PropsWithChildren<{ workspace?: string; backend?: IAnalyticalBackend }>) {
    const { result, loading, error } = useWorkspacePermissions(backend, workspace);
    const value = useMemo(() => ({ permissions: result, loading, error }), [error, loading, result]);

    return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}
