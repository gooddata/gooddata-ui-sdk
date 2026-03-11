// (C) 2025-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import type { IntlShape } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { IExecutionConfig } from "@gooddata/sdk-model";
import {
    type DataViewFacade,
    type GoodDataSdkError,
    UnexpectedSdkError,
    type UseCancelablePromiseStatus,
    useCancelablePromise,
} from "@gooddata/sdk-ui";

import { processSettledLayerResults } from "./processSettledLayerResults.js";
import { getLayerAdapter } from "../../layers/registry/adapterRegistry.js";
import type { IGeoAdapterContext, IGeoLayerOutput } from "../../layers/registry/adapterTypes.js";
import type { IGeoChartConfig } from "../../types/config/unified.js";
import type { ILayerExecutionRecord } from "../../types/props/geoChart/internal.js";
import { resolveLayerColorConfig } from "../../utils/color/resolveLayerColorConfig.js";
import { createDataViewsFingerprint, createLayersStructureFingerprint } from "../../utils/fingerprint.js";

/**
 * Prepared output for a single layer.
 *
 * @internal
 */
export interface ILayerPreparedData {
    /**
     * Layer ID for reference.
     */
    layerId: string;

    /**
     * DataViewFacade from execution.
     */
    dataView: DataViewFacade;

    /**
     * Prepared layer output (features, legend, colorStrategy, etc.).
     * Null if layer preparation returned no data.
     */
    output: IGeoLayerOutput | null;
}

interface IPrepareAllLayersResult {
    preparedData: ILayerPreparedData[];
    firstError?: GoodDataSdkError;
}

/**
 * Result of preparing all layer outputs.
 *
 * @internal
 */
export interface ILayersPrepareResult {
    /**
     * Map of layerId to prepared layer data.
     * Can contain partial results when some layers fail.
     */
    layerOutputs: Map<string, ILayerPreparedData>;

    /**
     * Combined preparation status for all layers.
     * - "pending" if no dataViews provided or dataViews not ready
     * - "loading" while any preparation is in progress
     * - "success" when the primary layer is prepared successfully
     * - "error" when the primary layer fails to prepare
     */
    status: UseCancelablePromiseStatus;

    /**
     * First error encountered, if any.
     */
    error?: GoodDataSdkError;
}

/**
 * Context needed for layer preparation.
 *
 * @internal
 */
export interface ILayersPrepareContext {
    backend: IAnalyticalBackend;
    workspace: string;
    config?: IGeoChartConfig;
    execConfig?: IExecutionConfig;
    intl: IntlShape;
}

/**
 * Prepares a single layer using its adapter.
 *
 * @internal
 */
async function prepareSingleLayer(
    layerExecution: ILayerExecutionRecord,
    layerDataViews: Map<string, DataViewFacade>,
    adapterContext: IGeoAdapterContext,
): Promise<ILayerPreparedData> {
    const { layerId, layer } = layerExecution;
    const dataView = layerDataViews.get(layerId);

    if (!dataView) {
        throw new UnexpectedSdkError(`No dataView found for layer ${layerId}`);
    }

    const adapter = getLayerAdapter(layer);
    const output = await adapter.prepareLayer(layer, dataView, adapterContext);

    return { layerId, dataView, output };
}

/**
 * Prepares all layers in parallel using their adapters.
 *
 * @internal
 */
async function prepareAllLayers(
    layerExecutions: ILayerExecutionRecord[],
    layerDataViews: Map<string, DataViewFacade>,
    createAdapterContext: (layerExecution: ILayerExecutionRecord) => IGeoAdapterContext,
): Promise<IPrepareAllLayersResult> {
    const settledResults = await Promise.allSettled(
        layerExecutions.map((le) => prepareSingleLayer(le, layerDataViews, createAdapterContext(le))),
    );
    const { fulfilledValues: preparedData, firstError } = processSettledLayerResults({
        settledResults,
        layerExecutions,
        onRejected: ({ layerId, error }) => {
            console.error("[useLayersPrepare] Failed to prepare layer output.", {
                layerId,
                error,
            });
        },
    });

    return {
        preparedData,
        firstError,
    };
}

