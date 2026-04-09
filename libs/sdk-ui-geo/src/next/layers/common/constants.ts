// (C) 2025-2026 GoodData Corporation

import type { GeoLayerType } from "../../types/layers/index.js";

export const MAPLIBRE_LAYER_TYPE_PREFIXES: Record<GeoLayerType, string> = {
    pushpin: "pushpin-layer",
    area: "area-fill",
};

export const GEO_LAYER_DRILL_TYPE = {
    pushpin: "pushpin",
    area: "choropleth",
} as const;

export const GEO_LAYER_DRILL_ELEMENT = {
    pushpin: "pushpin",
    area: "pushpin",
} as const;

/**
 * Local identifier used for the derived tooltip-text attribute in GeoChart executions.
 *
 * @remarks
 * GeoChart may inject a TOOLTIP_TEXT bucket (see `prepareExecutionWithTooltipText`) and uses
 * this localId to recognize the derived attribute across drill/tooltip handling.
 *
 * @internal
 */
export const TOOLTIP_TEXT_ATTRIBUTE_LOCAL_ID = "tooltipText_df";

/**
 * Local identifier used for the derived geo-icon attribute in GeoChart executions.
 *
 * @remarks
 * When `shapeType` is `"iconByValue"` and no explicit `geoIcon` attribute is provided,
 * the adapter resolves the `GDC.geo.icon` display form from the latitude attribute's
 * parent and injects a GEO_ICON bucket with this localId.
 *
 * @internal
 */
export const GEO_ICON_ATTRIBUTE_LOCAL_ID = "geoIcon_df";

/**
 * Opacity applied to unselected features when cross-filtering is active.
 *
 * @internal
 */
export const CROSS_FILTER_UNSELECTED_OPACITY = 0.2;

/**
 * GeoJSON feature property name that indicates whether a feature is selected.
 *
 * @internal
 */
export const SELECTED_FEATURE_PROPERTY = "__selected";
