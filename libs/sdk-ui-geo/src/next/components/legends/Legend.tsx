// (C) 2025 GoodData Corporation

import { ReactElement, useMemo } from "react";

import { ContentRect } from "react-measure";

import { IColorStrategy, IPushpinCategoryLegendItem } from "@gooddata/sdk-ui-vis-commons";

import { LegendBody } from "./LegendBody.js";
import { type ILegendBodyProps } from "./types.js";
import { useGeoData } from "../../context/GeoDataContext.js";
import { useLegendConfig } from "../../hooks/legend/useLegendConfig.js";
import { useLegendDetails } from "../../hooks/legend/useLegendDetails.js";
import { useLegendItemClick } from "../../hooks/legend/useLegendItemClick.js";
import { IGeoPushpinChartNextConfig } from "../../types/config.js";

/**
 * Props for Legend component.
 *
 * @alpha
 */
export interface ILegendProps {
    colorStrategy: IColorStrategy | null;
    config: IGeoPushpinChartNextConfig | undefined;
    categoryItems: IPushpinCategoryLegendItem[];
    containerId: string;
    chartContainerRect?: ContentRect;
}

/**
 * Orchestrates legend rendering by preparing props and delegating to the proven
 * GeoChartLegendRenderer implementation (via LegendBody adapter).
 *
 * This component bridges the new chart's context-based architecture with the
 * old legend implementation, ensuring consistent and reliable legend behavior.
 *
 * Note: The old GeoChartLegendRenderer handles its own measurement and container
 * styling, so we don't need LegendLayout wrapper here.
 */
export function Legend({
    colorStrategy,
    config,
    categoryItems,
    containerId,
    chartContainerRect,
}: ILegendProps): ReactElement | null {
    const legendConfig = useLegendConfig(config);
    const { geoData, availableLegends } = useGeoData();

    const colorLegendValue = colorStrategy?.getColorByIndex(0) ?? null;
    const categoryItemUris = useMemo(() => categoryItems.map((item) => item.uri), [categoryItems]);
    const handleCategoryLegendItemClick = useLegendItemClick(categoryItemUris);

    // Use chart container dimensions for responsive legend behavior (popup mode detection)
    const legendDetails = useLegendDetails(config, geoData, chartContainerRect);

    // Check if legend should be shown at all
    const { hasCategoryLegend, hasColorLegend, hasSizeLegend } = availableLegends;
    const hasAnyLegend = hasCategoryLegend || hasColorLegend || hasSizeLegend;

    if (!legendConfig.enabled || !hasAnyLegend) {
        return null;
    }

    // The old renderer uses chartContainerRect dimensions directly
    const legendWidth = chartContainerRect?.client?.width ?? 800;
    const legendHeight = chartContainerRect?.client?.height ?? 400;

    // Fluid layout is ONLY used when responsive === true (not for "autoPositionWithPopup")
    // This matches the old implementation's isFluidLegend logic
    const isFluidLayout = legendConfig.responsive === true;

    const legendBodyProps: ILegendBodyProps = {
        containerId,
        legendDetails,
        categoryItems,
        geoData,
        availableLegends,
        colorLegendValue,
        legendWidth,
        legendHeight,
        isFluidLayout,
        responsive: legendConfig.responsive,
        onCategoryItemClick: handleCategoryLegendItemClick,
    };

    return <LegendBody {...legendBodyProps} />;
}
