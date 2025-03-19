// (C) 2019-2024 GoodData Corporation
import { IColorPalette, ITheme, ObjRef } from "@gooddata/sdk-model";

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
}
