// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import type { IntlShape } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { IColorPalette, IExecutionConfig } from "@gooddata/sdk-model";
import {
    type DataViewFacade,
    DefaultColorPalette,
    type GoodDataSdkError,
    UnexpectedSdkError,
    type UseCancelablePromiseStatus,
    useCancelablePromise,
} from "@gooddata/sdk-ui";
import type { IColorMapping } from "@gooddata/sdk-ui-vis-commons";

import { getLayerAdapter } from "../../layers/registry/adapterRegistry.js";
import type { IGeoAdapterContext, IGeoLayerOutput } from "../../layers/registry/adapterTypes.js";
import type { IGeoChartNextConfig } from "../../types/config/unified.js";
import type { ILayerExecutionRecord } from "../../types/props/geoChartNext/internal.js";
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

/**
 * Result of preparing all layer outputs.
 *
 * @internal
 */
export interface ILayersPrepareResult {
    /**
     * Map of layerId to prepared layer data.
     * Empty until all layers are prepared successfully.
     */
    layerOutputs: Map<string, ILayerPreparedData>;

    /**
     * Combined preparation status for all layers.
     * - "pending" if no dataViews provided or dataViews not ready
     * - "loading" while any preparation is in progress
     * - "success" when all preparations complete successfully
     * - "error" if any preparation fails
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
    config?: IGeoChartNextConfig;
    execConfig?: IExecutionConfig;
    colorPalette?: IColorPalette;
    colorMapping?: IColorMapping[];
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
    adapterContext: IGeoAdapterContext,
): Promise<ILayerPreparedData[]> {
    return Promise.all(layerExecutions.map((le) => prepareSingleLayer(le, layerDataViews, adapterContext)));
}

/**
 * Hook that prepares all layer outputs in parallel once dataViews are available.
 *
 * @remarks
 * Calls adapter's `prepareLayer` for each layer simultaneously using Promise.all.
 * Only runs when all dataViews are available (status from useLayersData is "success").
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

    const colorPalette = useMemo(
        () => context.colorPalette ?? config?.colorPalette ?? DefaultColorPalette,
        [context.colorPalette, config?.colorPalette],
    );

    const colorMapping = useMemo(
        () => context.colorMapping ?? config?.colorMapping ?? [],
        [context.colorMapping, config?.colorMapping],
    );

    const dataViewsFingerprint = useMemo(
        () => createDataViewsFingerprint(layerDataViews, dataStatus === "success"),
        [dataStatus, layerDataViews],
    );

    const configFingerprint = useMemo(() => {
        return JSON.stringify({
            colorPalette: colorPalette?.map((c) => c.guid),
            colorMapping: colorMapping?.map((m) => m.color),
        });
    }, [colorPalette, colorMapping]);

    // Fingerprint that captures bucket structure (which items are in which buckets).
    // This detects when measures are moved between buckets (e.g., COLOR to SIZE)
    // even when the underlying data is the same.
    const layersStructureFingerprint = useMemo(
        () => createLayersStructureFingerprint(layerExecutions),
        [layerExecutions],
    );

    const adapterContext: IGeoAdapterContext = {
        backend,
        workspace,
        config,
        execConfig,
        colorPalette,
        colorMapping,
        intl,
    };

    const { result, status, error } = useCancelablePromise<ILayerPreparedData[], GoodDataSdkError>(
        {
            promise:
                dataStatus === "success" && layerExecutions.length > 0
                    ? () => prepareAllLayers(layerExecutions, layerDataViews, adapterContext)
                    : undefined,
        },
        [backend, workspace, dataViewsFingerprint, configFingerprint, layersStructureFingerprint, intl],
    );

    const layerOutputs = useMemo(() => {
        const map = new Map<string, ILayerPreparedData>();
        if (result) {
            for (const entry of result) {
                map.set(entry.layerId, entry);
            }
        }
        return map;
    }, [result]);

    return {
        layerOutputs,
        status,
        error,
    };
}
