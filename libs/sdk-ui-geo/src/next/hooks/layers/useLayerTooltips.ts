// (C) 2025-2026 GoodData Corporation

import { useCallback, useEffect, useMemo, useRef } from "react";

import { type IHeaderPredicate } from "@gooddata/sdk-ui";

import { type IGeoLayerData } from "../../context/GeoLayersContext.js";
import type { IMapFacade, IPopupFacade, MapMouseEvent } from "../../layers/common/mapFacade.js";
import { getLayerAdapter } from "../../layers/registry/adapterRegistry.js";
import type { IGeoAdapterContext, IGeoTooltipConfig } from "../../layers/registry/adapterTypes.js";
import { buildOutputFromLayerData } from "../../layers/registry/output.js";
import { type ILayerExecutionRecord } from "../../types/props/geoChart/internal.js";

interface IUseLayerTooltipsParams {
    /**
     * MapLibre map instance.
     */
    map: IMapFacade | null;

    /**
     * Whether the map is ready for rendering.
     */
    isMapReady: boolean;

    /**
     * Tooltip popup instance.
     */
    tooltip: IPopupFacade | null;

    /**
     * Drillable predicates for tooltip interactions.
     */
    drillablePredicates: IHeaderPredicate[];

    /**
     * Layer executions for tooltip registration.
     */
    layerExecutions: ILayerExecutionRecord[];

    /**
     * Layer data map.
     */
    layers: Map<string, IGeoLayerData>;

    /**
     * Adapter context for tooltip registration.
     */
    adapterContext: IGeoAdapterContext;
}

/**
 * Collects tooltip configuration from an adapter.
 */
function getLayerTooltipConfig(
    layerExecution: ILayerExecutionRecord,
    layerData: IGeoLayerData,
    adapterContext: IGeoAdapterContext,
    tooltip: IPopupFacade,
    drillablePredicates: IHeaderPredicate[],
): IGeoTooltipConfig | null {
    const { layer } = layerExecution;
    const adapter = getLayerAdapter(layer);
    const layerOutput = buildOutputFromLayerData(layerData);

    if (!adapter?.getTooltipConfig || !layerOutput) {
        return null;
    }

    return (
        adapter.getTooltipConfig(layer, layerOutput, adapterContext, {
            tooltip,
            drillablePredicates,
        }) ?? null
    );
}

/**
 * Hook that manages unified tooltip handling for all layers.
 *
 * @remarks
 * Registers ONE mousemove handler that queries all tooltip-enabled layers.
 * MapLibre returns features in render order (topmost first), so the tooltip
 * is shown for the visually topmost feature.
 *
 * @internal
 */
export function useLayerTooltips({
    map,
    isMapReady,
    tooltip,
    drillablePredicates,
    layerExecutions,
    layers,
    adapterContext,
}: IUseLayerTooltipsParams): void {
    const currentTooltipConfigRef = useRef<IGeoTooltipConfig | null>(null);

    const tooltipConfigs = useMemo(() => {
        if (!tooltip) {
            return [];
        }

        const configs: IGeoTooltipConfig[] = [];

        for (const layerExecution of layerExecutions) {
            const layerData = layers.get(layerExecution.layerId);
            if (!layerData) {
                continue;
            }

            const config = getLayerTooltipConfig(
                layerExecution,
                layerData,
                adapterContext,
                tooltip,
                drillablePredicates,
            );

            if (config) {
                configs.push(config);
            }
        }

        return configs;
    }, [layerExecutions, layers, adapterContext, tooltip, drillablePredicates]);

    const layerIdToConfig = useMemo(() => {
        const lookup = new Map<string, IGeoTooltipConfig>();

        for (const config of tooltipConfigs) {
            for (const layerId of config.layerIds) {
                lookup.set(layerId, config);
            }
        }

        return lookup;
    }, [tooltipConfigs]);

    const allLayerIds = useMemo(() => {
        return tooltipConfigs.flatMap((config) => config.layerIds);
    }, [tooltipConfigs]);

    const hideCurrentTooltip = useCallback((mapInstance: IMapFacade | null) => {
        if (currentTooltipConfigRef.current && mapInstance) {
            currentTooltipConfigRef.current.hideTooltip(mapInstance);
            currentTooltipConfigRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!map || !isMapReady || allLayerIds.length === 0) {
            hideCurrentTooltip(map);
            return;
        }

        const handleMouseMove = (e: MapMouseEvent) => {
            const existingLayerIds = allLayerIds.filter((id) => map.getLayer(id));

            if (existingLayerIds.length === 0) {
                hideCurrentTooltip(map);
                return;
            }

            const features = map.queryRenderedFeatures(e.point, {
                layers: existingLayerIds,
            });

            if (features && features.length > 0) {
                const topFeature = features[0];
                const featureLayerId = topFeature.layer?.id;

                if (featureLayerId) {
                    const config = layerIdToConfig.get(featureLayerId);

                    if (config) {
                        if (currentTooltipConfigRef.current && currentTooltipConfigRef.current !== config) {
                            currentTooltipConfigRef.current.hideTooltip(map);
                        }

                        config.showTooltip(map, topFeature, e.lngLat);
                        currentTooltipConfigRef.current = config;
                        return;
                    }
                }
            }

            hideCurrentTooltip(map);
        };

        map.on("mousemove", handleMouseMove);

        return () => {
            map.off("mousemove", handleMouseMove);
            hideCurrentTooltip(map);
        };
    }, [map, isMapReady, allLayerIds, layerIdToConfig, hideCurrentTooltip]);
}
