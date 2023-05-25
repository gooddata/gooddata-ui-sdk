// (C) 2007-2021 GoodData Corporation
import gooddata from "@gooddata/api-client-bear";
import { ObjectMeta } from "../../base/types.js";

/**
 * Loads information about insights defined in the workspace. Only descriptive information about
 * each insight is returned.
 *
 * @param workspaceId - workspace to get insights from
 * @returns array of insight metadata
 */
export async function loadInsights(workspaceId: string): Promise<ObjectMeta[]> {
    const visualizations = await gooddata.md.getVisualizations(workspaceId);

    return visualizations.map((vis: any) => {
        return {
            identifier: vis.identifier,
            tags: vis.tags,
            title: vis.title,
        };
    });
}
