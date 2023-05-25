// (C) 2021-2022 GoodData Corporation
import React from "react";
import {
    LoadingComponent as DefaultLoading,
    useClientWorkspaceStatus,
    useClientWorkspaceIdentifiers,
    useClientWorkspaceInitialized,
} from "@gooddata/sdk-ui";
import { IDashboardProps } from "./types.js";
import { DashboardRenderer } from "./components/DashboardRenderer.js";

/**
 * @internal
 */
export const Dashboard: React.FC<IDashboardProps> = (props: IDashboardProps) => {
    const workspaceStatus = useClientWorkspaceStatus();
    const clientWsIdentifiers = useClientWorkspaceIdentifiers();
    const isClientWorkspaceInitialized = useClientWorkspaceInitialized();

    if (!isClientWorkspaceInitialized) {
        return <DashboardRenderer {...props} />;
    }

    const LoadingComponent = props.LoadingComponent ?? DefaultLoading;

    /**
     * Show loading indicator if the client workspace is loading and the workspace
     * is not defined.
     */
    if (workspaceStatus !== "success") {
        return <LoadingComponent />;
    }

    return <DashboardRenderer workspace={clientWsIdentifiers.workspace} {...props} />;
};
