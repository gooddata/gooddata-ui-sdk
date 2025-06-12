// (C) 2021 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IColorPalette } from "@gooddata/sdk-model";
import { dataLoaderAbstractFactory } from "./DataLoaderAbstractFactory.js";

/**
 * @internal
 */
export interface IColorPaletteDataLoader {
    /**
     * Obtains the color palette for the current workspace.
     * @param backend - the {@link IAnalyticalBackend} instance to use to communicate with the backend
     */
    getColorPalette(backend: IAnalyticalBackend): Promise<IColorPalette>;
}

class ColorPaletteDataLoader implements IColorPaletteDataLoader {
    private cachedColorPalette: Promise<IColorPalette> | undefined;

    constructor(protected readonly workspace: string) {}

    public getColorPalette(backend: IAnalyticalBackend): Promise<IColorPalette> {
        if (!this.cachedColorPalette) {
            this.cachedColorPalette = backend
                .workspace(this.workspace)
                .styling()
                .getColorPalette()
                .catch((error) => {
                    this.cachedColorPalette = undefined;
                    throw error;
                });
        }

        return this.cachedColorPalette;
    }
}

/**
 * @internal
 */
export const colorPaletteDataLoaderFactory = dataLoaderAbstractFactory<IColorPaletteDataLoader>(
    (workspace) => new ColorPaletteDataLoader(workspace),
);
