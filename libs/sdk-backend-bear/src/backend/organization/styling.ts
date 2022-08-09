// (C) 2022 GoodData Corporation

import { IOrganizationStylingService, NotSupported } from "@gooddata/sdk-backend-spi";
import { IColorPaletteDefinition, IThemeDefinition, ObjRef } from "@gooddata/sdk-model";

export class OrganizationStylingService implements IOrganizationStylingService {
    private defaultReject = (message: string) => Promise.reject(new NotSupported(message));
    private defaultRejectTheme = () =>
        this.defaultReject("Backend does not support theming on organization level");
    private defaultRejectColorPalette = () =>
        this.defaultReject("Backend does not support color palette on organization level");

    public getThemes = () => this.defaultRejectTheme();
    public getActiveTheme = () => this.defaultRejectTheme();
    public setActiveTheme = () => this.defaultRejectTheme();
    public clearActiveTheme = () => this.defaultRejectTheme();
    public createTheme = (_theme: IThemeDefinition) => this.defaultRejectTheme();

    /**
     * Update existing theme on organization level.
     *
     * @returns promise
     */
    public updateTheme = (_theme: IThemeDefinition) => this.defaultRejectTheme();

    /**
     * Delete theme on organization level.
     *
     * @returns promise
     */
    public deleteTheme = (_themeRef: ObjRef) => this.defaultRejectTheme();

    public getColorPalettes = () => this.defaultRejectColorPalette();
    public getActiveColorPalette = () => this.defaultRejectColorPalette();
    public setActiveColorPalette = () => this.defaultRejectColorPalette();
    public clearActiveColorPalette = () => this.defaultRejectColorPalette();
    public createColorPalette = (_colorPalette: IColorPaletteDefinition) => this.defaultRejectColorPalette();
    public updateColorPalette = (_colorPalette: IColorPaletteDefinition) => this.defaultRejectColorPalette();
    public deleteColorPalette = (_colorPaletteRef: ObjRef) => this.defaultRejectColorPalette();
}
