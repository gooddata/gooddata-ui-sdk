// (C) 2021 GoodData Corporation
import gooddata from "@gooddata/api-client-bear";
import { ObjectMeta } from "../../base/types.js";

/**
 * Loads information about analytical dashboards defined in the workspace. Only descriptive information about
 * each analytical dashboard is returned.
 *
 * @param workspaceId - workspace to get analytical dashboards from
 * @returns array of analytical dashboard meta
 */
export async function loadAnalyticalDashboard(workspaceId: string): Promise<ObjectMeta[]> {
    const analyticalDashboards = await gooddata.md.getAnalyticalDashboards(workspaceId);

    return analyticalDashboards.map((dashboard: any) => {
        return {
            identifier: dashboard.identifier,
            tags: dashboard.tags,
            title: dashboard.title,
        };
    });
}
