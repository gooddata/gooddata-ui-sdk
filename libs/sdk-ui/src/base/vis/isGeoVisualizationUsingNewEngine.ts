// (C) 2026 GoodData Corporation

import { type ISettings } from "@gooddata/sdk-model";

import { VisualizationTypes } from "./visualizationTypes.js";

/**
 * @internal
 */
export function isGeoVisualizationUsingNewEngine(
    visualizationType: string,
    settings: ISettings | undefined,
): boolean {
    const isNewGeoPushpin =
        visualizationType === VisualizationTypes.PUSHPIN && Boolean(settings?.enableNewGeoPushpin);
    const isNewGeoArea =
        visualizationType === VisualizationTypes.CHOROPLETH && Boolean(settings?.enableGeoArea);

    return isNewGeoPushpin || isNewGeoArea;
}
