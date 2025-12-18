// (C) 2025 GoodData Corporation

import { type ReactElement, useCallback, useMemo } from "react";

import { type ContentRect } from "react-measure";

import { MultiLayerLegendPanel } from "./MultiLayerLegendPanel.js";
import type { IGeoLayerData } from "../../context/GeoLayersContext.js";
import { useGeoLegend } from "../../context/GeoLegendContext.js";
import { useLegendConfig } from "../../hooks/legend/useLegendConfig.js";
import { useLegendDetails } from "../../hooks/legend/useLegendDetails.js";
import { useMultiLayerLegend } from "../../hooks/legend/useMultiLayerLegend.js";
import type { IGeoChartNextConfig } from "../../types/config/unified.js";
import type { ILayerExecutionRecord } from "../../types/props/geoChartNext/internal.js";

/**
 * Internal container for GeoChartNext legend overlay.
 *
 * @remarks
 * Encapsulates legend wiring (model aggregation, config/position resolution, and context callbacks)
 * so `RenderGeoChartNext` stays focused on layout and map orchestration.
 *
 * @internal
 */
export interface IGeoChartNextLegendOverlayProps {
    config: IGeoChartNextConfig | undefined;
    chartContainerRect: ContentRect | null;
    layers: Map<string, IGeoLayerData>;
    layerExecutions: ILayerExecutionRecord[];
    primaryLayer: IGeoLayerData | null;
    numericSymbols?: string[];
}

/**
 * Renders the multi-layer legend panel as a map overlay.
 *
 * @internal
 */
export function GeoChartNextLegendOverlay({
    config,
    chartContainerRect,
    layers,
    layerExecutions,
    primaryLayer,
    numericSymbols,
}: IGeoChartNextLegendOverlayProps): ReactElement | null {
    const { toggleLegendItem, toggleLayerVisibility, hiddenLayers } = useGeoLegend();

    const model = useMultiLayerLegend(layerExecutions, layers, { numericSymbols });

    const legendConfig = useLegendConfig(config);
    const legendDetails = useLegendDetails(
        config,
        primaryLayer?.geoData ?? null,
        chartContainerRect ?? undefined,
    );
    const position = legendDetails?.position ?? legendConfig.position;

    const handleLegendItemClick = useCallback(
        (layerId: string, uri: string) => {
            const layerData = layers.get(layerId);
            const allUrisForLayer = layerData?.baseLegendItems.map((item) => item.uri) ?? [];
            toggleLegendItem(layerId, uri, allUrisForLayer);
        },
        [layers, toggleLegendItem],
    );

    const handleLayerVisibilityChange = useCallback(
        (layerId: string) => {
            toggleLayerVisibility(layerId);
        },
        [toggleLayerVisibility],
    );

    const enabled = useMemo(() => legendConfig.enabled, [legendConfig.enabled]);

    return (
        <MultiLayerLegendPanel
            enabled={enabled}
            model={model}
            position={position}
            hiddenLayers={hiddenLayers}
            onLayerVisibilityChange={handleLayerVisibilityChange}
            onItemClick={handleLegendItemClick}
        />
    );
}
