// (C) 2019-2026 GoodData Corporation

import {
    type IColorPalette,
    type IColorPaletteDefinition,
    type IColorPaletteMetadataObject,
    type ITheme,
    type IThemeDefinition,
    type IThemeMetadataObject,
    type ObjRef,
} from "@gooddata/sdk-model";

/**
 * This service provides access to workspace styling settings such as color palette.
 *
 * @remarks
 * The contract here is that styling settings ARE applied in Analytical Designer and Dashboard applications and
 * so any SDK code that embeds entities created by those applications MUST also use the same styling settings in
 * order to maintain consistent user experience.
 *
 * @public
 */
export interface IWorkspaceStylingService {
    /**
     * Asynchronously returns items in the color palette.
     *
     * @returns promise of color palette
     */
    getColorPalette(): Promise<IColorPalette>;

    /**
     * Asynchronously returns theme.
     *
     * @returns promise of theme
     */
    getTheme(): Promise<ITheme>;

    /**
     * Request active theme setting from workspace.
     *
     * @returns promise of theme object reference
     */
    getActiveTheme(): Promise<ObjRef | undefined>;

    /**
     * Set active theme setting in workspace.
     *
     * @remarks
     * The scope is carried by the reference itself: an `idRef` typed `"workspaceTheme"` activates a
     * workspace-scoped theme, otherwise the theme is treated as organization-scoped. There is no
     * cross-scope fallback when the active setting is later resolved.
     *
     * @param themeRef - active theme reference
     * @returns promise
     */
    setActiveTheme(themeRef: ObjRef): Promise<void>;

    /**
     * Clear active theme setting from workspace.
     *
     * @returns promise
     */
    clearActiveTheme(): Promise<void>;

    /**
     * Request active color palette setting from workspace.
     *
     * @returns promise of color palette object reference
     */
    getActiveColorPalette(): Promise<ObjRef | undefined>;

    /**
     * Set active color palette setting in workspace.
     *
     * @remarks
     * The scope is carried by the reference itself: an `idRef` typed `"workspaceColorPalette"` activates a
     * workspace-scoped color palette, otherwise it is treated as organization-scoped. There is no
     * cross-scope fallback when the active setting is later resolved.
     *
     * @param colorPaletteRef - active color palette reference
     * @returns promise
     */
    setActiveColorPalette(colorPaletteRef: ObjRef): Promise<void>;

    /**
     * Clear active color palette setting from workspace.
     *
     * @returns promise
     */
    clearActiveColorPalette(): Promise<void>;

    /**
     * Request all themes defined on the workspace level.
     *
     * @returns promise of array of theme metadata objects
     */
    getThemes(): Promise<IThemeMetadataObject[]>;

    /**
     * Create a new theme on the workspace level.
     *
     * @param theme - theme definition
     * @returns promise of the created theme metadata object
     */
    createTheme(theme: IThemeDefinition): Promise<IThemeMetadataObject>;

    /**
     * Update an existing theme on the workspace level.
     *
     * @param theme - theme definition
     * @returns promise of the updated theme metadata object
     */
    updateTheme(theme: IThemeDefinition): Promise<IThemeMetadataObject>;

    /**
     * Delete a theme on the workspace level.
     *
     * @param themeRef - theme reference
     * @returns promise
     */
    deleteTheme(themeRef: ObjRef): Promise<void>;

    /**
     * Request all color palettes defined on the workspace level.
     *
     * @returns promise of array of color palette metadata objects
     */
    getColorPalettes(): Promise<IColorPaletteMetadataObject[]>;

    /**
     * Create a new color palette on the workspace level.
     *
     * @param colorPalette - color palette definition
     * @returns promise of the created color palette metadata object
     */
    createColorPalette(colorPalette: IColorPaletteDefinition): Promise<IColorPaletteMetadataObject>;

    /**
     * Update an existing color palette on the workspace level.
     *
     * @param colorPalette - color palette definition
     * @returns promise of the updated color palette metadata object
     */
    updateColorPalette(colorPalette: IColorPaletteDefinition): Promise<IColorPaletteMetadataObject>;

    /**
     * Delete a color palette on the workspace level.
     *
     * @param colorPaletteRef - color palette reference
     * @returns promise
     */
    deleteColorPalette(colorPaletteRef: ObjRef): Promise<void>;
}
