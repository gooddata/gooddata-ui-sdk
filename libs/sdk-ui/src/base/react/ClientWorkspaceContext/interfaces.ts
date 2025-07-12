// (C) 2019-2025 GoodData Corporation
import { ReactNode } from "react";

/**
 * Resolved LCM identifiers of the workspace.
 *
 * @alpha
 */
export interface IClientWorkspaceIdentifiers {
    /**
     * Data product identifier.
     */
    dataProduct?: string;

    /**
     * Client identifier.
     */
    client?: string;

    /**
     * Segment identifier.
     */
    segment?: string;

    /**
     * Workspace identifier.
     */
    workspace?: string;

    /**
     * React children
     */
    children?: ReactNode;
}

/**
 * @internal
 */
export interface IClientWorkspaceStatus {
    isInitialized: boolean;
}
