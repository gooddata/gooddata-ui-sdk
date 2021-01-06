// (C) 2021 GoodData Corporation
import gooddata from "@gooddata/api-client-bear";
import { ObjectMeta } from "../../base/types";

/**
 * Loads information about analytical dashboards defined in the project. Only descriptive information about
 * each analytical dashboard is returned.
 *
 * @param projectId - project to get analytical dashboards from
 * @return array of analytical dashboard meta
 */
export async function loadAnalyticalDashboard(projectId: string): Promise<ObjectMeta[]> {
    const analyticalDashboards = await gooddata.md.getAnalyticalDashboards(projectId);

    return analyticalDashboards.map((dashboard: any) => {
        return {
            identifier: dashboard.identifier,
            tags: dashboard.tags,
            title: dashboard.title,
        };
    });
}