/**
 * Hook that prepares all layer outputs in parallel once dataViews are available.
 *
 * @remarks
 * Calls adapter's `prepareLayer` for each layer simultaneously using Promise.allSettled.
 * Runs when useLayersData returns "success" (the primary layer dataView is available).
 *
 * @param layerExecutions - Array of layer execution records
 * @param layerDataViews - Map of layerId to DataViewFacade (from useLayersData)
 * @param dataStatus - Status from useLayersData ("success" when ready)
 * @param context - Context for layer preparation
 * @returns Prepared layer outputs, status, and error
 *
 * @internal
 */
export function useLayersPrepare(
    layerExecutions: ILayerExecutionRecord[],
    layerDataViews: Map<string, DataViewFacade>,
    dataStatus: UseCancelablePromiseStatus,
    context: ILayersPrepareContext,
): ILayersPrepareResult {
    const { backend, workspace, config, execConfig, intl } = context;

    const dataViewsFingerprint = useMemo(
        () => createDataViewsFingerprint(layerDataViews, dataStatus === "success"),
        [dataStatus, layerDataViews],
    );

    // Fingerprint that captures bucket structure (which items are in which buckets).
    // This detects when measures are moved between buckets (e.g., COLOR to SIZE)
    // even when the underlying data is the same.
    const layersStructureFingerprint = useMemo(
        () => createLayersStructureFingerprint(layerExecutions),
        [layerExecutions],
    );

    const createAdapterContext = useCallback(
        (layerExecution: ILayerExecutionRecord): IGeoAdapterContext => {
            const layer = layerExecution.layer;
            const layerColorConfig = resolveLayerColorConfig(layer, config);

            return {
                backend,
                workspace,
                config,
                execConfig,
                colorPalette: layerColorConfig.colorPalette,
                colorMapping: layerColorConfig.colorMapping,
                intl,
            };
        },
        [backend, workspace, config, execConfig, intl],
    );

    // Only prepare layers that have a loaded dataView; failed data layers are already
    // reported by useLayersData and should not produce synthetic "No dataView found" errors here.
    const layerExecutionsWithDataViews = useMemo(
        () => layerExecutions.filter((layerExecution) => layerDataViews.has(layerExecution.layerId)),
        [layerExecutions, layerDataViews],
    );

    const {
        result,
        status: promiseStatus,
        error: promiseError,
    } = useCancelablePromise<IPrepareAllLayersResult, GoodDataSdkError>(
        {
            promise:
                dataStatus === "success" && layerExecutionsWithDataViews.length > 0
                    ? () =>
                          prepareAllLayers(layerExecutionsWithDataViews, layerDataViews, createAdapterContext)
                    : undefined,
        },
        [backend, workspace, dataViewsFingerprint, layersStructureFingerprint, intl],
    );

    const layerOutputs = useMemo(() => {
        const map = new Map<string, ILayerPreparedData>();
        if (result) {
            for (const entry of result.preparedData) {
                map.set(entry.layerId, entry);
            }
        }
        return map;
    }, [result]);

    const primaryLayerId = layerExecutions[0]?.layerId;
    const hasPrimaryLayerPrepared = primaryLayerId ? layerOutputs.has(primaryLayerId) : false;
    const hasLayersToPrepare = layerExecutionsWithDataViews.length > 0;
    const status: UseCancelablePromiseStatus =
        promiseStatus === "success" && hasLayersToPrepare && !hasPrimaryLayerPrepared
            ? "error"
            : promiseStatus;
    const error =
        status === "error" && !hasPrimaryLayerPrepared ? (result?.firstError ?? promiseError) : promiseError;

    return {
        layerOutputs,
        status,
        error,
    };
}
