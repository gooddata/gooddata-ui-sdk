// (C) 2019 GoodData Corporation

/**
 * This query service provides access to feature flags that are in effect for particular workspace.
 *
 * @public
 */
export interface IWorkspaceSettingsService {
    /**
     * Asynchronously queries actual feature flags.
     */
    query(): Promise<IWorkspaceSettings>;
}

/**
 * Settings for particular workspace.
 *
 * @public
 */
export interface IWorkspaceSettings {
    /**
     * Workspace to which the settings belong.
     */
    workspace: string;

    /**
     * Key-value mapping.
     *
     * TODO: SDK8: improve this; key-value mapping is insufficient in a world, where we need to
     *   have platform agnostic settings (and each platform may name them differently). we should
     *   have the platform-agnostic settings enumerated and everything else falls backs into the k-v map
     *   we should do this when we integrate SDK8 into AD and KD
     */
    [key: string]: number | boolean | string;
}
