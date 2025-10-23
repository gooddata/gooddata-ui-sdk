// (C) 2025 GoodData Corporation

import { useEffect } from "react";

import { IColorPalette } from "@gooddata/sdk-model";
import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { useGeoData } from "../../context/GeoDataContext.js";
import { useGeoPushpinProps } from "../../context/GeoPushpinPropsContext.js";
import { useInitialExecution } from "../../context/InitialExecutionContext.js";

/**
 * Hook to push data to analytical designer for configuration panel updates
 * @internal
 */
export function usePushData(colorStrategy: IColorStrategy | null, colorPalette: IColorPalette): void {
    const props = useGeoPushpinProps();
    const { availableLegends } = useGeoData();
    const { initialDataView } = useInitialExecution();
    const { pushData } = props;

    useEffect(() => {
        if (!pushData || !colorStrategy) {
            return;
        }

        // Check if legend should be visible
        const isLegendVisible =
            availableLegends.hasCategoryLegend ||
            availableLegends.hasColorLegend ||
            availableLegends.hasSizeLegend;

        pushData({
            dataView: initialDataView?.dataView,
            propertiesMeta: {
                // toggle legend section
                legend_enabled: isLegendVisible,
            },
            colors: {
                colorAssignments: colorStrategy.getColorAssignment(),
                colorPalette,
            },
        });
    }, [pushData, availableLegends, colorStrategy, colorPalette, initialDataView]);
}
