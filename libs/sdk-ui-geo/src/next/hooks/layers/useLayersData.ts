// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    DataViewFacade,
    type GoodDataSdkError,
    type UseCancelablePromiseStatus,
    convertError,
    useBackendStrict,
    useCancelablePromise,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";

import type { ILayerExecutionRecord } from "../../types/props/geoChartNext/internal.js";
import { createExecutionsFingerprint } from "../../utils/fingerprint.js";

/**
 * Result of loading all layer execution data in parallel.
 *
 * @internal
 */
export interface ILayersDataResult {
    /**
     * Map of layerId to DataViewFacade for each successfully loaded layer.
     * Empty until all layers complete successfully.
     */
    layerDataViews: Map<string, DataViewFacade>;

    /**
     * Combined loading status for all layers.
     * - "pending" if no executions provided
     * - "loading" while any execution is in progress
     * - "success" when all executions complete successfully
     * - "error" if any execution fails
     */
    status: UseCancelablePromiseStatus;

    /**
     * First error encountered, if any.
     */
    error?: GoodDataSdkError;
}

interface ILayerDataViewEntry {
    layerId: string;
    dataView: DataViewFacade;
}

/**
 * Executes a single layer and returns its data view.
 *
 * @internal
 */
async function executeLayerData(layerExecution: ILayerExecutionRecord): Promise<ILayerDataViewEntry> {
    try {
        const executionResult = await layerExecution.execution.execute();
        const dataView = await executionResult.readAll();
        return {
            layerId: layerExecution.layerId,
            dataView: DataViewFacade.for(dataView),
        };
    } catch (err) {
        throw convertError(err);
    }
}

/**
 * Executes all layers in parallel and returns their data views.
 *
 * @internal
 */
async function executeAllLayers(layerExecutions: ILayerExecutionRecord[]): Promise<ILayerDataViewEntry[]> {
    return Promise.all(layerExecutions.map(executeLayerData));
}

/**
 * Hook that executes all layer executions in parallel and returns combined results.
 *
 * @remarks
 * Uses Promise.all to execute all layers simultaneously. The status is:
 * - "success" only when ALL layers have loaded successfully
 * - "error" if ANY layer fails (returns first error)
 * - "loading" while any layer is still loading
 *
 * @param layerExecutions - Array of layer execution records
 * @param backend - Optional backend override
 * @param workspace - Optional workspace override
 * @returns Combined data views, status, and error
 *
 * @internal
 */
export function useLayersData(
    layerExecutions: ILayerExecutionRecord[],
    backend?: IAnalyticalBackend,
    workspace?: string,
): ILayersDataResult {
    const resolvedBackend = useBackendStrict(backend, "useLayersData");
    const resolvedWorkspace = useWorkspaceStrict(workspace, "useLayersData");

    const executionsFingerprint = useMemo(
        () => createExecutionsFingerprint(layerExecutions),
        [layerExecutions],
    );

    const { result, status, error } = useCancelablePromise<ILayerDataViewEntry[], GoodDataSdkError>(
        {
            promise: layerExecutions.length > 0 ? () => executeAllLayers(layerExecutions) : undefined,
        },
        [resolvedBackend, resolvedWorkspace, executionsFingerprint],
    );

    const layerDataViews = useMemo(() => {
        const map = new Map<string, DataViewFacade>();
        if (result) {
            for (const entry of result) {
                map.set(entry.layerId, entry.dataView);
            }
        }
        return map;
    }, [result]);

    return {
        layerDataViews,
        status,
        error,
    };
}
