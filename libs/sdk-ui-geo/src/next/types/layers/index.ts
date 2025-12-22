// (C) 2025 GoodData Corporation

import {
    type IAttribute,
    type IAttributeOrMeasure,
    type INullableFilter,
    type ISortItem,
} from "@gooddata/sdk-model";

/**
 * Layer types supported by GeoChartNext.
 *
 * @remarks
 * GeoChartNext supports two types of geographic layers:
 * - `"pushpin"` - Point data visualization using markers/pins
 * - `"area"` - Region visualization using filled polygons (choropleth maps)
 *
 * @alpha
 */
export type GeoLayerType = "pushpin" | "area";

/**
 * Base interface for all geo layer configurations.
 *
 * @remarks
 * This interface defines the common properties shared by all layer types.
 * Each layer operates independently with its own data execution, allowing
 * different data sources, filters, and configurations per layer.
 *
 * @alpha
 */
export interface IGeoLayerBase {
    /**
     * Unique identifier for this layer.
     *
     * @remarks
     * Used internally to track layer state and for debugging purposes.
     * Each layer in a GeoChartNext must have a unique id.
     */
    id: string;

    /**
     * Human-readable name for the layer.
     *
     * @remarks
     * Optional display name that may be shown in legends or tooltips.
     * If not provided, the layer id is used.
     */
    name?: string;

    /**
     * Layer type discriminator.
     *
     * @remarks
     * Determines the rendering mode for this layer.
     * Use `"pushpin"` for point/marker data or `"area"` for region/polygon data.
     */
    type: GeoLayerType;

    /**
     * Color measure or attribute for this layer.
     *
     * @remarks
     * When a measure is provided, colors are determined by the measure values
     * using a color scale (gradient). When an attribute is provided, colors
     * are assigned categorically based on attribute values.
     *
     * For pushpin layers, this affects the fill color of the markers.
     * For area layers, this affects the fill color of the regions.
     */
    color?: IAttributeOrMeasure;

    /**
     * Segment attribute for categorization.
     *
     * @remarks
     * Groups data points by the specified attribute, creating separate
     * visual categories with distinct colors. When segmentBy is used,
     * a category legend is displayed.
     *
     * For pushpin layers, different segments get different marker colors.
     * For area layers, different segments get different fill colors.
     */
    segmentBy?: IAttribute;

    /**
     * Filters specific to this layer.
     *
     * @remarks
     * Array of filters applied only to this layer's data execution.
     *
     * These filters are applied **before** any global/component-level filters (e.g. `GeoChartNext.filters`).
     * When both layer and global filters are provided, the global filters are applied *after* the layer
     * filters and therefore take precedence for filter types with “last wins” merge rules (for example
     * date filters for the same date dataset or measure value filters for the same measure). Other filter
     * types may accumulate according to SDK merge semantics.
     */
    filters?: INullableFilter[];

    /**
     * Sorting for this layer.
     *
     * @remarks
     * Defines how data points are sorted for this layer.
     * Sorting can affect tooltip display order and rendering priority.
     */
    sortBy?: ISortItem[];
}

/**
 * Pushpin layer configuration.
 *
 * @remarks
 * A pushpin layer renders point data on the map as markers/pins.
 * It requires separate latitude and longitude attributes to specify geographic coordinates.
 *
 * Features:
 * - **Size scaling**: Use the `size` property to vary marker sizes based on a measure
 * - **Color coding**: Use the `color` property for measure-based gradients or attribute-based categories
 * - **Segmentation**: Use `segmentBy` to group markers by category with distinct colors
 * - **Clustering**: Configure point clustering in the chart config for better performance with many points
 * @alpha
 */
export interface IGeoLayerPushpin extends IGeoLayerBase {
    type: "pushpin";

    /**
     * Latitude attribute.
     *
     * @remarks
     * An attribute containing latitude values (decimal degrees, -90 to 90).
     * Must be used together with `longitude`.
     */
    latitude: IAttribute;

    /**
     * Longitude attribute.
     *
     * @remarks
     * An attribute containing longitude values (decimal degrees, -180 to 180).
     * Must be used together with `latitude`.
     */
    longitude: IAttribute;

    /**
     * Size measure for pushpins.
     *
     * @remarks
     * When provided, marker sizes are scaled based on the measure values.
     * Larger values result in larger markers. The scaling range can be
     * configured via `config.points.minSize` and `config.points.maxSize`.
     *
     * If not provided, all markers are rendered at a uniform size.
     */
    size?: IAttributeOrMeasure;
}

/**
 * Area layer configuration.
 *
 * @remarks
 * An area layer renders geographic regions (countries, states, provinces, etc.)
 * as filled polygons, creating a choropleth map visualization.
 *
 * The area attribute should reference a geographic attribute whose values
 * map to known geographic regions. The component uses geocoding to match
 * attribute values to geographic boundaries.
 *
 * Supported region types include:
 * - Countries (by name or ISO code)
 * - States/Provinces
 * - Administrative regions
 * - Custom geographic boundaries
 *
 * Features:
 * - **Color-coded regions**: Use the `color` property for data-driven fill colors
 * - **Segmentation**: Use `segmentBy` to categorize regions
 * - **Opacity control**: Configure fill opacity via chart config
 * @alpha
 */
export interface IGeoLayerArea extends IGeoLayerBase {
    type: "area";

    /**
     * Geographic area attribute.
     *
     * @remarks
     * An attribute whose values represent geographic regions (countries, states,
     * provinces, etc.). The attribute values are geocoded to match geographic
     * boundaries for polygon rendering.
     *
     * For best results, use standardized region names or ISO codes that can
     * be reliably matched to geographic boundaries.
     */
    area: IAttribute;
}

/**
 * Union type for all layer configurations.
 *
 * @remarks
 * Use this type when working with layers that could be either pushpin or area type.
 * Use the {@link isGeoLayerPushpin} and {@link isGeoLayerArea} type guards to
 * narrow the type in conditional logic.
 * @alpha
 */
export type IGeoLayer = IGeoLayerPushpin | IGeoLayerArea;

/**
 * Type guard for pushpin layer.
 *
 * @remarks
 * Use this function to narrow an {@link IGeoLayer} to {@link IGeoLayerPushpin}
 * when you need to access pushpin-specific properties like `latitude`,
 * `longitude`, or `size`.
 *
 * @param layer - The layer to check
 * @returns true if the layer is a pushpin layer, false otherwise
 * @alpha
 */
export function isGeoLayerPushpin(layer: IGeoLayer): layer is IGeoLayerPushpin {
    return layer.type === "pushpin";
}

/**
 * Type guard for area layer.
 *
 * @remarks
 * Use this function to narrow an {@link IGeoLayer} to {@link IGeoLayerArea}
 * when you need to access area-specific properties like `area`.
 *
 * @param layer - The layer to check
 * @returns true if the layer is an area layer, false otherwise
 * @alpha
 */
export function isGeoLayerArea(layer: IGeoLayer): layer is IGeoLayerArea {
    return layer.type === "area";
}
