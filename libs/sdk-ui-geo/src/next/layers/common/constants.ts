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
