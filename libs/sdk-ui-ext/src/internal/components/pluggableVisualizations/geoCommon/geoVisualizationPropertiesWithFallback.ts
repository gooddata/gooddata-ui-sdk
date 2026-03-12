// (C) 2026 GoodData Corporation

import { type IVisualizationProperties } from "../../../interfaces/Visualization.js";

type GeoVisualizationControls = NonNullable<IVisualizationProperties["controls"]>;

export function getGeoControlsWithFallback(
    visualizationProperties: IVisualizationProperties,
    insightControlsWithFallback: GeoVisualizationControls,
): GeoVisualizationControls {
    return {
        ...insightControlsWithFallback,
        ...(visualizationProperties.controls ?? {}),
    };
}

export function getGeoVisualizationPropertiesWithFallback(
    visualizationProperties: IVisualizationProperties,
    insightControlsWithFallback: GeoVisualizationControls,
): IVisualizationProperties {
    return {
        ...visualizationProperties,
        controls: getGeoControlsWithFallback(visualizationProperties, insightControlsWithFallback),
    };
}
