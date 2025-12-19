// (C) 2025 GoodData Corporation

import { useEffect, useMemo } from "react";

import { type IColorPalette } from "@gooddata/sdk-model";
import { type IPushData, getMultiLayerDrillTargets } from "@gooddata/sdk-ui";
import { type IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { useGeoLayers } from "../../context/GeoLayersContext.js";
import { useInitialExecution } from "../../context/InitialExecutionContext.js";
import { type IAvailableLegends } from "../../types/common/legends.js";

interface ILegendContext {
    availableLegends: IAvailableLegends;
}

/**
 * Minimal props interface required for pushData functionality
 *
 * @internal
 */
interface IPushDataProps {
    pushData?: (data: IPushData) => void;
}

interface IUseGeoPushDataConfig<TProps extends IPushDataProps, TLegendContext extends ILegendContext> {
    useProps: () => TProps;
    useLegendContext: () => TLegendContext;
    getLegendVisibility?: (availableLegends: IAvailableLegends) => boolean;
}

const defaultLegendVisibility = (availableLegends: IAvailableLegends): boolean => {
    const hasSizeLegend = availableLegends.hasSizeLegend ?? false;
    return Boolean(availableLegends.hasCategoryLegend || availableLegends.hasColorLegend || hasSizeLegend);
};

/**
 * Shared implementation for Analytical Designer pushData updates.
 *
 * @internal
 */
export function useGeoPushData<TProps extends IPushDataProps, TLegendContext extends ILegendContext>(
    colorStrategy: IColorStrategy | null,
    colorPalette: IColorPalette,
    { useProps, useLegendContext, getLegendVisibility }: IUseGeoPushDataConfig<TProps, TLegendContext>,
): void {
    const props = useProps();
    const { availableLegends } = useLegendContext();
    const { initialDataView } = useInitialExecution();
    const { layers } = useGeoLayers();
    const { pushData } = props;
    const legendVisibilitySelector = getLegendVisibility ?? defaultLegendVisibility;

    const isLegendVisible = legendVisibilitySelector(availableLegends);

    // Build drill targets from all layers (combines measures from all layers)
    const layerDataViews = Array.from(layers.values()).map((l) => l.dataView);
    const fingerprintsKey = layerDataViews.map((dv) => dv?.fingerprint() ?? "null").join("|");

    // Use fingerprints key as dependency
    // We can't use layers as dependency because they are not stable across renders resulting in infinite loop
    const availableDrillTargets = useMemo(() => {
        return getMultiLayerDrillTargets(layerDataViews, initialDataView);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fingerprintsKey, initialDataView]);

    useEffect(() => {
        if (!pushData || !colorStrategy) {
            return;
        }

        pushData({
            dataView: initialDataView?.dataView,
            availableDrillTargets,
            propertiesMeta: {
                legend_enabled: isLegendVisible,
            },
            colors: {
                colorAssignments: colorStrategy.getColorAssignment(),
                colorPalette,
            },
        });
    }, [pushData, colorStrategy, colorPalette, initialDataView, isLegendVisible, availableDrillTargets]);
}
