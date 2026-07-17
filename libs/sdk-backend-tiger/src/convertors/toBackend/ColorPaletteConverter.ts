// (C) 2019-2026 GoodData Corporation

import { type JsonApiColorPaletteIn, type JsonApiWorkspaceColorPaletteIn } from "@gooddata/api-client-tiger";
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

export const convertWorkspaceColorPalette = (
    id: string,
    colorPalette: IColorPaletteDefinition,
): JsonApiWorkspaceColorPaletteIn => {
    return {
        type: "workspaceColorPalette",
        id,
        attributes: {
            name: colorPalette.title || "",
            content: wrapColorPaletteContent(colorPalette.colorPalette),
        },
    };
};
