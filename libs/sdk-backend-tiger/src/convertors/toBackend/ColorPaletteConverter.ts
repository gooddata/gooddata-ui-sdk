// (C) 2019-2025 GoodData Corporation
import { type JsonApiColorPaletteIn } from "@gooddata/api-client-tiger";
import { type IColorPalette, type IColorPaletteDefinition } from "@gooddata/sdk-model";

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
