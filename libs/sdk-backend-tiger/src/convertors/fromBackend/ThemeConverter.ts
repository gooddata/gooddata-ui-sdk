// (C) 2022 GoodData Corporation

import { JsonApiThemeOutWithLinks, JsonApiThemeOutDocument } from "@gooddata/api-client-tiger";
import { idRef, IThemeMetadataObject } from "@gooddata/sdk-model";

export const convertThemeWithLinks = ({
    id,
    attributes,
    links,
}: JsonApiThemeOutWithLinks): IThemeMetadataObject => ({
    id,
    ref: idRef(id),
    title: attributes.name,
    theme: attributes.content,
    uri: links!.self,
    description: "",
    type: "theme",
    production: false,
    unlisted: false,
    deprecated: false,
});

export const convertTheme = ({
    data: { id, attributes, type },
    links,
}: JsonApiThemeOutDocument): IThemeMetadataObject => convertThemeWithLinks({ id, attributes, links, type });
