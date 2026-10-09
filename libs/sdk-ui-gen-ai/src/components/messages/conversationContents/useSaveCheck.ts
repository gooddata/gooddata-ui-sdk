// (C) 2024-2026 GoodData Corporation

import { type IDashboard, type IInsight } from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";

import type { IChatConversationMultipartLocalPart } from "../../../model.js";

export function useInsightSaveCheck(
    part: IChatConversationMultipartLocalPart,
    visualization: IInsight | null | undefined,
    run: boolean,
) {
    const backend = useBackendStrict();
    const workspaceId = useWorkspaceStrict();

    const { result, status, error } = useCancelablePromise(
        {
            promise: async () => {
                const saveInProgress = part.saving?.started && !part.saving?.completed;
                if (!workspaceId || !visualization || !run || saveInProgress) {
                    return false;
                }
                // A chart the user has not saved yet does not exist in metadata. The filtered list
                // answers that with an empty result instead of a 404, which the backend would log
                // to the console as an error.
                const res = await backend
                    .workspace(workspaceId)
                    .insights()
                    .getInsightsQuery()
                    .withFilter({ id: [visualization.insight.identifier] })
                    .query();
                return res.items.length > 0;
            },
        },
        [workspaceId, visualization?.insight.identifier, part.saving?.started, part.saving?.completed, run],
    );

    const visualisationSaved = Boolean(result && !error);
    const visualisationCheckLoading = status === "loading";

    return { visualisationSaved, visualisationCheckLoading };
}

export function useDashboardSaveCheck(
    part: IChatConversationMultipartLocalPart,
    dashboard: IDashboard | null | undefined,
    run: boolean,
) {
    const backend = useBackendStrict();
    const workspaceId = useWorkspaceStrict();

    const { result, status, error } = useCancelablePromise(
        {
            promise: async () => {
                const saveInProgress = part.saving?.started && !part.saving?.completed;
                if (!workspaceId || !dashboard || !run || saveInProgress) {
                    return false;
                }
                // A dashboard the user has not saved yet does not exist in metadata. The filtered list
                // answers that with an empty result instead of a 404, which the backend would log
                // to the console as an error.
                const res = await backend
                    .workspace(workspaceId)
                    .dashboards()
                    .getDashboardsQuery()
                    .withFilter({ id: [dashboard.identifier] })
                    .query();
                return res.items.length > 0;
            },
        },
        [workspaceId, dashboard?.identifier, part.saving?.started, part.saving?.completed, run],
    );

    const dashboardSaved = Boolean(result && !error);
    const dashboardCheckLoading = status === "loading";

    return { dashboardSaved, dashboardCheckLoading };
}
