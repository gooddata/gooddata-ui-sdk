// (C) 2025 GoodData Corporation

import type { IntlShape } from "react-intl";

import type { IAnalyticalBackend, IExecutionFactory, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import type { IColorPalette, IExecutionConfig, INullableFilter } from "@gooddata/sdk-model";
import type { DataViewFacade, IHeaderPredicate } from "@gooddata/sdk-ui";
import type { IColorMapping, IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import type { IAvailableLegends, IGeoLegendItem } from "../../types/common/legends.js";
import type { IGeoChartNextConfig } from "../../types/config/unified.js";
import type { IAreaGeoData } from "../../types/geoData/area.js";
import type { IPushpinGeoData } from "../../types/geoData/pushpin.js";
import type { GeoLayerType, IGeoLayer, IGeoLayerArea, IGeoLayerPushpin } from "../../types/layers/index.js";
import type { IMapViewport } from "../../types/map/provider.js";
import type {
    FilterSpecification,
    GeoJSONSourceSpecification,
    IMapFacade,
    IPopupFacade,
} from "../common/mapFacade.js";

/**
 * Context provided to adapter methods.
 *
 * @remarks
 * Contains everything needed to interact with the backend and configure layer behavior.
 * Used by `buildExecution` and `prepareLayer` methods.
 *
 * @internal
 */
export interface IGeoAdapterContext {
    /**
     * Analytical backend instance for data fetching.
     */
    backend: IAnalyticalBackend;

    /**
     * Workspace identifier.
     */
    workspace: string;

    /**
     * Optional chart configuration (colors, clustering, etc.).
     */
    config?: IGeoChartNextConfig;

    /**
     * Optional execution configuration.
     */
    execConfig?: IExecutionConfig;

    /**
     * Filters that must be applied to every layer execution (e.g., InsightView/global filters).
     *
     * @remarks
     * These filters are applied *after* `IGeoLayer.filters` and therefore take precedence for filter types
     * with “last wins” merge rules (e.g. date filters for the same dataset, measure value filters for the
     * same measure). Other filter types may accumulate according to SDK merge semantics.
     */
    globalFilters?: INullableFilter[];

    /**
     * Execution factory provided by hosting environment.
     *
     * @remarks
     * Adapters should use this factory when available so upstream decorators
     * (telemetry, fixed filters, etc.) are preserved.
     */
    executionFactory?: IExecutionFactory;

    /**
     * Color palette for coloring features.
     *
     * @remarks
     * Required for `prepareLayer`, optional for `buildExecution`.
     */
    colorPalette?: IColorPalette;

    /**
     * Custom color mappings for specific items.
     *
     * @remarks
     * Required for `prepareLayer`, optional for `buildExecution`.
     */
    colorMapping?: IColorMapping[];

    /**
     * react-intl instance for localized strings.
     *
     * @remarks
     * Required for `prepareLayer` and `registerTooltips`, optional for `buildExecution`.
     */
    intl?: IntlShape;
}

/**
 * Legend computation result.
 *
 * @internal
 */
export interface IGeoLegendResult {
    /**
     * Category legend items (e.g., segment values with colors).
     */
    items: IGeoLegendItem[];

    /**
     * Flags indicating which legend types are available for this layer.
     */
    available: IAvailableLegends;
}

/**
 * Unified output from layer preparation, ready for map rendering.
 *
 * @remarks
 * Contains GeoJSON features with all styling/data properties baked in,
 * plus legend metadata. The `syncToMap` method just applies this output
 * to the map - no further transformation needed.
 *
 * @typeParam TGeoData - The specific geo data type (IPushpinGeoData or IAreaGeoData)
 *
 * @internal
 */
export interface IGeoLayerOutput<
    TGeoData extends IPushpinGeoData | IAreaGeoData = IPushpinGeoData | IAreaGeoData,
> {
    /**
     * Complete GeoJSON source specification ready for MapLibre.
     *
     * @remarks
     * Contains all features with styling properties (colors, sizes, etc.)
     * and source configuration (clustering, etc.). The `syncToMap` method
     * can apply this directly to the map without further transformation.
     */
    source: GeoJSONSourceSpecification;

    /**
     * Legend data computed from the layer.
     */
    legend: IGeoLegendResult;

    /**
     * Transformed geographic data.
     *
     * @remarks
     * Contains the processed analytical data with geo coordinates.
     * Used for context registration and tooltip rendering.
     */
    geoData: TGeoData;

    /**
     * Color strategy used for this layer.
     *
     * @remarks
     * Contains color assignments for features based on data values.
     * Used for context registration and legend rendering.
     */
    colorStrategy: IColorStrategy;

    /**
     * Optional viewport suggestion based on layer data.
     */
    initialViewport?: Partial<IMapViewport> | null;
}

/**
 * Output type for pushpin layer adapter.
 *
 * @internal
 */
export type IPushpinLayerOutput = IGeoLayerOutput<IPushpinGeoData>;

/**
 * Output type for area layer adapter.
 *
 * @internal
 */
export type IAreaLayerOutput = IGeoLayerOutput<IAreaGeoData>;

/**
 * Resolve the concrete layer type based on the Geo layer discriminator.
 *
 * @internal
 */
type GeoLayerByType<TType extends GeoLayerType> = TType extends "pushpin" ? IGeoLayerPushpin : IGeoLayerArea;

/**
 * Resolve the corresponding adapter output type for the given layer discriminator.
 *
 * @internal
 */
type GeoLayerOutputByType<TType extends GeoLayerType> = TType extends "pushpin"
    ? IPushpinLayerOutput
    : IAreaLayerOutput;

/**
 * Convenience alias for strongly typed adapters keyed by layer discriminator.
 *
 * @internal
 */
export type IGeoLayerAdapterByType<TType extends GeoLayerType> = IGeoLayerAdapter<
    GeoLayerByType<TType>,
    GeoLayerOutputByType<TType>
>;

/**
 * Parameters for registering tooltip handlers.
 *
 * @internal
 */
export interface IGeoLayerTooltipParams {
    tooltip: IPopupFacade;
    drillablePredicates: IHeaderPredicate[];
}

/**
 * Tooltip configuration returned by adapters for unified tooltip handling.
 *
 * @internal
 */
export interface IGeoTooltipConfig {
    /**
     * MapLibre layer IDs that this adapter handles for tooltips.
     */
    layerIds: string[];

    /**
     * Show tooltip for a feature from one of the configured layers.
     *
     * @param map - Map facade for cursor styling
     * @param feature - The GeoJSON feature to show tooltip for
     * @param lngLat - Coordinates for tooltip positioning
     */
    showTooltip(map: IMapFacade, feature: GeoJSON.Feature, lngLat: { lng: number; lat: number }): void;

    /**
     * Hide tooltip when cursor leaves all configured layers.
     *
     * @param map - Map facade for cursor reset
     */
    hideTooltip(map: IMapFacade): void;
}

/**
 * Adapter interface for geo layer types.
 *
 * @remarks
 * Each layer type (pushpin, area, etc.) has its own adapter implementation.
 * The adapter encapsulates all layer-specific logic:
 * - Building the analytics execution
 * - Fetching external resources (e.g., GeoJSON boundaries for areas)
 * - Transforming data to GeoJSON features
 * - Computing legends
 * - Syncing to the map
 *
 * **Lifecycle:**
 * 1. `buildExecution` - called once when layer is added, returns prepared execution
 * 2. `prepareLayer` - called when execution completes, transforms data to renderable output
 * 3. `syncToMap` - called when map is ready, applies output to MapLibre instance
 * 4. `removeFromMap` - called when layer is removed, cleans up map resources
 *
 * @typeParam TLayer - The specific layer type (IGeoLayerPushpin or IGeoLayerArea)
 * @typeParam TOutput - The specific output type (IPushpinLayerOutput or IAreaLayerOutput)
 *
 * @internal
 */
export interface IGeoLayerAdapter<
    TLayer extends IGeoLayer,
    TOutput extends IGeoLayerOutput = IGeoLayerOutput,
> {
    /**
     * Layer type discriminator. Must match `TLayer["type"]`.
     */
    readonly type: TLayer["type"];

    /**
     * Build analytics execution for the layer.
     *
     * @remarks
     * Called once when layer is registered. The execution fetches analytical
     * data (measures, attributes) from the backend.
     *
     * @param layer - Layer definition with buckets (measures, attributes, filters)
     * @param context - Backend and configuration context
     * @returns Prepared execution ready to be executed
     */
    buildExecution(layer: TLayer, context: IGeoAdapterContext): IPreparedExecution;

    /**
     * Prepare layer output from execution result.
     *
     * @remarks
     * Called when analytics execution completes successfully.
     * Adapter is responsible for:
     * - Transforming analytical data to geo coordinates
     * - Fetching any external resources (e.g., GeoJSON boundaries for area layers)
     * - Creating color strategy based on the data and config
     * - Building final GeoJSON features with all properties
     * - Computing legend data
     *
     * Returns null if the data is not suitable for rendering (e.g., empty result).
     *
     * @param layer - Layer definition
     * @param dataView - Execution result facade
     * @param context - Backend and configuration context (includes color palette and mapping)
     * @returns Layer output ready for rendering, or null if not renderable
     */
    prepareLayer(
        layer: TLayer,
        dataView: DataViewFacade,
        context: IGeoAdapterContext,
    ): Promise<TOutput | null>;

    /**
     * Apply prepared output to the map.
     *
     * @remarks
     * Called when map is ready and output is prepared.
     * Should be idempotent - safe to call multiple times with same output.
     * Implementation should handle MapLibre source/layer lifecycle
     * (remove existing, add new).
     *
     * The output contains a complete GeoJSONSourceSpecification that can be
     * applied directly to the map without further transformation.
     *
     * @param layer - Layer definition (use `layer.id` for MapLibre source/layer IDs)
     * @param map - Map facade instance used to manipulate layers
     * @param output - Prepared layer output with complete source specification
     */
    syncToMap(layer: TLayer, map: IMapFacade, output: TOutput, context: IGeoAdapterContext): void;

    /**
     * Get tooltip configuration for unified tooltip handling.
     *
     * @remarks
     * Returns configuration that allows the unified tooltip handler to manage
     * tooltips for this layer type. The handler queries all layer IDs at once
     * and shows the tooltip for the topmost feature.
     *
     * @param layer - Layer definition
     * @param output - Prepared layer output
     * @param context - Adapter context
     * @param params - Tooltip helpers (popup instance, drill predicates)
     * @returns Tooltip configuration or undefined if no tooltips needed
     */
    getTooltipConfig?(
        layer: TLayer,
        output: TOutput,
        context: IGeoAdapterContext,
        params: IGeoLayerTooltipParams,
    ): IGeoTooltipConfig | undefined;

    /**
     * Remove layer from the map.
     *
     * @remarks
     * Called when layer is removed from the chart.
     * Should clean up all MapLibre sources and layers created by this adapter.
     *
     * @param layer - Layer definition
     * @param map - Map facade instance
     */
    removeFromMap(layer: TLayer, map: IMapFacade): void;

    /**
     * Get all MapLibre layer IDs created by this adapter.
     *
     * @remarks
     * Returns the IDs of all MapLibre layers that this adapter manages.
     * Used for visibility toggling without removing/re-adding layers.
     *
     * @param layer - Layer definition
     * @returns Array of MapLibre layer IDs
     */
    getMapLibreLayerIds(layer: TLayer): string[];

    /**
     * Get MapLibre layer IDs that support segment filtering.
     *
     * @remarks
     * Returns the IDs of layers that can be filtered by segment URIs.
     * This is typically the main data layers (not cluster or label layers).
     * Used for efficient filter updates without removing/re-adding layers.
     *
     * @param layer - Layer definition
     * @returns Array of filterable MapLibre layer IDs
     *
     * @deprecated Use getFilterableLayers instead
     */
    getFilterableLayerIds?(layer: TLayer): string[];

    /**
     * Get MapLibre layers that support segment filtering with their base filters.
     *
     * @remarks
     * Returns layer IDs along with any base filter that must be preserved.
     * The segment filter will be combined with the base filter using "all".
     * Used for efficient filter updates without removing/re-adding layers.
     *
     * @param layer - Layer definition
     * @returns Array of filterable layer configs with base filters
     */
    getFilterableLayers?(layer: TLayer): Array<{ layerId: string; baseFilter?: FilterSpecification }>;
}
