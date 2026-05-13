// (C) 2020-2026 GoodData Corporation

import { type RemotePluggableApplicationsRegistry } from "../pluggableApplication/index.js";

import { type IFeatureFlags, type IPermanentSettings, type ISeparators } from "./settings.js";

/**
 * Settings are obtained from the backend and are effectively a collection of feature flags or settings with
 * concrete string or numeric value.
 *
 * @remarks
 * Settings are stored and configured on the server and typically allow
 * for a more fine-grained tuning of otherwise unified behavior.
 *
 * @public
 */
export interface ISettings extends IPermanentSettings, IFeatureFlags {
    /**
     * Registered pluggable applications.
     *
     * It is a permanent setting option, but it is lifted into this interface to prevent cyclic dependencies
     * as the RemotePluggableApplicationsRegistry references both IPermanentSettings and IFeatureFlags.
     *
     * @alpha
     */
    registeredPluggableApplications?: RemotePluggableApplicationsRegistry;

    [key: string]: number | boolean | string | object | undefined | null;
}

/**
 * Settings for a particular user.
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
 * Settings for a particular workspace.
 *
 * @public
 */
export interface IWorkspaceSettings extends ISettings {
    /**
     * Workspace to which the settings belong.
     */
    workspace: string;

    /**
     * Stores Mapbox token used for WS
     */
    mapboxToken?: string;

    /**
     * Stores AgGrid token used for WS
     */
    agGridToken?: string;
}

/**
 * Settings for a particular combination of user and workspace.
 *
 * @public
 */
export interface IUserWorkspaceSettings extends IUserSettings, IWorkspaceSettings {}
