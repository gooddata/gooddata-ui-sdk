// (C) 2007-2021 GoodData Corporation

import { ObjectMeta } from "../../base/types";
import { ITigerClient } from "@gooddata/api-client-tiger";

/**
 * Load analytical dashboards that are stored in workspace metadata so that their links can be included
 * in the generated output for easy embedding access.
 *
 * @param _projectId - project id, ignored for now as tiger is single-workspace
 * @param tigerClient - tiger client to use for communication
 */
export async function loadAnalyticalDashboards(
    _projectId: string,
    tigerClient: ITigerClient,
): Promise<ObjectMeta[]> {
    const result = await tigerClient.workspaceModel.getEntitiesAnalyticalDashboards(
        {
            workspaceId: _projectId,
        },
        {
            headers: { Accept: "application/vnd.gooddata.api+json" },
        },
    );

    return result.data.data.map((dashboard) => {
        return {
            title: dashboard.attributes?.title ?? dashboard.id,
            identifier: dashboard.id,
            tags: dashboard.attributes?.tags?.join(",") ?? "",
        };
    });
}
