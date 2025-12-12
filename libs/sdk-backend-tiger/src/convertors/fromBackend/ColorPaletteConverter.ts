// (C) 2022-2025 GoodData Corporation
import {
    type JsonApiColorPaletteOutDocument,
    type JsonApiColorPaletteOutWithLinks,
} from "@gooddata/api-client-tiger";
import {
    type IColorPalette,
    type IColorPaletteMetadataObject,
    idRef,
    isColorPaletteItem,
} from "@gooddata/sdk-model";

export const unwrapColorPaletteContent = (value: object): IColorPalette => {
    return (value as { colorPalette: IColorPalette })?.colorPalette ?? [];
};

export const convertColorPaletteWithLinks = (
    colorPaletteObject: JsonApiColorPaletteOutWithLinks,
): IColorPaletteMetadataObject => {
    const { id, attributes, links } = colorPaletteObject;
    const colorPalette = getColorPaletteFromMDObject(colorPaletteObject);
    return {
        id,
        ref: idRef(id),
        title: attributes.name,
        colorPalette: isValidColorPalette(colorPalette) ? colorPalette : [],
        uri: links!.self,
        description: "",
        type: "colorPalette",
        production: false,
        unlisted: false,
        deprecated: false,
    };
};

export const getColorPaletteFromMDObject = ({
    attributes,
}: JsonApiColorPaletteOutWithLinks): IColorPalette => {
    return unwrapColorPaletteContent(attributes.content);
};

export const isValidColorPalette = (colorPalette: IColorPalette): boolean => {
    return colorPalette && Array.isArray(colorPalette) && colorPalette.every(isColorPaletteItem);
};

export const convertColorPalette = ({
    data: { id, attributes, type },
    links,
}: JsonApiColorPaletteOutDocument): IColorPaletteMetadataObject =>
    convertColorPaletteWithLinks({ id, attributes, links, type });
