// (C) 2023-2026 GoodData Corporation

import { type DeclarativeDashboardPlugin } from "@gooddata/api-client-tiger";
import { type IDashboardPluginDefinition } from "@gooddata/sdk-model";

import type { Plugin } from "../schemas/v1/metadata.js";
import { convertIdToTitle } from "../utils/sharedUtils.js";

type PluginDefinition = Pick<IDashboardPluginDefinition, "url"> & {
    version: string;
};

/** @public */
export function yamlPluginToDeclarative(input: Plugin): DeclarativeDashboardPlugin {
    const content: PluginDefinition = {
        version: "2",
        url: input.url,
    };

    return {
        id: input.id,
        title: input.title ?? convertIdToTitle(input.id),
        tags: input.tags ?? [],
        description: input.description ?? "",
        content,
    };
}
