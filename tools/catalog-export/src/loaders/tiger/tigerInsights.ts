// (C) 2007-2021 GoodData Corporation

import { ObjectMeta } from "../../base/types";
import { ITigerClient, jsonApiHeaders } from "@gooddata/api-client-tiger";

/**
 * Load insights that are stored in workspace metadata so that their links can be included
 * in the generated output for easy embedding access.
 *
 * @param _projectId - project id, ignored for now as tiger is single-workspace
 * @param tigerClient - tiger client to use for communication
 */
export async function loadInsights(_projectId: string, tigerClient: ITigerClient): Promise<ObjectMeta[]> {
    const result = await tigerClient.workspaceModel.getEntitiesVisualizationObjects(
        {
            workspaceId: _projectId,
        },
        {
            headers: jsonApiHeaders,
        },
    );

    return result.data.data.map((vis) => {
        return {
            title: vis.attributes?.title ?? vis.id,
            identifier: vis.id,
            tags: vis.attributes?.tags?.join(",") ?? "",
        };
    });
}
