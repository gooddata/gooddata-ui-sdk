// (C) 2020 GoodData Corporation
import React from "react";
import { IColorPalette } from "@gooddata/sdk-model";

const ColorPaletteContext = React.createContext<IColorPalette | undefined>(undefined);
ColorPaletteContext.displayName = "ColorPaletteContext";

/**
 * @internal
 */
export interface IColorPaletteProviderProps {
    palette: IColorPalette;
}

/**
 * @internal
 */
export const ColorPaletteProvider: React.FC<IColorPaletteProviderProps> = ({ children, palette }) => {
    return <ColorPaletteContext.Provider value={palette}>{children}</ColorPaletteContext.Provider>;
};

/**
 * @internal
 */
export const useColorPalette = (): IColorPalette | undefined => {
    return React.useContext(ColorPaletteContext);
};
