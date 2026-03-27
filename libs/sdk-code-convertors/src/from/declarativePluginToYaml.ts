// (C) 2023-2026 GoodData Corporation

import { Document, Pair } from "yaml";

import { type DeclarativeDashboardPlugin } from "@gooddata/api-client-tiger";
import { type IDashboardPluginDefinition } from "@gooddata/sdk-model";

import type { Plugin } from "../schemas/v1/metadata.js";
import { PLUGIN_COMMENT } from "../utils/texts.js";
import { fillOptionalMetaFields } from "../utils/yamlUtils.js";

export type PluginDefinition = IDashboardPluginDefinition;

/** @public */
export function declarativePluginToYaml(plugin: DeclarativeDashboardPlugin): {
    content: string;
    json: Plugin;
} {
    const content = plugin.content as PluginDefinition;

    // Create new doc and add mandatory fields right away
    const doc = new Document({
        type: "plugin",
        id: plugin.id,
    });

    // Add intro comment to the document
    doc.commentBefore = PLUGIN_COMMENT;

    // Add optional meta fields
    fillOptionalMetaFields(doc, plugin);

    // Url
    doc.add(new Pair("url", content.url));

    return {
        content: doc.toString({
            lineWidth: 0,
        }),
        json: doc.toJSON() as Plugin,
    };
}
