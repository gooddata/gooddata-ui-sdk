// (C) 2025-2026 GoodData Corporation

import { type ReactNode } from "react";

import { BackendProvider, WorkspaceProvider, useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { DashboardStoreProvider } from "../../model/react/DashboardStoreProvider.js";
import { type IDashboardStoreProviderProps } from "../../model/react/types.js";

export function KdaStoreProvider({
    children,
    ...store
}: IDashboardStoreProviderProps & { children: ReactNode }) {
    const backend = useBackendStrict(store.backend);
    const workspace = useWorkspaceStrict(store.workspace);

    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={workspace}>
                <DashboardStoreProvider {...store}>{children}</DashboardStoreProvider>
            </WorkspaceProvider>
        </BackendProvider>
    );
}
