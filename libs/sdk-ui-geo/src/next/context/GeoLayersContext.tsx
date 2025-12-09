// (C) 2025 GoodData Corporation

import { ReactNode, createContext, useContext, useMemo } from "react";

import { IColorPalette } from "@gooddata/sdk-model";
import { DataViewFacade } from "@gooddata/sdk-ui";
import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import type { ILayerPreparedData } from "../hooks/layers/useLayersPrepare.js";
import type { GeoJSONSourceSpecification } from "../layers/common/mapFacade.js";
import { IAvailableLegends, IGeoLegendItem } from "../types/common/legends.js";
import { IAreaGeoData } from "../types/geoData/area.js";
import { IPushpinGeoData } from "../types/geoData/pushpin.js";
import { GeoLayerType } from "../types/layers/index.js";
import type { IMapViewport } from "../types/map/provider.js";
import { ILayerExecutionRecord } from "../types/props/geoChartNext/internal.js";

const EMPTY_AVAILABLE_LEGENDS: IAvailableLegends = {
    hasCategoryLegend: false,
    hasColorLegend: false,
    hasSizeLegend: false,
};

const EMPTY_LEGEND_ITEMS: IGeoLegendItem[] = [];

/**
 * Data for a single layer including transformed geo data and color strategy.
 *
 * @remarks
 * This interface represents fully loaded layer data - all async operations
 * have completed before this data is created.
 *
 * @internal
 */
export interface IGeoLayerData {
    /**
     * Layer ID for reference.
     */
    layerId: string;

    /**
     * Layer type.
     */
    layerType: GeoLayerType;

    /**
     * Complete GeoJSON source specification ready for MapLibre.
     */
    source: GeoJSONSourceSpecification | null;

    /**
     * Transformed geographic data.
     */
    geoData: IPushpinGeoData | IAreaGeoData | null;

    /**
     * Data view from execution.
     */
    dataView: DataViewFacade;

    /**
     * Color strategy for this layer.
     */
    colorStrategy: IColorStrategy | null;

    /**
     * Legend items for this layer.
     */
    baseLegendItems: IGeoLegendItem[];

    /**
     * Available legend types.
     */
    availableLegends: IAvailableLegends;

    /**
     * Initial viewport hint derived from the layer data.
     */
    initialViewport: Partial<IMapViewport> | null;
}

/**
 * Context value for multi-layer geo data.
 *
 * @remarks
 * This context is only created after all async data loading is complete.
 * All data is pre-loaded and ready for synchronous rendering.
 *
 * @internal
 */
export interface IGeoLayersContext {
    /**
     * Layer executions for reference.
     */
    layerExecutions: ILayerExecutionRecord[];

    /**
     * Data for all layers (pre-loaded).
     */
    layers: Map<string, IGeoLayerData>;

    /**
     * Primary (first) layer data - used for legend/tooltips.
     */
    primaryLayer: IGeoLayerData | null;

    /**
     * Color palette used.
     */
    colorPalette: IColorPalette;
}

const GeoLayersContext = createContext<IGeoLayersContext | undefined>(undefined);

/**
 * Provider that exposes pre-loaded layer data through context.
 *
 * @remarks
 * This provider receives already-loaded data from the data loading gate.
 * No async operations happen here - data is ready for synchronous rendering.
 *
 * @internal
 */
export function GeoLayersProvider({
    children,
    layerExecutions,
    layerOutputs,
    colorPalette,
}: {
    children: ReactNode;
    layerExecutions: ILayerExecutionRecord[];
    layerOutputs: Map<string, ILayerPreparedData>;
    colorPalette: IColorPalette;
}) {
    const layersData = useMemo(() => {
        const map = new Map<string, IGeoLayerData>();
        for (const layerExecution of layerExecutions) {
            const { layerId, layer } = layerExecution;
            const prepared = layerOutputs.get(layerId);
            if (prepared) {
                map.set(layerId, {
                    layerId,
                    layerType: layer.type,
                    source: prepared.output?.source ?? null,
                    geoData: prepared.output?.geoData ?? null,
                    dataView: prepared.dataView,
                    colorStrategy: prepared.output?.colorStrategy ?? null,
                    baseLegendItems: prepared.output?.legend.items ?? EMPTY_LEGEND_ITEMS,
                    availableLegends: prepared.output?.legend.available ?? EMPTY_AVAILABLE_LEGENDS,
                    initialViewport: prepared.output?.initialViewport ?? null,
                });
            }
        }
        return map;
    }, [layerExecutions, layerOutputs]);

    const primaryLayerId = layerExecutions[0]?.layerId;
    const primaryLayer = primaryLayerId ? (layersData.get(primaryLayerId) ?? null) : null;

    const value = useMemo<IGeoLayersContext>(
        () => ({
            layerExecutions,
            layers: layersData,
            primaryLayer,
            colorPalette,
        }),
        [layerExecutions, layersData, primaryLayer, colorPalette],
    );

    return <GeoLayersContext.Provider value={value}>{children}</GeoLayersContext.Provider>;
}

/**
 * Hook to access multi-layer geo data context
 *
 * @returns Layer data context
 * @throws Error if used outside of GeoLayersProvider
 *
 * @internal
 */
export function useGeoLayers(): IGeoLayersContext {
    const context = useContext(GeoLayersContext);

    if (context === undefined) {
        throw new Error("useGeoLayers must be used within a GeoLayersProvider");
    }

    return context;
}
