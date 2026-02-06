// (C) 2025-2026 GoodData Corporation

import { type ReactElement, useMemo } from "react";

import { DefaultColorPalette } from "@gooddata/sdk-ui";
import { type IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { useGeoChartProps } from "../context/GeoChartContext.js";
import { useGeoLayers } from "../context/GeoLayersContext.js";
import { useGeoPushData } from "../hooks/pushData/useGeoPushData.js";
import { getAreaColorStrategy } from "../layers/area/coloring/colorStrategy.js";
import { getPushpinColorStrategy } from "../layers/pushpin/coloring/colorStrategy.js";
import { type IAvailableLegends } from "../types/common/legends.js";
import { type GeoLayerType } from "../types/layers/index.js";

type PushDataSyncProps = {
    availableLegends?: IAvailableLegends;
    geoLayerType: GeoLayerType;
};

const EMPTY_COLOR_MAPPING: [] = [];

export function PushDataSync({ availableLegends, geoLayerType }: PushDataSyncProps): ReactElement | null {
    const { primaryLayer, layerExecutions } = useGeoLayers();
    const primaryLayerDefinition = layerExecutions[0]?.layer;
    const colorPalette = primaryLayerDefinition?.config?.colorPalette ?? DefaultColorPalette;
    const colorMapping = primaryLayerDefinition?.config?.colorMapping ?? EMPTY_COLOR_MAPPING;

    const colorStrategy: IColorStrategy | null = useMemo(() => {
        if (!primaryLayer?.geoData || !primaryLayer.dataView) {
            return null;
        }

        return primaryLayer.layerType === "pushpin"
            ? getPushpinColorStrategy(colorPalette, colorMapping, primaryLayer.geoData, primaryLayer.dataView)
            : getAreaColorStrategy(colorPalette, colorMapping, primaryLayer.geoData, primaryLayer.dataView);
    }, [primaryLayer?.geoData, primaryLayer?.dataView, primaryLayer?.layerType, colorPalette, colorMapping]);

    useGeoPushData(colorStrategy, colorPalette, {
        useProps: useGeoChartProps,
        useLegendContext: () => ({
            availableLegends: availableLegends ?? {
                hasCategoryLegend: false,
                hasColorLegend: false,
            },
        }),
        geoLayerType,
    });

    return null;
}
