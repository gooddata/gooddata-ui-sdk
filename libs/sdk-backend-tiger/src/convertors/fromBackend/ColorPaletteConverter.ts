// (C) 2022 GoodData Corporation
import { IColorPalette, IColorPaletteMetadataObject, idRef } from "@gooddata/sdk-model";
import { JsonApiColorPaletteOutDocument, JsonApiColorPaletteOutWithLinks } from "@gooddata/api-client-tiger";

export const unwrapColorPaletteContent = (value: object): IColorPalette => {
    return (value as { colorPalette: IColorPalette })?.colorPalette ?? [];
};

export const convertColorPaletteWithLinks = ({
    id,
    attributes,
    links,
}: JsonApiColorPaletteOutWithLinks): IColorPaletteMetadataObject => ({
    id,
    ref: idRef(id),
    title: attributes.name,
    colorPalette: unwrapColorPaletteContent(attributes.content),
    uri: links!.self,
    description: "",
    type: "colorPalette",
    production: false,
    unlisted: false,
    deprecated: false,
});

export const convertColorPalette = ({
    data: { id, attributes, type },
    links,
}: JsonApiColorPaletteOutDocument): IColorPaletteMetadataObject =>
    convertColorPaletteWithLinks({ id, attributes, links, type });
