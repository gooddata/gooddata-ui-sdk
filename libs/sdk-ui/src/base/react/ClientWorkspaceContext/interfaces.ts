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
}

/**
 * @internal
 */
export interface IClientWorkspaceStatus {
    isInitialized: boolean;
}
