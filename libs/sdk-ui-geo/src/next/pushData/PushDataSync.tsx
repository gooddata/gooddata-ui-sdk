// (C) 2025-2026 GoodData Corporation

import { type ReactElement } from "react";

import { type IColorPalette } from "@gooddata/sdk-model";
import { type IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { useGeoChartNextProps } from "../context/GeoChartNextContext.js";
import { useGeoPushData } from "../hooks/pushData/useGeoPushData.js";
import { type IAvailableLegends } from "../types/common/legends.js";
import { type GeoLayerType } from "../types/layers/index.js";

type PushDataSyncProps = {
    colorStrategy: IColorStrategy | null;
    colorPalette: IColorPalette;
    availableLegends?: IAvailableLegends;
    geoLayerType: GeoLayerType;
};

export function PushDataSync({
    colorStrategy,
    colorPalette,
    availableLegends,
    geoLayerType,
}: PushDataSyncProps): ReactElement | null {
    useGeoPushData(colorStrategy, colorPalette, {
        useProps: useGeoChartNextProps,
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
