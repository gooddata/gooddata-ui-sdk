// (C) 2007-2020 GoodData Corporation
import gooddata from "@gooddata/api-client-bear";
import { ObjectMeta } from "../../base/types";

/**
 * Loads information about insights defined in the project. Only descriptive information about
 * each insight is returned.
 *
 * @param projectId - project to get insights from
 * @return array of insight metadata
 */
export async function loadInsights(projectId: string): Promise<ObjectMeta[]> {
    const visualizations = await gooddata.md.getVisualizations(projectId);

    return visualizations.map((vis: any) => {
        return {
            identifier: vis.identifier,
            tags: vis.tags,
            title: vis.title,
        };
    });
}
