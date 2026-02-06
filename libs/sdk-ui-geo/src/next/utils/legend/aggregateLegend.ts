// (C) 2025-2026 GoodData Corporation

import { DefaultColorPalette } from "@gooddata/sdk-ui";

import { computeAreaLegend } from "./computeAreaLegend.js";
import { computePushpinLegend } from "./computePushpinLegend.js";
import type { IGeoLayerData } from "../../context/GeoLayersContext.js";
import type { EnabledItemsByLayer } from "../../context/GeoLegendContext.js";
import { getAreaColorStrategy } from "../../layers/area/coloring/colorStrategy.js";
import { computeLegend } from "../../layers/common/computeLegend.js";
import { getPushpinColorStrategy } from "../../layers/pushpin/coloring/colorStrategy.js";
import type { IAreaGeoData } from "../../types/geoData/area.js";
import type { IPushpinGeoData } from "../../types/geoData/pushpin.js";
import { type ILegendModel, type ILegendSection } from "../../types/legend/model.js";
import type { ILayerExecutionRecord } from "../../types/props/geoChart/internal.js";

/**
 * Options for aggregating legend sections.
 *
 * @internal
 */
export interface IAggregateLegendOptions {
    /**
     * Title for the entire legend panel (typically the insight title).
     */
    title?: string;

    /**
     * Per-layer enabled legend items.
     *
     * @remarks
     * Map from layerId to enabled items for that layer.
     * If a layer is not in the map, all its items are enabled.
     * `null` value for a layer means all items are enabled.
     * Empty array means all items are disabled.
     */
    enabledItemsByLayer?: EnabledItemsByLayer;

    /**
     * Numeric symbols used for number formatting in legends (k, M, G, T, ...).
     *
     * @remarks
     * When provided, legend label formatting uses these localized symbols to match
     * legacy GeoChart behavior.
     */
    numericSymbols?: string[];
}

/**
 * Aggregates legend sections from multiple layer data into a unified legend model.
 *
 * @remarks
 * Creates a section for each layer that has legend-worthy data.
 * Sections are ordered to match the layer rendering order (as defined
 * by layerExecutions).
 *
 * @param layerExecutions - Layer execution records defining order
 * @param layers - Map of layer ID to layer data
 * @param options - Optional configuration including title
 * @returns Aggregated legend model with sections for each layer
 *
 * @internal
 */
/**
 * Applies visibility state to legend items based on enabled items.
 *
 * @param items - Base legend items
 * @param enabledItems - URIs of enabled items (null = all enabled, [] = all disabled)
 * @returns Items with updated isVisible property
 *
 * @internal
 */
function applyVisibilityState(
    items: IGeoLayerData["baseLegendItems"],
    enabledItems: string[] | null | undefined,
): IGeoLayerData["baseLegendItems"] {
    if (enabledItems === undefined || enabledItems === null) {
        // All items visible (initial state)
        return items.map((item) => ({ ...item, isVisible: true }));
    }

    if (enabledItems.length === 0) {
        // All items disabled (user explicitly disabled all)
        return items.map((item) => ({ ...item, isVisible: false }));
    }

    // Only specified items are visible
    return items.map((item) => ({
        ...item,
        isVisible: enabledItems.includes(item.uri),
    }));
}

export function aggregateLegend(
    layerExecutions: ILayerExecutionRecord[],
    layers: Map<string, IGeoLayerData>,
    options?: IAggregateLegendOptions,
): ILegendModel {
    const sections: ILegendSection[] = [];

    for (const { layerId, layer } of layerExecutions) {
        const layerData = layers.get(layerId);
        if (!layerData) {
            continue;
        }

        const { geoData, dataView } = layerData;

        // Skip layers without geoData - no legend to display
        if (!geoData) {
            continue;
        }

        const layerName = layer.name ?? layerId;

        const effectivePalette = layer.config?.colorPalette ?? DefaultColorPalette;
        const effectiveMapping = layer.config?.colorMapping ?? [];

        const colorStrategy =
            layer.type === "pushpin"
                ? getPushpinColorStrategy(
                      effectivePalette,
                      effectiveMapping,
                      geoData as IPushpinGeoData,
                      dataView,
                  )
                : getAreaColorStrategy(effectivePalette, effectiveMapping, geoData as IAreaGeoData, dataView);

        const legend = computeLegend(geoData, colorStrategy, {
            layerType: layer.type,
            hasSizeData: layer.type === "pushpin" ? Boolean((geoData as IPushpinGeoData).size) : false,
        });

        const colorScaleBaseColor = colorStrategy.getColorByIndex(0);

        // Apply visibility state to legend items using per-layer enabled items
        const enabledItemsForLayer = options?.enabledItemsByLayer?.get(layerId) ?? null;
        const legendItems = applyVisibilityState(legend.items, enabledItemsForLayer);

        const section =
            layer.type === "pushpin"
                ? computePushpinLegend({
                      layerId,
                      layerName,
                      geoData: geoData as IPushpinGeoData,
                      legendItems,
                      availableLegends: legend.available,
                      numericSymbols: options?.numericSymbols,
                      colorScaleBaseColor,
                  })
                : computeAreaLegend({
                      layerId,
                      layerName,
                      geoData: geoData as IAreaGeoData,
                      legendItems,
                      availableLegends: legend.available,
                      numericSymbols: options?.numericSymbols,
                      colorScaleBaseColor,
                  });

        // Only include sections with legend data
        if (section) {
            sections.push(section);
        }
    }

    const title = options?.title ?? sections[0]?.layerTitle;
    return {
        title,
        sections,
    };
}
