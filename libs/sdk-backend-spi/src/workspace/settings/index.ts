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
export interface IWorkspaceSettings extends ISettings {
    /**
     * Workspace to which the settings belong.
     */
    workspace: string;
}

/**
 *
 * This enum lists notable settings that should work across implementations of Analytical Backends.
 *
 * @public
 */
export enum SettingCatalog {
    /**
     * Headline component will not be underlined when it is set up with drilling.
     */
    disableKpiDashboardHeadlineUnderline = "disableKpiDashboardHeadlineUnderline",
}

/**
 * Settings are obtained from backend and are effectively a collection of feature flags or settings with
 * concrete string or numeric value. Settings are stored and configured on the server and typically allow
 * for a more fine-grained tuning of otherwise unified behavior.
 *
 * @public
 */
export interface ISettings {
    [key: string]: number | boolean | string;
}
