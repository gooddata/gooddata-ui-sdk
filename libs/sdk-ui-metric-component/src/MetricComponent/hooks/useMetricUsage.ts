// (C) 2021-2026 GoodData Corporation

import { useMemo } from "react";

import { type IMeasureReferencing } from "@gooddata/sdk-backend-spi";
import { isMeasureMetadataObject } from "@gooddata/sdk-model";
import {
    type UseCancelablePromiseCallbacks,
    useBackendStrict,
    useCancelablePromise,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";

import { type IMeasureDef } from "../metric/metricHelpers.js";

/**
 * Hook allowing to get metric usages
 */
export function useMetricUsage(
    metric: IMeasureDef,
    cancelablePromiseCallbacks: UseCancelablePromiseCallbacks<IMeasureReferencing, unknown> = {},
): IMeasureReferencing {
    const workspaceId = useWorkspaceStrict();
    const backend = useBackendStrict();

    const usagePromise = useCancelablePromise(
        {
            promise: () => {
                if (isMeasureMetadataObject(metric)) {
                    return backend.workspace(workspaceId).measures().getMeasureReferencingObjects(metric.ref);
                }
                return Promise.resolve({});
            },
            ...cancelablePromiseCallbacks,
        },
        [backend, workspaceId, metric],
    );

    return useMemo(() => usagePromise.result || {}, [usagePromise]);
}
