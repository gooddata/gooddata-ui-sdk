// (C) 2019-2022 GoodData Corporation

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
    children?: React.ReactNode;
}

/**
 * @internal
 */
export interface IClientWorkspaceStatus {
    isInitialized: boolean;
}
