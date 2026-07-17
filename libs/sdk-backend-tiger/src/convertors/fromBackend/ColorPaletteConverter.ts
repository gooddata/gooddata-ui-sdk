// (C) 2022-2026 GoodData Corporation

import {
    type JsonApiColorPaletteOutDocument,
    type JsonApiColorPaletteOutWithLinks,
    type JsonApiWorkspaceColorPaletteOutDocument,
    type JsonApiWorkspaceColorPaletteOutWithLinks,
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

// Accepts both organization- and workspace-scoped color palette objects. The JSON:API `type`
// ("colorPalette" / "workspaceColorPalette") is carried onto the returned reference so the object's scope is
// preserved and it can be handed straight back to setActiveColorPalette; the metadata object kind itself is
// always "colorPalette".
export const convertColorPaletteWithLinks = (
    colorPaletteObject: JsonApiColorPaletteOutWithLinks | JsonApiWorkspaceColorPaletteOutWithLinks,
): IColorPaletteMetadataObject => {
    const { id, type, attributes, links } = colorPaletteObject;
    const colorPalette = getColorPaletteFromMDObject(colorPaletteObject);
    return {
        id,
        ref: idRef(id, type),
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
}: JsonApiColorPaletteOutWithLinks | JsonApiWorkspaceColorPaletteOutWithLinks): IColorPalette => {
    return unwrapColorPaletteContent(attributes.content);
};

export const isValidColorPalette = (colorPalette: IColorPalette): boolean => {
    return colorPalette && Array.isArray(colorPalette) && colorPalette.every(isColorPaletteItem);
};

export const convertColorPalette = (
    document: JsonApiColorPaletteOutDocument | JsonApiWorkspaceColorPaletteOutDocument,
): IColorPaletteMetadataObject => convertColorPaletteWithLinks({ ...document.data, links: document.links });
