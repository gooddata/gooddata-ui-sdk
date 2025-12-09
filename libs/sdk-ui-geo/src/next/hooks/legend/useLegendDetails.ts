// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { ContentRect } from "react-measure";

import {
    ILegendDetails,
    PositionType,
    SupportedLegendPositions,
    getLegendDetails,
} from "@gooddata/sdk-ui-vis-commons";

import { IGeoChartNextConfig } from "../../types/config/unified.js";
import { IGeoCommonData } from "../../types/geoData/common.js";

/**
 * Hook to extract legend details from configuration.
 *
 * @remarks
 * This hook uses the `getLegendDetails` function from vis-commons to determine:
 * - Legend position (computed based on responsive config and container size)
 * - Whether to render popup legend (`renderPopUp`) - true when width less than 610px with autoPositionWithPopup
 * - Maximum rows for popup collapsed state (`maxRows`) - 1 or 2 based on height
 * - Dialog title (`name`) - from segment attribute name
 *
 * The popup legend is triggered when:
 * - Config has `legend.responsive: "autoPositionWithPopup"`
 * - Container width less than 610px (narrow) OR position is top/bottom
 *
 * @param config - Geo pushpin chart configuration
 * @param geoData - Geographic data containing segment information
 * @param contentRect - Container dimensions from react-measure
 * @returns Legend details or null if cannot be determined
 *
 * @alpha
 */
export function useLegendDetails(
    config: IGeoChartNextConfig | undefined,
    geoData: IGeoCommonData | null,
    contentRect: ContentRect | undefined,
): ILegendDetails | null {
    return useMemo(() => {
        const rawPosition = config?.legend?.position;
        const normalizedPosition: PositionType =
            rawPosition && SupportedLegendPositions.includes(rawPosition) ? rawPosition : "top";
        const effectivePosition = rawPosition ?? "auto";
        const responsive = config?.legend?.responsive;
        const legendLabel = geoData?.segment?.name;

        // Default respectLegendPosition to true when position is explicitly set (not "auto")
        // This prevents autoPositionWithPopup from overriding explicit positions
        const respectLegendPosition =
            config?.respectLegendPosition ?? (effectivePosition === "auto" ? undefined : true);

        return getLegendDetails(
            normalizedPosition,
            responsive ?? false,
            { contentRect, legendLabel },
            respectLegendPosition,
        );
    }, [
        config?.legend?.position,
        config?.legend?.responsive,
        config?.respectLegendPosition,
        geoData?.segment?.name,
        contentRect,
    ]);
}
