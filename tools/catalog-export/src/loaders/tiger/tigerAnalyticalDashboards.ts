// (C) 2007-2021 GoodData Corporation

import { ObjectMeta } from "../../base/types";
import { ITigerClient } from "@gooddata/api-client-tiger";
import { MetadataUtilities } from "@gooddata/api-client-tiger";

/**
 * Load analytical dashboards that are stored in workspace metadata so that their links can be included
 * in the generated output for easy embedding access.
 *
 * @param workspaceId - workspace id
 * @param client - tiger client to use for communication
 */
export async function loadAnalyticalDashboards(
    workspaceId: string,
    client: ITigerClient,
): Promise<ObjectMeta[]> {
    const result = await MetadataUtilities.getAllPagesOf(
        client,
        client.workspaceObjects.getEntitiesAnalyticalDashboards,
        { workspaceId },
    ).then(MetadataUtilities.mergeEntitiesResults);

    return result.data.map((dashboard) => {
        return {
            title: dashboard.attributes?.title ?? dashboard.id,
            identifier: dashboard.id,
            tags: dashboard.attributes?.tags?.join(",") ?? "",
        };
    });
}
