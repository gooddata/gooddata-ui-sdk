// (C) 2007-2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { type IExpressionToken, getMeasureExpressionTokens } from "../backend/measureExpressionTokens.js";

export type UseMetricTokensStat = {
    result: IExpressionToken[];
    loading: boolean;
};

export function useMetricTokens(ref: ObjRef, expressionFallback: string): UseMetricTokensStat {
    const workspaceId = useWorkspaceStrict();
    const backend = useBackendStrict();

    const { status, result } = useCancelablePromise(
        {
            promise: () => getMeasureExpressionTokens(backend, workspaceId, ref),
        },
        [],
    );

    return {
        result: (result || [{ category: "text", title: expressionFallback }]) as IExpressionToken[],
        loading: status === "loading" || status === "pending",
    };
}
