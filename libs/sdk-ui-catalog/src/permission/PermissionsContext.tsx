// (C) 2025-2026 GoodData Corporation

import { type PropsWithChildren, createContext, useContext } from "react";

import type { ISettings, WorkspacePermission } from "@gooddata/sdk-model";

import type { PermissionsState } from "./types.js";

const PermissionsContext = createContext<PermissionsState | undefined>(undefined);

type Props = PropsWithChildren<{
    permissionsState: PermissionsState;
}>;

export function PermissionsProvider({ children, permissionsState }: Props) {
    return <PermissionsContext.Provider value={permissionsState}>{children}</PermissionsContext.Provider>;
}

export function usePermissionsState(): PermissionsState {
    const permissions = useContext(PermissionsContext);
    if (!permissions) {
        throw new Error("PermissionsContext not found");
    }
    return permissions;
}

export function useFeatureFlags(): ISettings | undefined {
    return usePermissionsState().result?.settings;
}

export function useFeatureFlag(flag: keyof ISettings): boolean {
    const flags = useFeatureFlags();
    return Boolean(flags?.[flag]);
}

export function useWorkspacePermission(permission: WorkspacePermission): boolean {
    const { result } = usePermissionsState();
    return Boolean(result?.permissions?.[permission]);
}

export function useIsWhiteLabeled(): boolean {
    // Unlike the hooks above, this reads the context optionally: callers may render
    // outside the provider, where a missing provider means "not white-labeled".
    const settings = useContext(PermissionsContext)?.result?.settings;
    return Boolean(settings?.whiteLabeling?.enabled);
}
