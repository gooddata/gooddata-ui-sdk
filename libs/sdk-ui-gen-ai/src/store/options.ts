// (C) 2025 GoodData Corporation

import { IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { IColorPalette } from "@gooddata/sdk-model";

/**
 * A dispatcher for chat events.
 * @internal
 */
export class OptionsDispatcher {
    private colorPalette: IColorPalette | undefined = undefined;
    private settings: IUserWorkspaceSettings | undefined = undefined;

    public setColorPalette(colorPalette: IColorPalette | undefined): void {
        this.colorPalette = colorPalette;
    }

    public getColorPalette(): IColorPalette | undefined {
        return this.colorPalette;
    }

    public setSettings(settings: IUserWorkspaceSettings | undefined): void {
        this.settings = settings;
    }

    public getSettings(): IUserWorkspaceSettings | undefined {
        return this.settings;
    }
}
