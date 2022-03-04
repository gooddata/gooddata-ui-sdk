// (C) 2007-2021 GoodData Corporation

import { ObjectMeta } from "../../base/types";
import { ITigerClient, MetadataUtilities, ValidateRelationsHeader } from "@gooddata/api-client-tiger";

/**
 * Load insights that are stored in workspace metadata so that their links can be included
 * in the generated output for easy embedding access.
 *
 * @param client - tiger client to use for communication
 * @param workspaceId - workspace id
 */
export async function loadInsights(client: ITigerClient, workspaceId: string): Promise<ObjectMeta[]> {
    const result = await MetadataUtilities.getAllPagesOf(
        client,
        client.workspaceObjects.getAllEntitiesVisualizationObjects,
        { workspaceId },
        { headers: ValidateRelationsHeader },
    )
        .then(MetadataUtilities.mergeEntitiesResults)
        .then(MetadataUtilities.filterValidEntities);

    return result.data.map((vis) => {
        return {
            title: vis.attributes?.title ?? vis.id,
            identifier: vis.id,
            tags: vis.attributes?.tags?.join(",") ?? "",
        };
    });
}
