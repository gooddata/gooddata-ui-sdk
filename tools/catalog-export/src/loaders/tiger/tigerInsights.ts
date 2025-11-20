// (C) 2007-2025 GoodData Corporation

import { ITigerClientBase, MetadataUtilities, ValidateRelationsHeader } from "@gooddata/api-client-tiger";
import { EntitiesApi_GetAllEntitiesVisualizationObjects } from "@gooddata/api-client-tiger/entitiesObjects";

import { ObjectMeta } from "../../base/types.js";

/**
 * Load insights that are stored in workspace metadata so that their links can be included
 * in the generated output for easy embedding access.
 *
 * @param client - tiger client to use for communication
 * @param workspaceId - workspace id
 */
export async function loadInsights(client: ITigerClientBase, workspaceId: string): Promise<ObjectMeta[]> {
    const result = await MetadataUtilities.getAllPagesOf(
        client,
        EntitiesApi_GetAllEntitiesVisualizationObjects,
        { workspaceId },
        { headers: ValidateRelationsHeader },
    )
        .then(MetadataUtilities.mergeEntitiesResults)
        .then(MetadataUtilities.filterValidEntities);

    return result.data.map((vis: any) => {
        return {
            title: vis.attributes?.title ?? vis.id,
            identifier: vis.id,
            tags: vis.attributes?.tags?.join(",") ?? "",
        };
    });
}
