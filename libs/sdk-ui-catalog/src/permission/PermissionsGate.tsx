// (C) 2025 GoodData Corporation

import type { PropsWithChildren, ReactNode } from "react";

import { usePermissionsState } from "./PermissionsContext.js";

type Props = PropsWithChildren<{
    /**
     * A node to render when the permissions are still being fetched.
     */
    loadingNode: ReactNode;
    /**
     * A node to render when an error occurs while fetching permissions.
     */
    errorNode: ReactNode;
    /**
     * A node to render when the user does not have access to the catalog.
     */
    unauthorizedNode: ReactNode;
}>;

export function PermissionsGate({ loadingNode, errorNode, unauthorizedNode, children }: Props) {
    const { result: permissions, status } = usePermissionsState();

    if (status === "pending" || status === "loading") {
        return <>{loadingNode}</>;
    }

    if (status === "error") {
        return <>{errorNode}</>;
    }

    // WS.Analyze and above can access the catalog
    const canAnalyzeWorkspace = permissions?.permissions?.canCreateVisualization;
    if (!canAnalyzeWorkspace) {
        return <>{unauthorizedNode}</>;
    }

    return <>{children}</>;
}
