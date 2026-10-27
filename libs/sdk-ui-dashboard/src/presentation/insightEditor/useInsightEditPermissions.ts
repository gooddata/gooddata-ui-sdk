// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type AccessGranularPermission, type IInsight, insightId } from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { selectEnableVisualizationPermissions } from "../../model/store/config/configSelectors.js";
import { selectInsights } from "../../model/store/insights/insightsSelectors.js";
import { selectCanManageWorkspace } from "../../model/store/permissions/permissionsSelectors.js";

/**
 * The current user's own permissions on each visualization of the dashboard, keyed by visualization id.
 */
export type InsightPermissionsById = Record<string, AccessGranularPermission[]>;

export function indexInsightPermissions(insights: IInsight[]): InsightPermissionsById {
    return Object.fromEntries(
        insights.map((insight) => [insightId(insight), insight.insight.permissions ?? []]),
    );
}

export async function loadInsightPermissions(
    backend: IAnalyticalBackend,
    workspace: string,
    ids: string[],
): Promise<InsightPermissionsById> {
    const page = await backend
        .workspace(workspace)
        .insights()
        .getInsightsQuery()
        // the id list travels in the body, a dashboard with many widgets would not fit a URL
        .withMethod("POST")
        .withFilter({ id: ids })
        .withMetaInclude(["permissions"])
        .query();
    return indexInsightPermissions(await page.all());
}

/**
 * The user's own permissions on the dashboard's visualizations, read in one query once the dashboard
 * is in (its own load brings the visualizations without permissions). Only users without the MANAGE
 * role while visualization permissions are on need them; for everyone else no request is made.
 * `undefined` until the map is in, so a visualization counts as not editable while loading or after a
 * failed read.
 */
export function useInsightEditPermissions(isActive = true): InsightPermissionsById | undefined {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const enabled = useDashboardSelector(selectEnableVisualizationPermissions);
    const canManageProject = useDashboardSelector(selectCanManageWorkspace);
    const insights = useDashboardSelector(selectInsights);
    const ids = useMemo(() => (insights ?? []).map(insightId).sort(), [insights]);
    const key = ids.join(",");
    const needed = isActive && enabled && !canManageProject && ids.length > 0;

    const { result } = useCancelablePromise(
        { promise: needed ? () => loadInsightPermissions(backend, workspace, ids) : null },
        [backend, workspace, needed, key],
    );
    return result;
}
