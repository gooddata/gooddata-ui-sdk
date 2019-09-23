// (C) 2019 GoodData Corporation

import { IColorPaletteItem } from "@gooddata/sdk-model";

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export interface IWorkspaceStyling {
    colorPalette(): Promise<IColorPaletteItem[]>;
}
