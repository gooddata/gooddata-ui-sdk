// (C) 2025-2026 GoodData Corporation

import type { AttributeDisplayFormType } from "@gooddata/sdk-model";

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

export const COORDINATE_FORM_TYPES: AttributeDisplayFormType[] = [
    "GDC.geo.pin_latitude",
    "GDC.geo.pin_longitude",
    "GDC.geo.pin",
];

/**
 * Local identifier used for the derived tooltip-text attribute in GeoChartNext executions.
 *
 * @remarks
 * GeoChartNext may inject a TOOLTIP_TEXT bucket (see `prepareExecutionWithTooltipText`) and uses
 * this localId to recognize the derived attribute across drill/tooltip handling.
 *
 * @internal
 */
export const TOOLTIP_TEXT_ATTRIBUTE_LOCAL_ID = "tooltipText_df";
