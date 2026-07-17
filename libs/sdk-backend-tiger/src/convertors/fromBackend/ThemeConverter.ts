// (C) 2022-2026 GoodData Corporation

import {
    type JsonApiThemeOutDocument,
    type JsonApiThemeOutWithLinks,
    type JsonApiWorkspaceThemeOutDocument,
    type JsonApiWorkspaceThemeOutWithLinks,
} from "@gooddata/api-client-tiger";
import { type IThemeMetadataObject, idRef } from "@gooddata/sdk-model";

// Accepts both organization- and workspace-scoped theme objects. The JSON:API `type` ("theme" /
// "workspaceTheme") is carried onto the returned reference so the object's scope is preserved and it can
// be handed straight back to setActiveTheme; the metadata object kind itself is always "theme".
export const convertThemeWithLinks = ({
    id,
    type,
    attributes,
    links,
}: JsonApiThemeOutWithLinks | JsonApiWorkspaceThemeOutWithLinks): IThemeMetadataObject => ({
    id,
    ref: idRef(id, type),
    title: attributes.name,
    theme: attributes.content,
    uri: links!.self,
    description: "",
    type: "theme",
    production: false,
    unlisted: false,
    deprecated: false,
});

export const convertTheme = (
    document: JsonApiThemeOutDocument | JsonApiWorkspaceThemeOutDocument,
): IThemeMetadataObject => convertThemeWithLinks({ ...document.data, links: document.links });
