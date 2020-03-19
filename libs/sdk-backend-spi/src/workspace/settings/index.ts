// (C) 2019-2020 GoodData Corporation
import { ISettings } from "../../common/settings";

/**
 * This query service provides access to feature flags that are in effect for particular workspace.
 *
 * @public
 */
export interface IWorkspaceSettingsService {
    /**
     * Asynchronously queries actual feature flags.
     *
     * @returns promise of workspace settings
     */
    query(): Promise<IWorkspaceSettings>;
}

/**
 * Settings for particular workspace.
 *
 * @public
 */
export interface IWorkspaceSettings extends ISettings {
    /**
     * Workspace to which the settings belong.
     */
    workspace: string;
}
