// (C) 2025 GoodData Corporation

import { useEffect } from "react";

import { IColorPalette } from "@gooddata/sdk-model";
import { IDataVisualizationProps } from "@gooddata/sdk-ui";
import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { useInitialExecution } from "../../context/InitialExecutionContext.js";
import { IAvailableLegends } from "../../types/shared.js";

interface ILegendContext {
    availableLegends: IAvailableLegends;
}

interface IUseGeoPushDataConfig<
    TProps extends IDataVisualizationProps,
    TLegendContext extends ILegendContext,
> {
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
export function useGeoPushData<TProps extends IDataVisualizationProps, TLegendContext extends ILegendContext>(
    colorStrategy: IColorStrategy | null,
    colorPalette: IColorPalette,
    { useProps, useLegendContext, getLegendVisibility }: IUseGeoPushDataConfig<TProps, TLegendContext>,
): void {
    const props = useProps();
    const { availableLegends } = useLegendContext();
    const { initialDataView } = useInitialExecution();
    const { pushData } = props;
    const legendVisibilitySelector = getLegendVisibility ?? defaultLegendVisibility;

    const isLegendVisible = legendVisibilitySelector(availableLegends);

    useEffect(() => {
        if (!pushData || !colorStrategy) {
            return;
        }

        pushData({
            dataView: initialDataView?.dataView,
            propertiesMeta: {
                legend_enabled: isLegendVisible,
            },
            colors: {
                colorAssignments: colorStrategy.getColorAssignment(),
                colorPalette,
            },
        });
    }, [pushData, availableLegends, colorStrategy, colorPalette, initialDataView, isLegendVisible]);
}
