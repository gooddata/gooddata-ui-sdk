// (C) 2022-2026 GoodData Corporation

import { type PropsWithChildren, createContext, useContext, useMemo } from "react";

import { type AnalyticalBackendError, type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type ISettings, type IUserWorkspaceSettings, type IWorkspacePermissions } from "@gooddata/sdk-model";

import { useWorkspacePermissions } from "./useWorkspacePermissions.js";
import { useWorkspaceSettings } from "./useWorkspaceSettings.js";
import { emptyWorkspacePermissions } from "./utils.js";

export const PermissionsContext = createContext<{
    loading: boolean;
    permissions: Partial<IWorkspacePermissions>;
    settings: Partial<IUserWorkspaceSettings>;
    error?: AnalyticalBackendError;
}>({
    loading: true,
    permissions: emptyWorkspacePermissions(),
    settings: {},
    error: undefined,
});

export function PermissionsProvider({
    children,
    workspace,
    backend,
}: PropsWithChildren<{ workspace?: string; backend?: IAnalyticalBackend }>) {
    const {
        result: permissions,
        loading: permissionsLoading,
        error,
    } = useWorkspacePermissions(backend, workspace);
    const { result: settings, loading: settingsLoading } = useWorkspaceSettings(backend, workspace);

    const loading = permissionsLoading || settingsLoading;
    const value = useMemo(
        () => ({ permissions, settings, loading, error }),
        [permissions, settings, loading, error],
    );

    return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

export function useFeatureFlags(): Partial<IUserWorkspaceSettings> {
    return useContext(PermissionsContext).settings;
}

export function useFeatureFlag(flag: keyof ISettings): boolean {
    const flags = useFeatureFlags();
    return Boolean(flags?.[flag]);
}
