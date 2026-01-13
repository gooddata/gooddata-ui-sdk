// (C) 2007-2026 GoodData Corporation

import { type ITigerClientBase, MetadataUtilities } from "@gooddata/api-client-tiger";
import { DashboardsApi_GetAllEntitiesAnalyticalDashboards } from "@gooddata/api-client-tiger/endpoints/entitiesObjects";

import { type ObjectMeta } from "../../base/types.js";

/**
 * Load analytical dashboards that are stored in workspace metadata so that their links can be included
 * in the generated output for easy embedding access.
 *
 * @param client - tiger client to use for communication
 * @param workspaceId - workspace id
 */
export async function loadAnalyticalDashboards(
    client: ITigerClientBase,
    workspaceId: string,
): Promise<ObjectMeta[]> {
    const result = await MetadataUtilities.getAllPagesOf(
        client,
        DashboardsApi_GetAllEntitiesAnalyticalDashboards,
        { workspaceId },
        // TODO we need to show dashboards with invalid references now, later this should be rework or removed completely (related to NAS-140)
        // { headers: ValidateRelationsHeader },
    )
        .then(MetadataUtilities.mergeEntitiesResults)
        .then(MetadataUtilities.filterValidEntities);

    return result.data.map((dashboard: any) => {
        return {
            title: dashboard.attributes?.title ?? dashboard.id,
            identifier: dashboard.id,
            tags: dashboard.attributes?.tags?.join(",") ?? "",
        };
    });
}
