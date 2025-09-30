// (C) 2025 GoodData Corporation

import { ReactNode } from "react";

import { BackendProvider, WorkspaceProvider, useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { DashboardStoreProvider, IDashboardStoreProviderProps } from "../../model/index.js";

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
