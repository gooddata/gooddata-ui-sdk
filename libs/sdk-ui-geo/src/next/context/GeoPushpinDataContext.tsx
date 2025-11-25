// (C) 2025 GoodData Corporation

import { ReactNode, useMemo } from "react";

import { DefaultColorPalette } from "@gooddata/sdk-ui";
import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { GeoDataContextProvider, IGeoDataContext } from "./GeoDataContext.js";
import { useGeoPushpinProps } from "./GeoPushpinPropsContext.js";
import { useInitialExecution } from "./InitialExecutionContext.js";
import { getColorStrategy } from "../features/coloring/colorStrategy.js";
import { getPushpinAvailableLegends } from "../features/data/pushpinTransformation.js";
import { usePushpinLegendItems } from "../hooks/legend/usePushpinLegendItems.js";
import { usePushpinDataTransformation } from "../hooks/shared/usePushpinDataTransformation.js";
import { IAvailableLegends, IPushpinGeoData } from "../types/shared.js";

const EMPTY_AVAILABLE_LEGENDS: IAvailableLegends = {
    hasCategoryLegend: false,
    hasColorLegend: false,
    hasSizeLegend: false,
};

/**
 * Provider that computes pushpin-specific geo data and exposes it through {@link useGeoData}.
 *
 * @remarks
 * All computations are memoized so the derived values are calculated only when the execution result
 * changes.
 *
 * @alpha
 */
export function GeoPushpinDataProvider({ children }: { children: ReactNode }) {
    const props = useGeoPushpinProps();
    const { initialDataView } = useInitialExecution();

    const geoData = usePushpinDataTransformation(initialDataView);

    const colorPalette = useMemo(
        () => props.config?.colorPalette || DefaultColorPalette,
        [props.config?.colorPalette],
    );
    const colorMapping = useMemo(() => props.config?.colorMapping || [], [props.config?.colorMapping]);
    const colorStrategy = useMemo<IColorStrategy | null>(
        () =>
            geoData && initialDataView
                ? getColorStrategy(colorPalette, colorMapping, geoData, initialDataView)
                : null,
        [colorPalette, colorMapping, geoData, initialDataView],
    );

    const baseLegendItems = usePushpinLegendItems(initialDataView, geoData, colorStrategy);

    const availableLegends = useMemo(() => {
        if (!geoData) {
            return EMPTY_AVAILABLE_LEGENDS;
        }
        return getPushpinAvailableLegends(baseLegendItems, geoData);
    }, [baseLegendItems, geoData]);

    const value = useMemo<IGeoDataContext<IPushpinGeoData>>(
        () => ({
            geoData,
            colorStrategy,
            colorPalette,
            baseLegendItems,
            availableLegends,
        }),
        [geoData, colorStrategy, colorPalette, baseLegendItems, availableLegends],
    );

    return <GeoDataContextProvider value={value}>{children}</GeoDataContextProvider>;
}
