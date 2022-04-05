// (C) 2020-2022 GoodData Corporation
import { ISeparators, ISettings } from "@gooddata/sdk-model";

/**
 * Settings for particular user.
 *
 * @public
 */
export interface IUserSettings extends ISettings {
    /**
     * User to which the settings belong.
     */
    userId: string;

    /**
     * User locale
     */
    locale: string;

    /**
     * Regional number formatting
     */
    separators: ISeparators;
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

/**
 * Settings for particular combination of user and workspace.
 *
 * @public
 */
export interface IUserWorkspaceSettings extends IUserSettings, IWorkspaceSettings {}
