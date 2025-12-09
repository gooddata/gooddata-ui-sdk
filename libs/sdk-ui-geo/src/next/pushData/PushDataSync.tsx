// (C) 2025 GoodData Corporation

import { ReactElement } from "react";

import { IColorPalette } from "@gooddata/sdk-model";
import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { useGeoChartNextProps } from "../context/GeoChartNextContext.js";
import { useGeoPushData } from "../hooks/pushData/useGeoPushData.js";
import { IAvailableLegends } from "../types/common/legends.js";

type PushDataSyncProps = {
    colorStrategy: IColorStrategy | null;
    colorPalette: IColorPalette;
    availableLegends?: IAvailableLegends;
};

export function PushDataSync({
    colorStrategy,
    colorPalette,
    availableLegends,
}: PushDataSyncProps): ReactElement | null {
    useGeoPushData(colorStrategy, colorPalette, {
        useProps: useGeoChartNextProps,
        useLegendContext: () => ({
            availableLegends: availableLegends ?? {
                hasCategoryLegend: false,
                hasColorLegend: false,
            },
        }),
    });

    return null;
}
