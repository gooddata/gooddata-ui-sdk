// (C) 2019-2022 GoodData Corporation
import { IColorPalette, IColorPaletteDefinition } from "@gooddata/sdk-model";
import { JsonApiColorPaletteIn } from "@gooddata/api-client-tiger";

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
