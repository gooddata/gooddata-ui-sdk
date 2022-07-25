// (C) 2022 GoodData Corporation

import { JsonApiThemeOutWithLinks } from "@gooddata/api-client-tiger";
import { idRef, IThemeMetadataObject } from "@gooddata/sdk-model";

export const convertTheme = ({ id, attributes, links }: JsonApiThemeOutWithLinks): IThemeMetadataObject => ({
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
