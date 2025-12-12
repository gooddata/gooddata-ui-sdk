// (C) 2022-2025 GoodData Corporation

import { type JsonApiThemeOutDocument, type JsonApiThemeOutWithLinks } from "@gooddata/api-client-tiger";
import { type IThemeMetadataObject, idRef } from "@gooddata/sdk-model";

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
