// (C) 2021-2025 GoodData Corporation
import React, { useMemo } from "react";
import {
    LoadingComponent as DefaultLoading,
    useClientWorkspaceStatus,
    useClientWorkspaceIdentifiers,
    useClientWorkspaceInitialized,
    useBackendWithCorrelation,
} from "@gooddata/sdk-ui";
import { IDashboardProps } from "./types.js";
import { isDashboard, isIdentifierRef, isUriRef } from "@gooddata/sdk-model";
import { DashboardRenderer } from "./components/DashboardRenderer.js";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

/**
 * @public
 */
export const Dashboard: React.FC<IDashboardProps> = (props: IDashboardProps) => {
    const workspaceStatus = useClientWorkspaceStatus();
    const clientWsIdentifiers = useClientWorkspaceIdentifiers();
    const isClientWorkspaceInitialized = useClientWorkspaceInitialized();
    const backend = useBackendWithDashboardCorrelation(props.backend, props.dashboard);

    if (!isClientWorkspaceInitialized) {
        return <DashboardRenderer {...props} backend={backend} />;
    }

    const LoadingComponent = props.LoadingComponent ?? DefaultLoading;

    /**
     * Show loading indicator if the client workspace is loading and the workspace
     * is not defined.
     */
    if (workspaceStatus !== "success") {
        return <LoadingComponent />;
    }

    return <DashboardRenderer workspace={clientWsIdentifiers.workspace} {...props} backend={backend} />;
};

function useBackendWithDashboardCorrelation(
    backend?: IAnalyticalBackend,
    dashboard?: IDashboardProps["dashboard"],
) {
    const dashboardId = useMemo(() => {
        if (typeof dashboard === "string") {
            return dashboard;
        } else if (isDashboard(dashboard)) {
            return dashboard.identifier;
        } else if (isIdentifierRef(dashboard)) {
            return dashboard.identifier;
        } else if (isUriRef(dashboard)) {
            return dashboard.uri;
        }

        return "__new_dashboard__";
    }, [dashboard]);

    return useBackendWithCorrelation(backend, { dashboardId });
}
