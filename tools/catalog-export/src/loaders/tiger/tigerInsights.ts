// (C) 2007-2021 GoodData Corporation

import { ObjectMeta } from "../../base/types";
import { ITigerClient, MetadataUtilities } from "@gooddata/api-client-tiger";

/**
 * Load insights that are stored in workspace metadata so that their links can be included
 * in the generated output for easy embedding access.
 *
 * @param workspaceId - workspace id
 * @param client - tiger client to use for communication
 */
export async function loadInsights(workspaceId: string, client: ITigerClient): Promise<ObjectMeta[]> {
    const result = await MetadataUtilities.getAllPagesOf(
        client,
        client.workspaceObjects.getEntitiesVisualizationObjects,
        { workspaceId },
    ).then(MetadataUtilities.mergeEntitiesResults);

    return result.data.map((vis) => {
        return {
            title: vis.attributes?.title ?? vis.id,
            identifier: vis.id,
            tags: vis.attributes?.tags?.join(",") ?? "",
        };
    });
}
