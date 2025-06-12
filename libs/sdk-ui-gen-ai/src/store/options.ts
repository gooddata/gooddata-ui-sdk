// (C) 2025 GoodData Corporation
import { IColorPalette } from "@gooddata/sdk-model";

/**
 * A dispatcher for chat events.
 * @internal
 */
export class OptionsDispatcher {
    private colorPalette: IColorPalette | undefined = undefined;

    public setColorPalette(colorPalette: IColorPalette | undefined): void {
        this.colorPalette = colorPalette;
    }

    public getColorPalette(): IColorPalette | undefined {
        return this.colorPalette;
    }
}
