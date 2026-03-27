// (C) 2023-2026 GoodData Corporation

import { type DeclarativeDashboardPlugin } from "@gooddata/api-client-tiger";
import type { Plugin } from "@gooddata/sdk-code-schemas/v1";
import { type IDashboardPluginDefinition } from "@gooddata/sdk-model";

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
