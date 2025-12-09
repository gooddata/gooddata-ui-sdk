// (C) 2025 GoodData Corporation

import { ContentRect } from "react-measure";

import { IColorStrategy, PositionType } from "@gooddata/sdk-ui-vis-commons";

import { useLegendConfig } from "./useLegendConfig.js";
import { useLegendDetails } from "./useLegendDetails.js";
import { useLegendItemsWithState } from "./useLegendItemsWithState.js";
import { useSelectedSegments } from "./useSelectedSegments.js";
import { type IGeoLayerData, useGeoLayers } from "../../context/GeoLayersContext.js";
import { IGeoLegendItem } from "../../types/common/legends.js";
import { IGeoChartNextConfig } from "../../types/config/unified.js";
import { IGeoCommonData } from "../../types/geoData/common.js";

/**
 * Result of useLegendRenderState hook
 *
 * @internal
 */
export interface ILegendRenderState {
    /** Primary layer data for legend */
    primaryLayer: IGeoLayerData | null;
    /** Geo data from primary layer */
    geoData: IGeoCommonData | null;
    /** Color strategy from primary layer */
    colorStrategy: IColorStrategy | null;
    /** Legend items with visibility state */
    legendItems: IGeoLegendItem[];
    /** Selected segment items for filtering */
    selectedSegmentItems: string[];
    /** Computed legend position */
    position: PositionType;
    /** Whether legend should render before map */
    isLegendRenderedFirst: boolean;
    /** Whether layout is row-based (left/right position) */
    isRow: boolean;
}

/**
 * Hook that consolidates legend-related state and computations.
 *
 * @remarks
 * Extracts and combines multiple legend-related hooks into a single result object,
 * reducing boilerplate in the render component and improving readability.
 *
 * @param config - Chart configuration
 * @param chartContainerRect - Container dimensions for responsive behavior
 * @returns Consolidated legend render state
 *
 * @internal
 */
export function useLegendRenderState(
    config: IGeoChartNextConfig | undefined,
    chartContainerRect: ContentRect | null,
): ILegendRenderState {
    const { primaryLayer } = useGeoLayers();

    const geoData = primaryLayer?.geoData ?? null;
    const colorStrategy = primaryLayer?.colorStrategy ?? null;
    const baseLegendItems = primaryLayer?.baseLegendItems ?? [];

    const legendItems = useLegendItemsWithState(baseLegendItems);
    const selectedSegmentItems = useSelectedSegments(legendItems);
    const legendConfig = useLegendConfig(config);
    const legendDetails = useLegendDetails(config, geoData, chartContainerRect ?? undefined);
    const position = legendDetails?.position ?? legendConfig.position;

    const isLegendRenderedFirst = position === "top" || position === "left";
    const isRow = position === "left" || position === "right";

    return {
        primaryLayer,
        geoData,
        colorStrategy,
        legendItems,
        selectedSegmentItems,
        position,
        isLegendRenderedFirst,
        isRow,
    };
}
