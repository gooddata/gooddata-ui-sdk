// (C) 2019-2025 GoodData Corporation
import { JsonApiColorPaletteIn } from "@gooddata/api-client-tiger";
import { IColorPalette, IColorPaletteDefinition } from "@gooddata/sdk-model";

export const wrapColorPaletteContent = (colorPalette: IColorPalette): object => ({ colorPalette });

export const convertColorPalette = (
    id: string,
    colorPalette: IColorPaletteDefinition,
): JsonApiColorPaletteIn => {
    return {
        type: "colorPalette",
        id,
        attributes: {
            name: colorPalette.title || "",
            content: wrapColorPaletteContent(colorPalette.colorPalette),
        },
    };
};
