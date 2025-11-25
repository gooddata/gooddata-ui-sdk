// (C) 2025 GoodData Corporation

import { IColorPalette } from "@gooddata/sdk-model";
import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { useGeoPushData } from "./useGeoPushData.js";
import { useGeoData } from "../../context/GeoDataContext.js";
import { useGeoPushpinProps } from "../../context/GeoPushpinPropsContext.js";

/**
 * Hook to push data to analytical designer for configuration panel updates
 * @internal
 */
export function usePushData(colorStrategy: IColorStrategy | null, colorPalette: IColorPalette): void {
    useGeoPushData(colorStrategy, colorPalette, {
        useProps: useGeoPushpinProps,
        useLegendContext: useGeoData,
    });
}
