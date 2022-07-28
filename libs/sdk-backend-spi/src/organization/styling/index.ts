// (C) 2022 GoodData Corporation

import { IThemeMetadataObject, ObjRef } from "@gooddata/sdk-model";

/**
 * This service provides access to organization styling settings such as theme.
 *
 * @public
 */
export interface IOrganizationStylingService {
    /**
     * Request all themes defined on organization level.
     *
     * @returns promise of array of theme metadata objects
     */
    getThemes(): Promise<IThemeMetadataObject[]>;

    /**
     * Request active theme setting from organization.
     *
     * @returns promise of theme object reference
     */
    getActiveTheme(): Promise<ObjRef | undefined>;

    /**
     * Set active theme setting in organization.
     *
     * @param themeRef - active theme reference
     * @returns promise
     */
    setActiveTheme(themeRef: ObjRef): Promise<void>;

    /**
     * Clear active theme setting from organization.
     *
     * @returns promise
     */
    clearActiveTheme(): Promise<void>;
}
