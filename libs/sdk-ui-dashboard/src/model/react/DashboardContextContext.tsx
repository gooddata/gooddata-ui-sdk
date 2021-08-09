// (C) 2019 GoodData Corporation
import React, { createContext, useContext, useMemo } from "react";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { DashboardContext } from "../types/commonTypes";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

/**
 * @alpha
 */
const DashboardContextContext = createContext<DashboardContext>({} as any);
DashboardContextContext.displayName = "DashboardContextContext";

/**
 * @alpha
 */
export const useDashboardContext = (): DashboardContext => useContext(DashboardContextContext);

/**
 * @internal
 */
export interface IDashboardContextProvider extends Omit<DashboardContext, "backend" | "workspace"> {
    backend?: IAnalyticalBackend;
    workspace?: string;
    children: React.ReactNode;
}

/**
 * @internal
 */
export function DashboardContextProvider(props: IDashboardContextProvider): JSX.Element {
    const {
        children,
        backend: backendFromProps,
        dashboardRef,
        workspace: workspaceFromProps,
        clientId,
        dataProductId,
    } = props;
    const backend = useBackendStrict(backendFromProps);
    const workspace = useWorkspaceStrict(workspaceFromProps);
    const value: DashboardContext = useMemo(
        () => ({
            backend,
            dashboardRef,
            workspace,
            clientId,
            dataProductId,
        }),
        [backend, dashboardRef, workspace, clientId, dataProductId],
    );

    return <DashboardContextContext.Provider value={value}>{children}</DashboardContextContext.Provider>;
}
