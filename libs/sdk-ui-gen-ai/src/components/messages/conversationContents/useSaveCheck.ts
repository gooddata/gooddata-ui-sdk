// (C) 2024-2026 GoodData Corporation

import { type IInsight } from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";

import type { IChatConversationMultipartLocalPart } from "../../../model.js";

export function useSaveCheck(part: IChatConversationMultipartLocalPart, visualization: IInsight | undefined) {
    const backend = useBackendStrict();
    const workspaceId = useWorkspaceStrict();

    const { result, status, error } = useCancelablePromise(
        {
            promise: async () => {
                if (!workspaceId || !visualization) {
                    return false;
                }
                const res = await backend.workspace(workspaceId).insights().getInsight({
                    type: "insight",
                    identifier: visualization.insight.identifier,
                });
                return Boolean(res);
            },
        },
        [workspaceId, visualization?.insight.identifier, part.saving?.completed],
    );

    const visualisationSaved = Boolean(result && !error);
    const visualisationCheckLoading = status === "loading";

    return { visualisationSaved, visualisationCheckLoading };
}
