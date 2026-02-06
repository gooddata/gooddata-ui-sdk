// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { type IGeoLayerData } from "../../context/GeoLayersContext.js";
import { useGeoLegend } from "../../context/GeoLegendContext.js";
import { type ILegendModel } from "../../types/legend/model.js";
import type { ILayerExecutionRecord } from "../../types/props/geoChart/internal.js";
import { aggregateLegend } from "../../utils/legend/aggregateLegend.js";

/**
 * Options for the multi-layer legend hook.
 *
 * @internal
 */
export interface IUseMultiLayerLegendOptions {
    /**
     * Title displayed at the top of the legend panel (typically the insight title).
     */
    title?: string;

    /**
     * Numeric symbols used for number formatting in legends (k, M, G, T, ...).
     */
    numericSymbols?: string[];
}

/**
 * Hook to compute multi-layer legend model from layer data.
 *
 * @remarks
 * Aggregates legend data from all layers into a unified model
 * that can be rendered by MultiLayerLegendPanel.
 * Legend item visibility state is automatically applied per-layer from context.
 *
 * @param layerExecutions - Layer execution records defining order
 * @param layers - Map of layer ID to layer data
 * @param options - Optional configuration including title
 * @returns Multi-layer legend model
 *
 * @internal
 */
export function useMultiLayerLegend(
    layerExecutions: ILayerExecutionRecord[],
    layers: Map<string, IGeoLayerData>,
    options?: IUseMultiLayerLegendOptions,
): ILegendModel {
    const { enabledItemsByLayer } = useGeoLegend();

    return useMemo(
        () =>
            aggregateLegend(layerExecutions, layers, {
                title: options?.title,
                numericSymbols: options?.numericSymbols,
                enabledItemsByLayer,
            }),
        [layerExecutions, layers, options?.title, options?.numericSymbols, enabledItemsByLayer],
    );
}
