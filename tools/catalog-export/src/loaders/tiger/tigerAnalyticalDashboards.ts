// (C) 2007-2021 GoodData Corporation

import { ObjectMeta } from "../../base/types";
import { ITigerClient, ValidateRelationsHeader } from "@gooddata/api-client-tiger";
import { MetadataUtilities } from "@gooddata/api-client-tiger";

/**
 * Load analytical dashboards that are stored in workspace metadata so that their links can be included
 * in the generated output for easy embedding access.
 *
 * @param client - tiger client to use for communication
 * @param workspaceId - workspace id
 */
export async function loadAnalyticalDashboards(
    client: ITigerClient,
    workspaceId: string,
): Promise<ObjectMeta[]> {
    const result = await MetadataUtilities.getAllPagesOf(
        client,
        client.workspaceObjects.getAllEntitiesAnalyticalDashboards,
        { workspaceId },
        { headers: ValidateRelationsHeader },
    )
        .then(MetadataUtilities.mergeEntitiesResults)
        .then(MetadataUtilities.filterValidEntities);

    return result.data.map((dashboard) => {
        return {
            title: dashboard.attributes?.title ?? dashboard.id,
            identifier: dashboard.id,
            tags: dashboard.attributes?.tags?.join(",") ?? "",
        };
    });
}
