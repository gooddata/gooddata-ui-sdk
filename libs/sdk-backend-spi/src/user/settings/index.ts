// (C) 2020-2026 GoodData Corporation

import { type ISeparators, type ObjRef } from "@gooddata/sdk-model";

import { type IUserSettings } from "../../common/settings.js";

/**
 * This query service provides access to feature flags that are in effect for particular user.
 *
 * @public
 */
export interface IUserSettingsService {
    /**
     * Asynchronously queries actual feature flags.
     *
     * @returns promise of the feature flags of the current user
     */
    getSettings(): Promise<IUserSettings>;

    /**
     * Set locale for the current user
     *
     * @param locale - IETF BCP 47 Code locale ID, for example "en-US", "cs-CZ", etc.
     *
     * @returns promise
     */
    setLocale(locale: string): Promise<void>;

    /**
     * Set metadata locale for the current user
     *
     * @param locale - IETF BCP 47 Code locale ID, for example "en-US", "cs-CZ", etc.
     *
     * @returns promise
     */
    setMetadataLocale(locale: string): Promise<void>;

    /**
     * Set format locale for the current user
     *
     * @param locale - IETF BCP 47 Code locale ID, for example "en-US", "cs-CZ", etc.
     *
     * @returns promise
     */
    setFormatLocale(locale: string): Promise<void>;

    /**
     * Set separators for the current user
     *
     * @param separators - separators for the current user
     *
     * @returns promise
     */
    setSeparators(separators: ISeparators): Promise<void>;

    /**
     * Set the active theme for the current user. It takes precedence over the active theme of the workspace
     * and of the organization.
     *
     * @param theme - organization theme id, or a reference to an organization theme (untyped or typed
     *  "theme"). A user setting has no workspace, so a reference typed "workspaceTheme" is rejected.
     *
     * @returns promise
     */
    setTheme(theme: string | ObjRef): Promise<void>;

    /**
     * Delete the active theme of the current user, returning to the workspace or organization theme.
     *
     * @returns promise
     */
    deleteTheme(): Promise<void>;

    /**
     * Set the active color palette for the current user. It takes precedence over the active color palette
     * of the workspace and of the organization.
     *
     * @param colorPalette - organization color palette id, or a reference to an organization color palette
     *  (untyped or typed "colorPalette"). A user setting has no workspace, so a reference typed
     *  "workspaceColorPalette" is rejected.
     *
     * @returns promise
     */
    setColorPalette(colorPalette: string | ObjRef): Promise<void>;

    /**
     * Delete the active color palette of the current user, returning to the workspace or organization color
     * palette.
     *
     * @returns promise
     */
    deleteColorPalette(): Promise<void>;
}
