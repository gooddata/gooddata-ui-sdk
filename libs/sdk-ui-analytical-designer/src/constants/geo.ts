// (C) 2007-2026 GoodData Corporation

import { CHOROPLETH, PUSHPIN } from "./visualization_types.js";

export type GeoLabelType = "location" | "area";

export function getGeoLabelTypeFromVisualization(visualizationType?: string): GeoLabelType | undefined {
    if (visualizationType === PUSHPIN) {
        return "location";
    }
    if (visualizationType === CHOROPLETH) {
        return "area";
    }
    return undefined;
}
