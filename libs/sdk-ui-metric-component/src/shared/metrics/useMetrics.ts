// (C) 2021-2026 GoodData Corporation

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IMeasureMetadataObject } from "@gooddata/sdk-model";
import {
    type UseCancelablePromiseState,
    useBackend,
    useCancelablePromise,
    useWorkspace,
} from "@gooddata/sdk-ui";

import { useFeaturesAndSettings } from "../../MetricComponent/FeaturesAndSettings/index.js";

import { useReloadMetrics } from "./useReloadMetrics.js";

export async function loadMetrics(
    backend: IAnalyticalBackend,
    workspaceId: string,
    loadPermissions = false,
): Promise<IMeasureMetadataObject[]> {
    return (
        backend
            .workspace(workspaceId)
            .catalog()
            // omitted when false so the cache key stays identical to the one used without the
            // feature flag — the catalog is cached per stringified options
            .withOptions({ types: ["measure"], ...(loadPermissions ? { loadPermissions } : {}) })
            .load()
            .then((workspaceCatalog) => workspaceCatalog.measures())
            .then((catalogMeasures) => catalogMeasures.map((catalogMeasure) => catalogMeasure.measure))
    );
}

/**
 * @internal
 */
export interface IUseMetricsOptions {
    /**
     * Ask the backend for each metric's object-level permissions. Defaults to the
     * enableMetricPermissions feature flag when the caller sits inside the metric dialog.
     */
    loadPermissions?: boolean;
}

/**
 * Hook allowing to get metrics
 *
 * @internal
 */
export function useMetrics({ loadPermissions }: IUseMetricsOptions = {}): UseCancelablePromiseState<
    IMeasureMetadataObject[],
    unknown
> {
    const workspaceId = useWorkspace();
    const backend = useBackend();
    const { metricReloadRequest } = useReloadMetrics();
    const { enableMetricPermissions } = useFeaturesAndSettings();
    // every caller has to end up with the same value, or the catalog is loaded once per value
    const withPermissions = loadPermissions ?? enableMetricPermissions;

    return useCancelablePromise(
        {
            promise: () => {
                if (backend && workspaceId) {
                    return loadMetrics(backend, workspaceId, withPermissions);
                }
                return Promise.resolve([]);
            },
        },
        [backend, workspaceId, metricReloadRequest, withPermissions],
    );
}
